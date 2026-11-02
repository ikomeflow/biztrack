// Business records extend the original ledger without changing its storage key.
import * as legacy from './core.mjs';
export * from './core.mjs';
const MAX_AMOUNT=99999999999999;
const fail=message=>{throw Error(message+' Nothing was changed.');};
const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
const id=value=>typeof value==='string'&&value.length>0&&value.length<=100&&value.trim()===value;
const text=(value,max,required=false)=>typeof value==='string'&&value.length<=max&&(!required||value.trim().length>0);
const currency=value=>typeof value==='string'&&own(legacy.CURRENCIES,value);
const amount=value=>Number.isSafeInteger(value)&&value>0&&value<=MAX_AMOUNT;
function fields(value,allowed){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!allowed.includes(key)))fail('Unsupported business data.');}
function safeAdd(a,b){const sum=a+b;if(!Number.isSafeInteger(sum))fail('The total is too large to calculate accurately.');return sum;}
export function emptyLedger(){return {...legacy.emptyLedger(),schema:2,customers:[],invoices:[]};}
export function validateLedger(input){
 if(!input||input.app!=='BizTrack'||![1,2].includes(input.schema))fail('This is not a supported BizTrack backup.');
 fields(input,['schema','app','businessName','defaultCurrency','entries','lastBackup',...(input.schema===2?['customers','invoices']:[])]);
 // Validate legacy fields with the unchanged calculation rules. Conversion is in
 // memory only; the vault writes only after a successful user save.
 const base=legacy.validateLedger({...input,schema:1});
 if(input.schema===1)return {...base,schema:2,customers:[],invoices:[]};
 if(!Array.isArray(input.customers)||input.customers.length>20000||!Array.isArray(input.invoices)||input.invoices.length>50000)fail('Invalid customers or invoices.');
 const customerIds=new Set(),customers=input.customers.map(customer=>{
  fields(customer,['id','name','email','phone']);
  if(!id(customer.id)||customerIds.has(customer.id)||!text(customer.name,80,true)||!text(customer.email,254)||!text(customer.phone,40))fail('Invalid or duplicate customer.');
  if(customer.email&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())||/[\r\n]/.test(customer.email)))fail('Enter a valid customer email.');
  customerIds.add(customer.id);return {id:customer.id,name:customer.name.trim(),email:customer.email.trim(),phone:customer.phone.trim()};
 });
 const entries=base.entries.map((entry,index)=>{
  const original=input.entries[index];fields(original,['id','type','currency','amount','date','description','category','customerId','invoiceId']);
  for(const key of ['customerId','invoiceId'])if(own(original,key)){if(!id(original[key]))fail('Invalid transaction reference.');entry[key]=original[key];}
  if(entry.customerId&&!customerIds.has(entry.customerId))fail('A transaction customer is missing.');
  if(entry.invoiceId&&(!entry.customerId||entry.type!=='sale'))fail('Invalid invoice payment.');
  return entry;
 });
 const entryById=new Map(entries.map(entry=>[entry.id,entry])),invoiceIds=new Set(),numbers=new Set(),paymentIds=new Set(),linkedEntries=new Set();
 const invoices=input.invoices.map(invoice=>{
  fields(invoice,['id','number','customerId','description','amount','currency','date','dueDate','payments']);
  const number=typeof invoice.number==='string'?invoice.number.trim():'';
  if(!id(invoice.id)||invoiceIds.has(invoice.id)||!text(number,40,true)||numbers.has(number.toLocaleLowerCase('en'))||!id(invoice.customerId)||!customerIds.has(invoice.customerId)||!text(invoice.description,160,true)||!amount(invoice.amount)||!currency(invoice.currency)||!legacy.validDate(invoice.date)||!legacy.validDate(invoice.dueDate)||invoice.dueDate<invoice.date||!Array.isArray(invoice.payments)||invoice.payments.length>100000)fail('Invalid or duplicate invoice.');
  invoiceIds.add(invoice.id);numbers.add(number.toLocaleLowerCase('en'));let paid=0;
  const payments=invoice.payments.map(payment=>{
   fields(payment,['id','entryId']);const entry=entryById.get(payment.entryId);
   if(!id(payment.id)||paymentIds.has(payment.id)||!id(payment.entryId)||linkedEntries.has(payment.entryId)||!entry||entry.type!=='sale'||entry.invoiceId!==invoice.id||entry.customerId!==invoice.customerId||entry.currency!==invoice.currency||entry.date<invoice.date)fail('Invalid or duplicate invoice payment.');
   paid=safeAdd(paid,entry.amount);paymentIds.add(payment.id);linkedEntries.add(payment.entryId);return {id:payment.id,entryId:payment.entryId};
  });
  if(paid>invoice.amount)fail('Payments exceed the invoice total.');
  return {id:invoice.id,number,customerId:invoice.customerId,description:invoice.description.trim(),amount:invoice.amount,currency:invoice.currency,date:invoice.date,dueDate:invoice.dueDate,payments};
 });
 for(const entry of entries)if(entry.invoiceId&&(!invoiceIds.has(entry.invoiceId)||!linkedEntries.has(entry.id)))fail('An invoice payment link is missing.');
 for(const code of Object.keys(legacy.CURRENCIES))legacy.totals(entries.filter(entry=>entry.currency===code));
 const result={...base,schema:2,entries,customers,invoices};
 // Outstanding totals must stay representable too, including many unpaid invoices.
 for(const code of Object.keys(legacy.CURRENCIES))businessSummary(result,code);
 return result;
}
export function invoiceSummary(ledger,invoice,referenceDate=legacy.today()){
 if(!legacy.validDate(referenceDate))throw Error('Choose a valid reference date.');
 return summarizeInvoice(new Map(ledger.entries.map(entry=>[entry.id,entry])),invoice,referenceDate);
}
export function invoiceSummaries(ledger,referenceDate=legacy.today()){
 if(!legacy.validDate(referenceDate))throw Error('Choose a valid reference date.');
 const entries=new Map(ledger.entries.map(entry=>[entry.id,entry]));
 return new Map(ledger.invoices.map(invoice=>[invoice.id,summarizeInvoice(entries,invoice,referenceDate)]));
}
function summarizeInvoice(entries,invoice,referenceDate){let paid=0;
 for(const payment of invoice.payments){const entry=entries.get(payment.entryId);if(!entry)fail('An invoice payment is missing.');paid=safeAdd(paid,entry.amount);}
 const balance=invoice.amount-paid;
 return {paid,balance,status:balance===0?'paid':invoice.dueDate<referenceDate?'overdue':paid?'partial':'unpaid'};
}
export function businessSummary(ledger,code,referenceDate=legacy.today()){
 if(!currency(code))throw Error('Choose a supported currency.');
 if(!legacy.validDate(referenceDate))throw Error('Choose a valid reference date.');
 let outstanding=0,overdue=0,invoiceCount=0;const entries=new Map(ledger.entries.map(entry=>[entry.id,entry]));
 for(const invoice of ledger.invoices){if(invoice.currency!==code)continue;const summary=summarizeInvoice(entries,invoice,referenceDate);if(summary.balance){outstanding=safeAdd(outstanding,summary.balance);if(summary.status==='overdue')overdue=safeAdd(overdue,summary.balance);}invoiceCount++;}
 return {outstanding,overdue,invoiceCount};
}
export function recordInvoicePayment(input,invoiceId,payment){
 const ledger=validateLedger(input),invoice=ledger.invoices.find(item=>item.id===invoiceId);
 if(!invoice)throw Error('Invoice not found.');
 if(!payment||!id(payment.id)||!amount(payment.amount)||!legacy.validDate(payment.date)||payment.date<invoice.date)throw Error('Enter a valid payment amount and date.');
 const summary=invoiceSummary(ledger,invoice);
 if(payment.amount>summary.balance)throw Error('Payment exceeds the amount due.');
 const entry={id:payment.id,type:'sale',currency:invoice.currency,amount:payment.amount,date:payment.date,description:`Payment · ${invoice.number}`,category:'Other sales',customerId:invoice.customerId,invoiceId:invoice.id};
 return validateLedger({...ledger,entries:[...ledger.entries,entry],invoices:ledger.invoices.map(item=>item.id===invoiceId?{...item,payments:[...item.payments,{id:payment.id,entryId:payment.id}]}:item)});
}
export function backupDue(ledger,date=legacy.today()){
 if(!legacy.validDate(date))return false;
 if(ledger.entries.length)return legacy.backupDue(ledger,date);
 if(!ledger.customers.length&&!ledger.invoices.length)return false;
 const first=ledger.invoices.reduce((old,invoice)=>invoice.date<old?invoice.date:old,date);
 const since=legacy.validDate(ledger.lastBackup)?ledger.lastBackup:first;
 return Date.parse(date+'T12:00:00Z')-Date.parse(since+'T12:00:00Z')>=7*86400000;
}
function shiftMonth(month,offset){const date=new Date(month+'-01T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+offset);return date.toISOString().slice(0,7);}
export function sixMonthSeries(entries,month,code){
 if(!legacy.validDate(month+'-01')||!currency(code))throw Error('Choose a valid month and currency.');
 return Array.from({length:6},(_,index)=>shiftMonth(month,index-5)).filter(key=>key>='1900-01'&&key<='9999-12').map(key=>({month:key,...legacy.totals(entries.filter(entry=>entry.currency===code&&entry.date.slice(0,7)===key))}));
}
export function previousPeriodComparison(entries,{period,month,currency:code,referenceDate=legacy.today()}){
 if(!currency(code)||!legacy.validDate(referenceDate))throw Error('Choose a valid period and currency.');
 if(period==='all')return null;
 let currentEntries,previousEntries,label;
 if(period==='today'){
  if(referenceDate==='1900-01-01')return null;
  const yesterday=new Date(referenceDate+'T12:00:00Z');yesterday.setUTCDate(yesterday.getUTCDate()-1);const previousDate=yesterday.toISOString().slice(0,10);
  currentEntries=entries.filter(entry=>entry.currency===code&&entry.date===referenceDate);previousEntries=entries.filter(entry=>entry.currency===code&&entry.date===previousDate);label='vs yesterday';
 }else{
  if(!legacy.validDate(month+'-01'))throw Error('Choose a valid month.');if(month==='1900-01')return null;
  const previousMonth=shiftMonth(month,-1);currentEntries=entries.filter(entry=>entry.currency===code&&entry.date.slice(0,7)===month);previousEntries=entries.filter(entry=>entry.currency===code&&entry.date.slice(0,7)===previousMonth);label='vs previous month';
 }
 const current=legacy.totals(currentEntries).profit,previous=legacy.totals(previousEntries).profit,change=current-previous;
 // The comparison is optional. Keep exact period totals visible when their
 // difference cannot itself be represented as a safe integer.
 if(!Number.isSafeInteger(change))return null;
 return {current,previous,change,label};
}
export function demoLedger(){
 const ledger={...legacy.demoLedger(),schema:2,customers:[{id:'demo-customer',name:'Akwa Studio',email:'',phone:''}],invoices:[]},date=legacy.today();
 ledger.invoices=[{id:'demo-invoice',number:'INV-001',customerId:'demo-customer',description:'Design project',amount:150000,currency:'XAF',date,dueDate:date,payments:[]}];
 return recordInvoicePayment(ledger,'demo-invoice',{id:'demo-payment',amount:50000,date});
}

export function csv(entries,currency){
 const source=legacy.csv(entries,currency),footer='\r\n"NET PROFIT",',at=source.lastIndexOf(footer);
 return at<0?source:source.slice(0,at)+'\r\n"NET CASH",'+source.slice(at+footer.length);
}
