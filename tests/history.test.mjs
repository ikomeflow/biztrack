import {test} from 'node:test';
import assert from 'node:assert/strict';
import {money,amountText,selectEntries,replaceEntry,restoreDeletions,backupDue,emptyLedger,validateLedger,csv} from '../dist/core.mjs';
const entry=(id,patch={})=>({id,date:'2026-10-30',currency:'XAF',type:'sale',category:'Product sales',amount:100,description:id,...patch});

test('same-day history uses insertion order, not random ID order, and never mutates records',()=>{
 const rows=[entry('z-older'),entry('a-newer'),entry('last',{date:'2026-10-29'})],before=structuredClone(rows);
 assert.deepEqual(selectEntries(rows).map(e=>e.id),['a-newer','z-older','last']);assert.deepEqual(rows,before);
 const changed=replaceEntry(rows,{...rows[0],description:'Edited older'});
 assert.deepEqual(selectEntries(changed).map(e=>e.id),['a-newer','z-older','last']);assert.equal(changed[0].description,'Edited older');
 assert.deepEqual(selectEntries(replaceEntry(changed,entry('b-latest'))).map(e=>e.id),['b-latest','a-newer','z-older','last']);
 assert.deepEqual(validateLedger({...emptyLedger(),entries:changed}).entries,changed);
});
test('history filters and exports include all 250 matches across display pages',()=>{
 const rows=Array.from({length:250},(_,i)=>entry('row-'+i));rows.push(entry('usd',{currency:'USD'}),entry('expense',{type:'expense',category:'Transport'}));
 const selected=selectEntries(rows,{currency:'XAF',type:'sale',search:'row-',from:'2026-10-01',to:'2026-10-31'});
 assert.equal(selected.length,250);assert.equal(selected[0].id,'row-249');assert.equal(selected.at(-1).id,'row-0');
 const text=csv(selected,'XAF');assert.equal(text.split('\r\n').filter(line=>line.includes('"sale"')).length,250);assert.ok(!text.includes('"usd"'));
});
test('decimal display and CSV preserve every minor unit at large safe totals',()=>{
 assert.equal(money(9007199254740901,'USD'),'USD 90,071,992,547,409.01');assert.equal(money(-9007199254740901,'USD'),'USD -90,071,992,547,409.01');
 assert.equal(amountText(123456,'XAF'),'123,456');assert.equal(amountText(123456,'XOF'),'123,456');assert.equal(amountText(123456,'USD'),'1,234.56');assert.equal(amountText(123456,'USD',false),'1234.56');
 assert.equal(amountText(0,'XAF'),'0');assert.equal(amountText(0,'USD'),'0.00');assert.throws(()=>money(1.1,'USD'));assert.throws(()=>money(1,'BAD'));
 const text=csv([entry('large',{currency:'USD',amount:99999999999999})],'USD');assert.ok(text.includes('"999999999999.99"'));
});
test('batch Undo restores original order and preserves additions and edits',()=>{
 const original=[entry('a'),entry('b'),entry('c'),entry('d')],deletions=[{entry:original[1],index:1},{entry:original[2],index:1}];
 const remaining=[{...original[0],description:'Updated a'},original[3],entry('new')],restored=restoreDeletions(remaining,deletions);
 assert.deepEqual(restored.map(e=>e.id),['a','b','c','d','new']);assert.equal(restored[0].description,'Updated a');assert.equal(remaining.length,3);assert.equal(deletions.length,2);
 assert.equal(restoreDeletions(restored,deletions).length,5);
});
test('backup reminder is quiet for fresh or empty records and due after seven days',()=>{
 const ledger={...emptyLedger(),entries:[entry('one',{date:'2026-10-20'})]};
 assert.equal(backupDue(emptyLedger(),'2026-10-30'),false);assert.equal(backupDue(ledger,'2026-10-26'),false);assert.equal(backupDue(ledger,'2026-10-27'),true);
 assert.equal(backupDue({...ledger,lastBackup:'2026-10-29'},'2026-10-30'),false);assert.equal(backupDue({...ledger,lastBackup:'2026-10-20'},'2026-10-30'),true);
 assert.equal(backupDue(ledger,'invalid'),false);
});
