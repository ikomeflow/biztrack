import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createReportPDF} from '../dist/report-v3.mjs';
const entry=(i=0,patch={})=>({id:String(i),date:'2026-10-30',currency:'XAF',type:'sale',category:'Product sales',amount:123456,description:'Café / São Tomé '+i,...patch});
const raw=bytes=>Buffer.from(bytes).toString('latin1');
test('PDF uses a real embedded text font and valid page/trailer structures',async()=>{
 const text=raw(await createReportPDF([entry()],{businessName:'Test business',currency:'XAF',sample:true}));
 assert.ok(text.startsWith('%PDF-'));assert.match(text,/\/FontFile2/);assert.match(text,/\/ToUnicode/);assert.match(text,/\/Count 1\b/);assert.match(text,/startxref\s+\d+\s+%%EOF/);
});
test('full descriptions and all 125 rows generate repeated pages beyond the screen limit',async()=>{
 const rows=Array.from({length:125},(_,i)=>entry(i,{description:'Long description for the selected business transaction '.repeat(3)}));
 const text=raw(await createReportPDF(rows,{currency:'XAF',period:'All time',type:'Sales only',search:'Long description'}));
 const pages=[...text.matchAll(/\/Type \/Page\b/g)].length;assert.ok(pages>10);assert.match(text,new RegExp(`/Count ${pages}\\b`));
});
test('PDF cannot combine currency totals and rejects untested huge exports',async()=>{
 await assert.rejects(createReportPDF([entry(),entry(1,{currency:'USD'})],{currency:'XAF'}),/one currency/);
 await assert.rejects(createReportPDF([entry()],{currency:'BAD'}),/one currency/);
 await assert.rejects(createReportPDF(Array.from({length:5001},(_,i)=>entry(i)),{currency:'XAF'}),/5,000/);
});
test('PDF cancels before download when locking or another ledger change invalidates its snapshot',async()=>{
 let checks=0;const rows=Array.from({length:125},(_,i)=>entry(i));
 await assert.rejects(createReportPDF(rows,{currency:'XAF',isCurrent:()=>++checks<3}),{name:'AbortError'});assert.equal(checks,3);
});
test('empty reports and decimal-currency reports remain valid PDFs',async()=>{
 for(const [rows,currency] of [[[],'XAF'],[[entry(0,{currency:'USD',amount:100029})],'USD'],[[entry(0,{currency:'XOF'})],'XOF']])assert.match(raw(await createReportPDF(rows,{currency})),/\/Count 1\b/);
});
