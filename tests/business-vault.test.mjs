import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LedgerVault} from '../dist/vault-v2.mjs';
import {LedgerVault as LegacyVault} from '../dist/vault.mjs';
import {emptyLedger,STORAGE_KEY,recordInvoicePayment,validateLedger} from '../dist/core-v2.mjs';
import {demoLedger as legacyDemo} from '../dist/core.mjs';
function setup(value){const map=new Map(value?[[STORAGE_KEY,JSON.stringify(value)]]:[]),storage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};return {map,storage};}
const business=()=>({...emptyLedger(),customers:[{id:'customer',name:'Private customer',email:'private@example.com',phone:'1234'}],invoices:[{id:'invoice',number:'INV-1',customerId:'customer',description:'Private invoice',amount:10000,currency:'XAF',date:'2026-10-01',dueDate:'2026-10-10',payments:[]}]});
test('reading encrypted legacy data preserves original bytes, PIN, recovery and transactions',async()=>{
 const source=legacyDemo(),{storage}=setup(source),old=new LegacyVault(storage);old.load();const recovery=await old.setPin('0123',source),before=storage.getItem(STORAGE_KEY);
 const updated=new LedgerVault(storage);updated.load();const unlocked=await updated.unlock('0123');assert.equal(storage.getItem(STORAGE_KEY),before);assert.deepEqual(unlocked.entries,source.entries);assert.equal(unlocked.schema,2);
 updated.lock();const reset=await updated.prepareSimpleReset(recovery,'1234');assert.equal(storage.getItem(STORAGE_KEY),before);const restored=updated.commitPrepared(reset);assert.deepEqual(restored.entries,source.entries);
 updated.lock();assert.deepEqual((await updated.unlock('1234')).entries,source.entries);
});
test('new customers, invoices and payments round-trip encrypted while old releases reject schema2',async()=>{
 const state=recordInvoicePayment(business(),'invoice',{id:'payment',amount:2500,date:'2026-10-02'}),{storage}=setup(),vault=new LedgerVault(storage);vault.load();const recovery=await vault.setPin('5678',state),before=storage.getItem(STORAGE_KEY);
 for(const secret of ['Private customer','Private invoice','private@example.com','INV-1'])assert.ok(!before.includes(secret));
 vault.lock();await assert.rejects(vault.unlock('0000'),/Incorrect/);assert.equal(storage.getItem(STORAGE_KEY),before);assert.deepEqual(await vault.unlock('5678'),state);
 const old=new LegacyVault(storage);old.load();await assert.rejects(old.unlock('5678'),/Incorrect/);assert.equal(storage.getItem(STORAGE_KEY),before);
 vault.lock();assert.deepEqual(vault.commitPrepared(await vault.prepareSimpleReset(recovery,'9876')),state);vault.lock();assert.deepEqual(await vault.unlock('9876'),state);
});
test('failed invoice payment writes leave the encrypted ledger and balances untouched',async()=>{
 const {storage}=setup(),vault=new LedgerVault(storage);vault.load();vault.commitPrepared(await vault.prepareSimplePin('5678',business()));const before=storage.getItem(STORAGE_KEY),write=storage.setItem;
 storage.setItem=()=>{throw Error('Quota exceeded');};await assert.rejects(vault.save(recordInvoicePayment(business(),'invoice',{id:'payment',amount:5000,date:'2026-10-02'})),/Quota/);assert.equal(storage.getItem(STORAGE_KEY),before);
 storage.setItem=write;vault.load();assert.deepEqual(await vault.unlock('5678'),business());
});
test('a stale browser cannot overwrite a more recent payment or re-save schema1',async()=>{
 const {storage}=setup(),first=new LedgerVault(storage);first.load();await first.setPin('5678',business());const stale=new LedgerVault(storage);stale.load();await stale.unlock('5678');
 const latest=recordInvoicePayment(business(),'invoice',{id:'first',amount:3000,date:'2026-10-02'});await first.save(latest);const before=storage.getItem(STORAGE_KEY);
 await assert.rejects(stale.save(recordInvoicePayment(business(),'invoice',{id:'stale',amount:3000,date:'2026-10-02'})),/changed or locked/);assert.equal(storage.getItem(STORAGE_KEY),before);
 first.load();assert.deepEqual(await first.unlock('5678'),validateLedger(latest));
});
