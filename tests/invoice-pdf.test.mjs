import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
import {emptyLedger,recordInvoicePayment} from '../dist/core-v2.mjs';
import {createInvoicePDF,createReportPDF} from '../dist/report-v5.mjs';

const generatedAt=new Date(2026,10,2,12);
const invoice={id:'invoice-1',number:'INV-001',customerId:'customer-1',description:'Design services',amount:100050,currency:'USD',date:'2026-10-20',dueDate:'2026-10-30',payments:[]};
function fixture(){return {...emptyLedger(),businessName:'Café Example',customers:[{id:'customer-1',name:'São Tomé Customer',email:'customer@example.com',phone:'+237 600 111 222'}],invoices:[structuredClone(invoice)]};}
const raw=bytes=>Buffer.from(bytes).toString('latin1');
function pdfText(bytes){
 const streams=[...raw(bytes).matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)].map(match=>{try{return inflateSync(Buffer.from(match[1],'latin1')).toString('latin1');}catch{return match[1];}});
 const glyphs=new Map();
 for(const stream of streams)for(const block of stream.matchAll(/beginbfchar([\s\S]*?)endbfchar/g))for(const item of block[1].matchAll(/<([\da-f]+)>\s*<([\da-f]+)>/gi))glyphs.set(item[1].toLowerCase(),String.fromCharCode(...(item[2].match(/.{4}/g)||[]).map(value=>parseInt(value,16))));
 return streams.flatMap(stream=>[...stream.matchAll(/<([\da-f]+)>\s*Tj/gi)].map(match=>(match[1].match(/.{4}/g)||[]).map(value=>glyphs.get(value.toLowerCase())||'').join(''))).join('\n');
}

test('customer-facing invoice contains exact totals, payment history and Futura footer',async()=>{
 const ledger=recordInvoicePayment(fixture(),'invoice-1',{id:'payment-1',amount:30025,date:'2026-10-21'}),before=JSON.stringify(ledger);
 const bytes=await createInvoicePDF(ledger,ledger.invoices[0],{generatedAt}),text=pdfText(bytes),structure=raw(bytes);
 assert.ok(structure.startsWith('%PDF-'));assert.match(structure,/\/FontFile2/);assert.match(structure,/\/ToUnicode/);assert.match(structure,/startxref\s+\d+\s+%%EOF/);
 for(const value of ['INV-001','Café Example','São Tomé Customer','customer@example.com','Design services','USD 1,000.50','USD 300.25','USD 700.25','2026-10-21','Overdue','Produced by Futura Group'])assert.ok(text.includes(value),value);
 assert.ok(!text.includes('Private'));assert.equal(JSON.stringify(ledger),before);
});

test('fully paid and sample invoices report paid zero balance without double counting',async()=>{
 const ledger=recordInvoicePayment(fixture(),'invoice-1',{id:'payment-1',amount:invoice.amount,date:'2026-10-21'});
 const text=pdfText(await createInvoicePDF(ledger,ledger.invoices[0],{sample:true,generatedAt}));
 for(const value of ['SAMPLE INVOICE','Paid','USD 0.00','Produced by Futura Group'])assert.ok(text.includes(value),value);
});

test('long allowed customer text wraps and every paginated payment page has the footer',async()=>{
 const ledger=fixture();ledger.businessName='Long business name '.repeat(4);ledger.customers[0].name='Long customer name '.repeat(4);ledger.customers[0].email='customer.'+'x'.repeat(130)+'@example.com';ledger.invoices[0].description='Detailed service description '.repeat(5);
 for(let index=0;index<100;index++){
  const id='payment-'+index;ledger.entries.push({id,type:'sale',currency:'USD',amount:100,date:'2026-10-21',description:'Payment',category:'Other sales',customerId:'customer-1',invoiceId:'invoice-1'});ledger.invoices[0].payments.push({id,entryId:id});
 }
 const bytes=await createInvoicePDF(ledger,ledger.invoices[0],{generatedAt}),structure=raw(bytes),text=pdfText(bytes),pages=[...structure.matchAll(/\/Type \/Page\b/g)].length;
 assert.ok(pages>=4);assert.equal(text.split('Produced by Futura Group').length-1,pages);assert.equal(text.split('2026-10-21').length-1,100);assert.ok(text.includes('USD 900.50'));
});

test('invoice PDF rejects missing invoices and invalid payment links before exporting',async()=>{
 await assert.rejects(createInvoicePDF(fixture(),{id:'missing'},{generatedAt}),/saved invoice/);
 const broken=fixture();broken.invoices[0].payments=[{id:'p',entryId:'missing'}];await assert.rejects(createInvoicePDF(broken,broken.invoices[0],{generatedAt}),/invoice payment/);
});

test('invoice PDF cancels on lock or a changed workspace before returning bytes',async()=>{
 await assert.rejects(createInvoicePDF(fixture(),invoice,{generatedAt,isCurrent:()=>false}),{name:'AbortError'});
 const ledger=recordInvoicePayment(fixture(),'invoice-1',{id:'payment-1',amount:30025,date:'2026-10-21'});let checks=0;
 await assert.rejects(createInvoicePDF(ledger,ledger.invoices[0],{generatedAt,isCurrent:()=>++checks<2}),{name:'AbortError'});assert.equal(checks,2);
});

test('transaction PDF calls the cash calculation Net cash',async()=>{
 const text=pdfText(await createReportPDF([],{generatedAt}));assert.ok(text.includes('Net cash'));assert.ok(text.includes('Payments received minus expenses paid'));assert.ok(!text.includes('Net profit'));
});
