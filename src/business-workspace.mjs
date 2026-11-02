import {CURRENCIES,today,toMinor,money,amountText,escapeHTML as esc,invoiceSummary,invoiceSummaries,businessSummary,recordInvoicePayment} from '../dist/core-v2.mjs';

// All business changes use the same encrypted, atomic save as transactions.
export function initBusinessWorkspace({getLedger,getCurrency,save,refresh,notify,confirm,canUse,getOperation,isDemo,pdfSave}){
 const $=s=>document.querySelector(s);
 let customerId=null,invoiceId=null,detailId=null,filter='all',invoiceLimit=100,customerLimit=100,pdfBusy=false;
 const active=()=>canUse();
 const closeQuick=()=>$('#quick-add-dialog').close();
 const statusText={paid:'Paid',partial:'Part paid',overdue:'Overdue',unpaid:'Unpaid'};
 const status=s=>`<span class="status-badge ${s}">${statusText[s]}</span>`;
 function options(selected=''){
  const rows=getLedger().customers;
  return '<option value="">Choose customer</option>'+rows.map(c=>`<option value="${esc(c.id)}"${c.id===selected?' selected':''}>${esc(c.name)}</option>`).join('');
 }
 function renderInvoices(){
  if(!active())return;
  const ledger=getLedger(),summaries=invoiceSummaries(ledger,today()),customers=new Map(ledger.customers.map(c=>[c.id,c])),term=$('#invoice-search').value.trim().toLocaleLowerCase(),currency=getCurrency();
  const rows=ledger.invoices.filter(i=>i.currency===currency).map(invoice=>({invoice,customer:customers.get(invoice.customerId),summary:summaries.get(invoice.id)})).filter(({invoice:i,customer:c,summary:s})=>(filter==='all'||filter==='unpaid'&&s.balance>0||filter==='overdue'&&s.status==='overdue'||filter==='paid'&&s.status==='paid')&&(!term||`${i.number} ${i.description} ${c.name}`.toLocaleLowerCase().includes(term))).sort((a,b)=>b.invoice.date.localeCompare(a.invoice.date)||b.invoice.number.localeCompare(a.invoice.number));
  document.querySelectorAll('[data-invoice-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.invoiceFilter===filter)));
  $('#invoice-list').innerHTML=rows.length?rows.slice(0,invoiceLimit).map(({invoice:i,customer:c,summary:s})=>`<button type="button" class="business-row" data-invoice-open="${esc(i.id)}"><span class="business-row-main"><strong class="business-row-title">${esc(c.name)}</strong><span class="business-row-meta">${esc(i.number)} · Due ${esc(i.dueDate)}</span></span><span class="business-row-amount"><strong>${money(s.balance||i.amount,i.currency)}</strong>${status(s.status)}</span></button>`).join('')+(rows.length>invoiceLimit?'<button type="button" class="button secondary" data-business-more="invoices">Show 100 more</button>':''):`<div class="business-empty"><p>${term||filter!=='all'?'No matches':'No invoices yet'}</p><button type="button" class="button primary" data-action="new-invoice">Create invoice</button></div>`;
 }
 function renderCustomers(){
  if(!active())return;
  const ledger=getLedger(),term=$('#customer-search').value.trim().toLocaleLowerCase(),summaries=invoiceSummaries(ledger,today()),balances=new Map();
  for(const invoice of ledger.invoices)if(invoice.currency===getCurrency())balances.set(invoice.customerId,(balances.get(invoice.customerId)||0)+summaries.get(invoice.id).balance);
  const rows=ledger.customers.filter(c=>!term||`${c.name} ${c.email} ${c.phone}`.toLocaleLowerCase().includes(term)).sort((a,b)=>a.name.localeCompare(b.name));
  $('#customer-list').innerHTML=rows.length?rows.slice(0,customerLimit).map(c=>{
   const due=balances.get(c.id)||0;
   return `<button type="button" class="business-row" data-customer-edit="${esc(c.id)}"><span class="business-row-main"><strong class="business-row-title">${esc(c.name)}</strong><span class="business-row-meta">${esc(c.email||c.phone||'Customer')}</span></span><span class="business-row-amount">${due?`<strong>${money(due,getCurrency())}</strong><span class="business-row-meta">Unpaid</span>`:'<span class="business-row-meta">Edit →</span>'}</span></button>`;
  }).join('')+(rows.length>customerLimit?'<button type="button" class="button secondary" data-business-more="customers">Show 100 more</button>':''):`<div class="business-empty"><p>${term?'No matches':'No customers yet'}</p><button type="button" class="button primary" data-action="new-customer">Add customer</button></div>`;
 }
 function openCustomer(id=null){
  if(!active())return;closeQuick();customerId=id;
  const customer=getLedger().customers.find(c=>c.id===id);
  $('#customer-form').reset();$('#customer-options').open=!!customer;$('#customer-title').textContent=customer?'Edit customer':'Add customer';
  for(const key of ['name','email','phone'])$('#customer-'+key).value=customer?.[key]||'';
  $('#customer-error').textContent='';$('#customer-dialog').showModal();$('#customer-name').focus();
 }
 $('#customer-form').addEventListener('submit',async e=>{
  e.preventDefault();if(!active())return;
  const button=$('#save-customer');if(button.disabled)return;button.disabled=true;
  try{
   const ledger=getLedger(),customer={id:customerId||crypto.randomUUID(),name:$('#customer-name').value.trim(),email:$('#customer-email').value.trim(),phone:$('#customer-phone').value.trim()};
   const next={...ledger,customers:customerId?ledger.customers.map(c=>c.id===customerId?customer:c):[...ledger.customers,customer]};
   if(await save(next)){$('#customer-dialog').close();if($('#invoice-dialog').open){$('#invoice-customer').innerHTML=options(customer.id);}refresh();notify('Customer saved.');}
  }catch(err){if(active())$('#customer-error').textContent=err.message;}finally{button.disabled=false;}
 });
 function nextNumber(){let n=getLedger().invoices.length+1;const numbers=new Set(getLedger().invoices.map(i=>i.number.toLocaleLowerCase()));while(numbers.has(`inv-${String(n).padStart(4,'0')}`))n++;return `INV-${String(n).padStart(4,'0')}`;}
 function setInvoiceCurrency(){const c=$('#invoice-currency').value;$('#invoice-amount-currency').textContent=c;$('#invoice-amount').step=CURRENCIES[c].digits?'0.01':'1';$('#invoice-amount').min=CURRENCIES[c].digits?'0.01':'1';}
 function openInvoice(id=null){
  if(!active())return;closeQuick();$('#invoice-detail-dialog').close();invoiceId=id;
  const ledger=getLedger(),invoice=ledger.invoices.find(i=>i.id===id);
  $('#invoice-form').reset();$('#invoice-title').textContent=invoice?'Edit invoice':'Create invoice';
  $('#invoice-customer').innerHTML=options(invoice?.customerId);
  $('#invoice-description').value=invoice?.description||'';$('#invoice-currency').value=invoice?.currency||getCurrency();setInvoiceCurrency();
  $('#invoice-amount').value=invoice?amountText(invoice.amount,invoice.currency,false):'';
  $('#invoice-number').value=invoice?.number||nextNumber();$('#invoice-date').value=invoice?.date||today();$('#invoice-due').value=invoice?.dueDate||today();$('#invoice-options').open=!!invoice;
  const paid=!!invoice?.payments.length;$('#invoice-customer').disabled=paid;$('#invoice-number').disabled=paid;$('#invoice-currency').disabled=paid;$('#delete-invoice').hidden=!invoice||paid;
  $('#invoice-error').textContent='';$('#invoice-dialog').showModal();$('#invoice-description').focus();
 }
 $('#invoice-currency').addEventListener('change',setInvoiceCurrency);
 $('#invoice-form').addEventListener('submit',async e=>{
  e.preventDefault();if(!active())return;const button=$('#save-invoice');if(button.disabled)return;button.disabled=true;
  try{
   const ledger=getLedger(),original=ledger.invoices.find(i=>i.id===invoiceId),invoice={id:invoiceId||crypto.randomUUID(),number:$('#invoice-number').value.trim(),customerId:$('#invoice-customer').value,description:$('#invoice-description').value.trim(),amount:toMinor($('#invoice-amount').value,$('#invoice-currency').value),currency:$('#invoice-currency').value,date:$('#invoice-date').value,dueDate:$('#invoice-due').value,payments:original?.payments||[]};
   if(!invoice.customerId)throw Error('Choose a customer. Add one from Customers.');
   const next={...ledger,invoices:original?ledger.invoices.map(i=>i.id===invoice.id?invoice:i):[...ledger.invoices,invoice]};
   if(await save(next)){$('#invoice-dialog').close();refresh();openDetail(invoice.id);notify('Invoice saved.');}
  }catch(err){if(active())$('#invoice-error').textContent=err.message;}finally{button.disabled=false;}
 });
 $('#delete-invoice').addEventListener('click',()=>{
  const target=invoiceId,invoice=getLedger().invoices.find(i=>i.id===target);if(!invoice||invoice.payments.length)return;
  confirm('Delete invoice?',invoice.number,'Delete',async()=>{if(!active())return;const ledger=getLedger();if(await save({...ledger,invoices:ledger.invoices.filter(i=>i.id!==target)})){$('#invoice-dialog').close();refresh();notify('Invoice deleted.');}});
 });
 function openDetail(id){
  if(!active())return;const ledger=getLedger(),i=ledger.invoices.find(i=>i.id===id);if(!i)return;detailId=id;
  const c=ledger.customers.find(c=>c.id===i.customerId),s=invoiceSummary(ledger,i,today());
  $('#invoice-detail-title').textContent=i.number;
  $('#invoice-detail-body').innerHTML=`<div class="invoice-detail"><strong>${esc(c.name)}</strong><p>${esc(i.description)}</p>${status(s.status)}<div class="invoice-detail-line"><span>Issued</span><span>${esc(i.date)}</span></div><div class="invoice-detail-line"><span>Due</span><span>${esc(i.dueDate)}</span></div><div class="invoice-detail-line"><span>Total</span><strong>${money(i.amount,i.currency)}</strong></div><div class="invoice-detail-line"><span>Paid</span><strong>${money(s.paid,i.currency)}</strong></div><div class="invoice-detail-line invoice-detail-total"><span>Balance</span><strong>${money(s.balance,i.currency)}</strong></div>${i.payments.length?`<details class="payment-history"><summary>Payments</summary>${i.payments.map(p=>{const entry=ledger.entries.find(e=>e.id===p.entryId);return `<div class="invoice-detail-line"><span>${esc(entry.date)} · ${money(entry.amount,i.currency)}</span><button type="button" class="text-button danger" data-payment-remove="${esc(entry.id)}">Remove</button></div>`;}).join('')}</details>`:''}<button type="button" class="text-button" data-invoice-edit="${esc(i.id)}">Edit invoice</button></div>`;
  $('#invoice-detail-dialog [data-action=invoice-payment]').hidden=!s.balance;
  $('#invoice-detail-dialog').showModal();
 }
 function openPayment(){
  if(!active())return;const ledger=getLedger(),i=ledger.invoices.find(i=>i.id===detailId);if(!i)return;const s=invoiceSummary(ledger,i,today());if(!s.balance)return;
  $('#invoice-detail-dialog').close();$('#payment-form').reset();$('#payment-currency').textContent=i.currency;$('#payment-amount').step=CURRENCIES[i.currency].digits?'0.01':'1';$('#payment-amount').min=CURRENCIES[i.currency].digits?'0.01':'1';$('#payment-amount').max=amountText(s.balance,i.currency,false);$('#payment-amount').value=amountText(s.balance,i.currency,false);$('#payment-date').value=today();$('#payment-error').textContent='';$('#payment-dialog').showModal();$('#payment-amount').focus();
 }
 $('#payment-form').addEventListener('submit',async e=>{
  e.preventDefault();if(!active())return;const button=$('#save-payment');if(button.disabled)return;button.disabled=true;
  try{
   const ledger=getLedger(),i=ledger.invoices.find(i=>i.id===detailId);if(!i)throw Error('Reopen the invoice.');
   const next=recordInvoicePayment(ledger,i.id,{id:crypto.randomUUID(),amount:toMinor($('#payment-amount').value,i.currency),date:$('#payment-date').value});
   if(await save(next)){$('#payment-dialog').close();refresh();openDetail(i.id);notify('Payment saved.');}
  }catch(err){if(active())$('#payment-error').textContent=err.message;}finally{button.disabled=false;}
 });
 async function invoicePDF(){
  if(!active()||pdfBusy)return;const snapshot=getLedger(),id=detailId,invoice=snapshot.invoices.find(i=>i.id===id),ticket=getOperation();if(!invoice)return;
  const current=()=>active()&&getOperation()===ticket&&getLedger()===snapshot;pdfBusy=true;
  const button=$('#invoice-detail-dialog [data-action=invoice-pdf]');button.disabled=true;
  try{const {createInvoicePDF}=await import('./report-v5.mjs');const bytes=await createInvoicePDF(snapshot,invoice,{sample:isDemo(),isCurrent:current});if(!current())return;$('#invoice-detail-dialog').close();pdfSave.prepare(bytes,`biztrack-${invoice.number.replace(/[^a-zA-Z0-9_-]/g,'-')}.pdf`,{isCurrent:current});}
  catch(err){if(current())notify(err.message);}finally{pdfBusy=false;button.disabled=false;}
 }
 document.addEventListener('click',e=>{
  if(!active())return;
  const customer=e.target.closest('[data-customer-edit]');if(customer)openCustomer(customer.dataset.customerEdit);
  const invoice=e.target.closest('[data-invoice-open]');if(invoice)openDetail(invoice.dataset.invoiceOpen);
  const edit=e.target.closest('[data-invoice-edit]');if(edit)openInvoice(edit.dataset.invoiceEdit);
  const filterButton=e.target.closest('[data-invoice-filter]');if(filterButton){filter=filterButton.dataset.invoiceFilter;invoiceLimit=100;renderInvoices();}
  const more=e.target.closest('[data-business-more]');if(more){if(more.dataset.businessMore==='invoices'){invoiceLimit+=100;renderInvoices();}else{customerLimit+=100;renderCustomers();}}
  const remove=e.target.closest('[data-payment-remove]');if(remove){const id=remove.dataset.paymentRemove,target=detailId;confirm('Remove payment?','This also removes its sale entry.','Remove',async()=>{if(!active())return;const ledger=getLedger(),next={...ledger,entries:ledger.entries.filter(e=>e.id!==id),invoices:ledger.invoices.map(i=>i.id===target?{...i,payments:i.payments.filter(p=>p.entryId!==id)}:i)};if(await save(next)){refresh();openDetail(target);notify('Payment removed.');}});}
 });
 $('#invoice-search').addEventListener('input',()=>{invoiceLimit=100;renderInvoices();});$('#customer-search').addEventListener('input',()=>{customerLimit=100;renderCustomers();});
 return {renderInvoices,renderCustomers,openCustomer,openInvoice,openDetail,openPayment,invoicePDF,customerOptions:options,clear(){customerId=invoiceId=detailId=null;filter='all';invoiceLimit=customerLimit=100;for(const id of ['customer-form','invoice-form','payment-form'])$('#'+id).reset();$('#invoice-customer').replaceChildren();$('#customer-options').open=false;$('#payment-amount').removeAttribute('max');for(const id of ['invoice-search','customer-search'])$('#'+id).value='';for(const id of ['invoice-list','customer-list','invoice-detail-body'])$('#'+id).replaceChildren();for(const id of ['customer-error','invoice-error','payment-error','invoice-detail-title','invoice-amount-currency','payment-currency'])$('#'+id).textContent='';}};
}
