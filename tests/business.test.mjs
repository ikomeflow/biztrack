import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyLedger,validateLedger,invoiceSummary,invoiceSummaries,businessSummary,recordInvoicePayment,sixMonthSeries,previousPeriodComparison,totals,demoLedger,backupDue,csv} from '../dist/core-v2.mjs';
import * as legacy from '../dist/core.mjs';
const customer={id:'customer-a',name:'A shop',email:'shop@example.com',phone:'+237 600000000'};
const invoice={id:'invoice-a',number:'INV-001',customerId:customer.id,description:'Goods supplied',amount:10000,currency:'XAF',date:'2026-10-01',dueDate:'2026-10-15',payments:[]};
const fixture=()=>({...emptyLedger(),customers:[customer],invoices:[invoice]});
const clone=value=>JSON.parse(JSON.stringify(value));
test('legacy schema upgrades in memory without changing amounts, descriptions or source',()=>{
 const source=legacy.demoLedger(),before=JSON.stringify(source),next=validateLedger(source);
 assert.equal(next.schema,2);assert.deepEqual(next.entries,source.entries);assert.deepEqual(next.customers,[]);assert.deepEqual(next.invoices,[]);assert.equal(JSON.stringify(source),before);
 assert.throws(()=>legacy.validateLedger(next),/supported/);
});
test('invoice payments enter cash sales once, with partial, overdue and paid balances',()=>{
 const original=fixture(),before=JSON.stringify(original);let ledger=recordInvoicePayment(original,invoice.id,{id:'payment-a',amount:3500,date:'2026-10-02'});
 assert.equal(JSON.stringify(original),before);assert.equal(totals(ledger.entries).sales,3500);
 assert.deepEqual(invoiceSummary(ledger,ledger.invoices[0],'2026-10-15'),{paid:3500,balance:6500,status:'partial'});
 assert.deepEqual(invoiceSummary(ledger,ledger.invoices[0],'2026-10-16'),{paid:3500,balance:6500,status:'overdue'});
 assert.deepEqual(businessSummary(ledger,'XAF','2026-10-16'),{outstanding:6500,overdue:6500,invoiceCount:1});
 assert.deepEqual(businessSummary(ledger,'USD','2026-10-16'),{outstanding:0,overdue:0,invoiceCount:0});
 ledger=recordInvoicePayment(ledger,invoice.id,{id:'payment-b',amount:6500,date:'2026-10-16'});
 assert.equal(totals(ledger.entries).sales,10000);assert.equal(invoiceSummary(ledger,ledger.invoices[0],'2026-10-17').status,'paid');
 assert.throws(()=>recordInvoicePayment(ledger,invoice.id,{id:'extra',amount:1,date:'2026-10-17'}),/exceeds/);
});
test('invalid customers and invoice identity, dates, currencies and amounts reject entire import',()=>{
 for(const patch of [{id:''},{number:' '},{customerId:'missing'},{currency:'__proto__'},{amount:1.5},{amount:0},{amount:100000000000000},{date:'2026-02-30'},{dueDate:'2026-09-30'},{payments:null}]){
  assert.throws(()=>validateLedger({...fixture(),invoices:[{...invoice,...patch}]}),JSON.stringify(patch));
 }
 assert.throws(()=>validateLedger({...fixture(),customers:[customer,{...customer}]}));
 assert.throws(()=>validateLedger({...fixture(),customers:[{...customer,email:'not-an-email'}]}));
 assert.throws(()=>validateLedger({...fixture(),invoices:[invoice,{...invoice,id:'other',number:'inv-001'}]}));
 assert.throws(()=>validateLedger({...fixture(),invoices:[invoice,{...invoice,id:'other',number:'INV-002',customerId:'none'}]}));
});
test('payment references cannot be orphaned, reused, deleted, converted to expense or overpaid',()=>{
 const paid=recordInvoicePayment(fixture(),invoice.id,{id:'payment-a',amount:3500,date:'2026-10-02'});
 for(const patch of [{invoiceId:'missing'},{customerId:'missing'},{currency:'USD'},{type:'expense',category:'Transport'},{date:'2026-09-01'},{amount:10001}]){
  assert.throws(()=>validateLedger({...paid,entries:[{...paid.entries[0],...patch}]}),JSON.stringify(patch));
 }
 assert.throws(()=>validateLedger({...paid,entries:[]}));
 assert.throws(()=>validateLedger({...paid,invoices:[{...paid.invoices[0],payments:[]}]}));
 assert.throws(()=>validateLedger({...paid,invoices:[{...paid.invoices[0],payments:[...paid.invoices[0].payments,{id:'another',entryId:'payment-a'}]}]}));
 assert.throws(()=>validateLedger({...paid,customers:[]}));
 assert.throws(()=>recordInvoicePayment(paid,invoice.id,{id:'payment-a',amount:200,date:'2026-10-02'}));
 assert.throws(()=>recordInvoicePayment(paid,invoice.id,{id:'new',amount:6501,date:'2026-10-02'}));
 assert.throws(()=>recordInvoicePayment(paid,invoice.id,{id:'new',amount:200,date:'2026-09-30'}));
});
test('unknown schema2 data fails closed rather than truncating newer records',()=>{
 assert.throws(()=>validateLedger({...fixture(),suppliers:[]}));
 assert.throws(()=>validateLedger({...fixture(),customers:[{...customer,address:'Future field'}]}));
 assert.throws(()=>validateLedger({...fixture(),invoices:[{...invoice,tax:20}]}));
 const paid=recordInvoicePayment(fixture(),invoice.id,{id:'payment-a',amount:100,date:'2026-10-01'});
 assert.throws(()=>validateLedger({...paid,entries:[{...paid.entries[0],tax:20}]}));
 assert.throws(()=>validateLedger({...fixture(),schema:3}));
});
test('large outstanding totals and sales cannot overflow safe integer arithmetic',()=>{
 const many=Array.from({length:100},(_,i)=>({...invoice,id:`invoice-${i}`,number:`INV-${i}`,amount:99999999999999}));
 assert.throws(()=>validateLedger({...fixture(),invoices:many}),/large/);
 const hugeSales=Array.from({length:100},(_,i)=>({id:`sale-${i}`,type:'sale',currency:'XAF',amount:99999999999999,date:'2026-10-01',description:'Big',category:'Other sales'}));
 assert.throws(()=>validateLedger({...emptyLedger(),entries:hugeSales}),/large/);
});
test('six calendar months include empty periods and isolate currencies across year boundaries',()=>{
 const entry=(date,amount,currency='XAF')=>({date,amount,currency,type:'sale'}),series=sixMonthSeries([entry('2025-12-31',500),entry('2026-01-01',300),entry('2026-01-01',999,'USD')],'2026-02','XAF');
 assert.deepEqual(series.map(value=>value.month),['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02']);
 assert.deepEqual(series.map(value=>value.sales),[0,0,0,500,300,0]);
 assert.equal(sixMonthSeries([],'1900-01','XAF').length,1);
 assert.throws(()=>sixMonthSeries([],'2026-13','XAF'));
});
test('period comparisons use absolute net changes and handle zero and negative periods',()=>{
 const entries=[{date:'2026-10-01',currency:'XAF',type:'sale',amount:500},{date:'2026-09-30',currency:'XAF',type:'expense',amount:100},{date:'2026-10-01',currency:'USD',type:'sale',amount:999}];
 assert.deepEqual(previousPeriodComparison(entries,{period:'month',month:'2026-10',currency:'XAF',referenceDate:'2026-10-01'}),{current:500,previous:-100,change:600,label:'vs previous month'});
 assert.deepEqual(previousPeriodComparison(entries,{period:'today',month:'2026-10',currency:'XAF',referenceDate:'2026-10-01'}),{current:500,previous:-100,change:600,label:'vs yesterday'});
 assert.equal(previousPeriodComparison(entries,{period:'all',month:'2026-10',currency:'XAF'}),null);
 assert.equal(previousPeriodComparison(entries,{period:'month',month:'1900-01',currency:'XAF'}),null);
});
test('an optional comparison exceeding safe integer precision does not hide valid period totals',()=>{
 const entries=Array.from({length:90},(_,i)=>({id:`sale-${i}`,date:'2026-10-01',currency:'XAF',type:'sale',amount:99999999999999,description:'Large sale',category:'Other sales'})).concat(Array.from({length:90},(_,i)=>({id:`expense-${i}`,date:'2026-09-30',currency:'XAF',type:'expense',amount:99999999999999,description:'Large expense',category:'Other expenses'})));
 assert.equal(validateLedger({...emptyLedger(),entries}).entries.length,180);
 const current=totals(entries.filter(entry=>entry.type==='sale')).profit,previous=totals(entries.filter(entry=>entry.type==='expense')).profit;
 assert.ok(Number.isSafeInteger(current));assert.ok(Number.isSafeInteger(previous));assert.equal(Number.isSafeInteger(current-previous),false);
 assert.equal(previousPeriodComparison(entries,{period:'month',month:'2026-10',currency:'XAF',referenceDate:'2026-10-01'}),null);
 assert.equal(previousPeriodComparison(entries,{period:'today',month:'2026-10',currency:'XAF',referenceDate:'2026-10-01'}),null);
});
test('demo business is isolated, valid and contains a partially paid sample invoice',()=>{
 const demo=demoLedger();assert.deepEqual(validateLedger(clone(demo)),demo);assert.equal(demo.customers.length,1);assert.equal(invoiceSummary(demo,demo.invoices[0]).balance,100000);assert.equal(emptyLedger().entries.length,0);
});
test('backup reminders cover invoice-only businesses as well as transactions',()=>{
 assert.equal(backupDue(fixture(),'2026-10-09'),true);assert.equal(backupDue({...fixture(),lastBackup:'2026-10-08'},'2026-10-09'),false);assert.equal(backupDue(emptyLedger(),'2026-10-09'),false);
});
test('editing customer and ordinary transaction preserves invoices and payment links in backups',()=>{
 const paid=recordInvoicePayment(fixture(),invoice.id,{id:'payment-a',amount:3500,date:'2026-10-02'});
 const ordinary={id:'ordinary',type:'sale',currency:'XAF',amount:2000,date:'2026-10-03',description:'Walk-in sale',category:'Product sales',customerId:customer.id};
 const edited=validateLedger({...paid,customers:[{...customer,name:'Renamed business'}],entries:[...paid.entries,{...ordinary,description:'Updated walk-in sale'}]});
 const restored=validateLedger(JSON.parse(JSON.stringify({...edited,lastBackup:'2026-10-04'})));
 assert.deepEqual(restored.invoices,paid.invoices);assert.deepEqual(restored.entries[0],paid.entries[0]);assert.equal(restored.entries[1].customerId,customer.id);assert.equal(restored.customers[0].name,'Renamed business');assert.equal(invoiceSummary(restored,restored.invoices[0]).paid,3500);
});
test('explicit payment removal must remove both the sale and its invoice link atomically',()=>{
 const paid=recordInvoicePayment(fixture(),invoice.id,{id:'payment-a',amount:3500,date:'2026-10-02'});
 const removed=validateLedger({...paid,entries:paid.entries.filter(entry=>entry.id!=='payment-a'),invoices:paid.invoices.map(item=>({...item,payments:item.payments.filter(payment=>payment.entryId!=='payment-a')}))});
 assert.equal(totals(removed.entries).sales,0);assert.deepEqual(invoiceSummary(removed,removed.invoices[0],'2026-10-03'),{paid:0,balance:10000,status:'unpaid'});
 assert.throws(()=>validateLedger({...paid,entries:[]}),/payment/);assert.throws(()=>validateLedger({...paid,invoices:[{...invoice,payments:[]}]}),/link/);
});
test('bulk invoice summaries match individual results using one entries index',()=>{
 let ledger={...fixture(),invoices:[invoice,{...invoice,id:'invoice-b',number:'INV-002',currency:'USD',dueDate:'2026-10-30'},{...invoice,id:'invoice-c',number:'INV-003',dueDate:'2026-10-30'}]};
 ledger=recordInvoicePayment(ledger,invoice.id,{id:'payment-a',amount:3500,date:'2026-10-02'});
 ledger=recordInvoicePayment(ledger,'invoice-b',{id:'payment-b',amount:10000,date:'2026-10-02'});
 let indexed=0;const entries=ledger.entries;
 ledger={...ledger,entries:{map(callback){indexed++;return entries.map(callback);}}};
 const summaries=invoiceSummaries(ledger,'2026-10-16');assert.equal(indexed,1);assert.equal(summaries.size,3);
 for(const item of ledger.invoices)assert.deepEqual(summaries.get(item.id),invoiceSummary({...ledger,entries},item,'2026-10-16'));
 assert.equal(summaries.get('invoice-a').status,'overdue');assert.equal(summaries.get('invoice-b').status,'paid');assert.equal(summaries.get('invoice-c').status,'unpaid');
 assert.throws(()=>invoiceSummaries({...ledger,entries},'2026-02-30'),/reference date/);
});
test('business CSV labels the net cash footer without changing a NET PROFIT description',()=>{
 const entries=[{id:'sale',type:'sale',currency:'XAF',amount:2000,date:'2026-10-03',description:'NET PROFIT',category:'Product sales'},{id:'expense',type:'expense',currency:'XAF',amount:500,date:'2026-10-03',description:'Text with\r\n"NET PROFIT", inside',category:'Other expenses'}];
 const source=csv(entries,'XAF');
 assert.ok(source.includes('"2026-10-03","sale","NET PROFIT",'));
 assert.ok(source.includes('"Text with\r\n""NET PROFIT"", inside"'));
 assert.ok(source.endsWith('"NET CASH","","","","XAF","1500",""'));
 assert.equal(source,legacy.csv(entries,'XAF').replace(/\r\n"NET PROFIT",(?="","","","XAF","1500",""$)/,'\r\n"NET CASH",'));
});
