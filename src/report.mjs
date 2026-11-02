import {jsPDF} from 'jspdf';
import font from './NotoSans-Regular.ttf';
import {amountText,money,totals,CURRENCIES} from '../dist/core.mjs';
import {validateLedger,invoiceSummary} from '../dist/core-v2.mjs';

const ink=[23,43,77],muted=[95,111,135],blue=[21,87,232],line=[226,232,240];
const clean=value=>String(value??'').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').replace(/\s+/g,' ').trim();
const localDate=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

// The same local renderer serves filtered History, full history and Reports.
export async function createReportPDF(rows,{businessName='My business',currency='XAF',from='',to='',period='All time',type='All transactions',search='',sample=false,title='Transaction history',generatedAt=new Date(),isCurrent=()=>true,onProgress=()=>{}}={}){
 if(!Object.hasOwn(CURRENCIES,currency)||rows.some(row=>row.currency!==currency))throw Error('Choose one currency per PDF. No conversion.');
 if(rows.length>5000)throw Error('Choose a shorter period for PDF downloads (up to 5,000 entries). CSV supports the full ledger.');
 const check=()=>{if(!isCurrent())throw new DOMException('PDF cancelled because the workspace changed or locked.','AbortError');};
 check();
 const doc=new jsPDF({unit:'pt',format:'a4',compress:true,putOnlyUsedFonts:true});
 doc.addFileToVFS('NotoSans.ttf',font);doc.addFont('NotoSans.ttf','NotoSans','normal');doc.setFont('NotoSans');
 doc.setProperties({title:`BizTrack ${title.toLowerCase()}`,subject:sample?'Sample business records':title,author:'Futura Group',creator:'BizTrack'});
 const glyphs=doc.getFont().metadata.cmap.unicode.codeMap;
 const left=40,right=doc.internal.pageSize.getWidth()-40,bottom=doc.internal.pageSize.getHeight()-54,width=right-left;
 let y=0,canvas,context;
 const hasGlyphs=value=>[...value].every(char=>char===' '||glyphs[char.codePointAt(0)]);
 function canvasContext(size){
  if(!context){if(typeof document==='undefined')throw Error('This text needs browser font rendering.');canvas=document.createElement('canvas');context=canvas.getContext('2d');if(!context)throw Error('Font rendering unavailable.');}
  context.font=`${size}px "Noto Sans", Arial, sans-serif`;return context;
 }
 function measure(value,size){doc.setFontSize(size);return hasGlyphs(value)?doc.getTextWidth(value):canvasContext(size).measureText(value).width;}
 function wrap(value,maxWidth,size){
  const valueText=clean(value);if(!valueText)return [];
  if(hasGlyphs(valueText)){doc.setFontSize(size);return doc.splitTextToSize(valueText,maxWidth);}
  const result=[];let current='';
  const chars=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(valueText)].map(x=>x.segment):[...valueText];
  for(const char of chars){if(current&&measure(current+char,size)>maxWidth){result.push(current.trim());current=char.trimStart();}else current+=char;}
  if(current)result.push(current.trim());return result;
 }
 function text(value,x,baseline,size=10,color=ink,align='left'){
  const valueText=clean(value);if(!valueText)return;
  doc.setFontSize(size);doc.setTextColor(...color);
  if(hasGlyphs(valueText)){doc.text(valueText,x,baseline,{align});return;}
  // Local system fonts preserve unsupported scripts/emoji as a small image.
  // All text supported by the bundled font stays searchable/selectable.
  const ctx=canvasContext(size),w=Math.ceil(ctx.measureText(valueText).width+4),h=Math.ceil(size*1.7),scale=3;
  canvas.width=w*scale;canvas.height=h*scale;ctx.scale(scale,scale);ctx.font=`${size}px "Noto Sans", Arial, sans-serif`;ctx.fillStyle=`rgb(${color.join(',')})`;ctx.textBaseline='alphabetic';ctx.fillText(valueText,0,size*1.15);
  doc.addImage(canvas.toDataURL('image/png'),'PNG',align==='right'?x-w:x,baseline-size*1.15,w,h);
 }
 function rule(at){doc.setDrawColor(...line);doc.setLineWidth(.5);doc.line(left,at,right,at);}
 function tableHeading(){
  doc.setFillColor(246,248,252);doc.rect(left,y-14,width,26,'F');
  text('Date',left+7,y,9,muted);text('Description / category',132,y,9,muted);text('Type',373,y,9,muted);text(`Amount (${currency})`,right-7,y,9,muted,'right');y+=24;
 }
 function nextPage(){doc.addPage();text('BizTrack.',left,42,17,blue);text(sample?'SAMPLE DATA':title,right,42,9,muted,'right');y=77;tableHeading();}
 text('BizTrack.',left,46,22,blue);text('BY FUTURA GROUP',right,46,8,muted,'right');
 text(sample?'SAMPLE DATA / '+title:title,left,84,21);
 y=108;
 for(const item of wrap(businessName,width,12)){text(item,left,y,12);y+=18;}
 for(const heading of [from&&to?`${from} to ${to}`:period,type,search?`Search: ${search}`:'']){
  for(const item of wrap(heading,width,9)){text(item,left,y,9,muted);y+=14;}
 }
 let first='',last='';for(const row of rows){if(!first||row.date<first)first=row.date;if(!last||row.date>last)last=row.date;}
 text(`${rows.length.toLocaleString('en-GB')} ${rows.length===1?'transaction':'transactions'}${first?` / Records: ${first} to ${last}`:''}`,left,y+2,9,muted);y+=28;
 const sum=totals(rows),column=width/3;
 for(const [index,label,value] of [[0,'Sales',sum.sales],[1,'Expenses',sum.expenses],[2,'Net cash',sum.profit]]){
  const x=left+index*column,total=money(value,currency),size=Math.min(15,15*(column-12)/Math.max(column-12,measure(total,15)));
  text(label,x,y,9,muted);text(total,x,y+24,size,index===2?blue:ink);
 }
 y+=45;text('Payments received minus expenses paid. No currency conversion.',left,y,8,muted);y+=30;tableHeading();
 if(!rows.length)text('No transactions in these results.',left+7,y+8,10,muted);
 for(let index=0;index<rows.length;index++){
  if(index%50===0){await new Promise(resolve=>setTimeout(resolve,0));check();onProgress(index,rows.length);}
  const row=rows[index],description=wrap(row.description,225,10),category=wrap(row.category,225,8);
  const height=Math.max(42,description.length*14+(category.length?5+category.length*12:0)+19);
  if(y+height>bottom)nextPage();
  text(row.date,left+7,y+2,9,muted);
  let baseline=y+2;for(const item of description){text(item,132,baseline,10);baseline+=14;}
  if(category.length){baseline+=3;for(const item of category){text(item,132,baseline,8,muted);baseline+=12;}}
  text(row.type==='sale'?'Sale':'Expense',373,y+2,9,muted);
  text(`${row.type==='sale'?'+':'-'}${amountText(row.amount,currency)}`,right-7,y+2,9,row.type==='sale'?[20,105,83]:ink,'right');
  y+=height;rule(y-14);
 }
 check();onProgress(rows.length,rows.length);
 const pages=doc.getNumberOfPages();
 for(let page=1;page<=pages;page++){
  doc.setPage(page);rule(bottom+14);text(`Private / Generated on this device / ${localDate(generatedAt)}`,left,bottom+31,8,muted);text(`${page} / ${pages}`,doc.internal.pageSize.getWidth()/2,bottom+31,8,muted,'center');text('Produced by Futura Group',right,bottom+31,8,muted,'right');
 }
 return doc.output('arraybuffer');
}

// Customer-facing invoices are generated locally from one validated ledger snapshot.
export async function createInvoicePDF(ledger,invoice,{sample=false,generatedAt=new Date(),isCurrent=()=>true}={}){
 const check=()=>{if(!isCurrent())throw new DOMException('PDF cancelled because the workspace changed or locked.','AbortError');};
 check();
 const data=validateLedger(ledger),record=data.invoices.find(item=>item.id===invoice?.id);
 if(!record)throw Error('Choose a saved invoice.');
 if(record.payments.length>5000)throw Error('Invoice PDFs support up to 5,000 payments. Keep a JSON backup for the complete ledger.');
 const customer=data.customers.find(item=>item.id===record.customerId),summary=invoiceSummary(data,record,localDate(generatedAt));
 const entries=new Map(data.entries.map(entry=>[entry.id,entry]));
 const payments=record.payments.map(payment=>entries.get(payment.entryId));
 const doc=new jsPDF({unit:'pt',format:'a4',compress:true,putOnlyUsedFonts:true});
 doc.addFileToVFS('NotoSans.ttf',font);doc.addFont('NotoSans.ttf','NotoSans','normal');doc.setFont('NotoSans');
 doc.setProperties({title:`Invoice ${record.number}`,subject:sample?'Sample invoice':'Customer invoice',author:data.businessName,creator:'BizTrack / Futura Group'});
 const glyphs=doc.getFont().metadata.cmap.unicode.codeMap;
 const left=40,right=doc.internal.pageSize.getWidth()-40,width=right-left,bottom=doc.internal.pageSize.getHeight()-72;
 let y=0,canvas,context;
 const hasGlyphs=value=>[...value].every(char=>char===' '||glyphs[char.codePointAt(0)]);
 function canvasContext(size){
  if(!context){if(typeof document==='undefined')throw Error('This text needs browser font rendering.');canvas=document.createElement('canvas');context=canvas.getContext('2d');if(!context)throw Error('Font rendering unavailable.');}
  context.font=`${size}px "Noto Sans", Arial, sans-serif`;return context;
 }
 function measure(value,size){doc.setFontSize(size);return hasGlyphs(value)?doc.getTextWidth(value):canvasContext(size).measureText(value).width;}
 function wrap(value,maxWidth,size){
  const valueText=clean(value);if(!valueText)return [];
  if(hasGlyphs(valueText)){doc.setFontSize(size);return doc.splitTextToSize(valueText,maxWidth);}
  const result=[];let current='';
  const chars=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(valueText)].map(item=>item.segment):[...valueText];
  for(const char of chars){if(current&&measure(current+char,size)>maxWidth){result.push(current.trim());current=char.trimStart();}else current+=char;}
  if(current)result.push(current.trim());return result;
 }
 function text(value,x,baseline,size=10,color=ink,align='left'){
  const valueText=clean(value);if(!valueText)return;doc.setFontSize(size);doc.setTextColor(...color);
  if(hasGlyphs(valueText)){doc.text(valueText,x,baseline,{align});return;}
  const ctx=canvasContext(size),w=Math.ceil(ctx.measureText(valueText).width+4),h=Math.ceil(size*1.7),scale=3;
  canvas.width=w*scale;canvas.height=h*scale;ctx.scale(scale,scale);ctx.font=`${size}px "Noto Sans", Arial, sans-serif`;ctx.fillStyle=`rgb(${color.join(',')})`;ctx.textBaseline='alphabetic';ctx.fillText(valueText,0,size*1.15);
  doc.addImage(canvas.toDataURL('image/png'),'PNG',align==='right'?x-w:x,baseline-size*1.15,w,h);
 }
 function rule(at){doc.setDrawColor(...line);doc.setLineWidth(.5);doc.line(left,at,right,at);}
 function newPage(){check();doc.addPage();text('Invoice',left,42,16,blue);text(record.number,right,42,9,muted,'right');rule(56);y=82;}
 function ensure(height){if(y+height>bottom)newPage();}
 function paragraph(value,size=11,color=ink){for(const item of wrap(value,width,size)){ensure(size*1.55);text(item,left,y,size,color);y+=size*1.55;}}
 function heading(value){ensure(45);y+=14;text(value,left,y,10,muted);y+=24;}
 function amountRow(label,value,emphasis=false){ensure(31);text(label,left,y,emphasis?12:10,emphasis?blue:muted);const formatted=money(value,record.currency),maxWidth=width*.68,preferred=emphasis?16:12,size=preferred*maxWidth/Math.max(maxWidth,measure(formatted,preferred));text(formatted,right,y,size,emphasis?blue:ink,'right');y+=30;}
 text(sample?'SAMPLE INVOICE':'INVOICE',left,46,22,blue);text('BizTrack.',right,46,10,muted,'right');y=78;
 paragraph(data.businessName,16);y+=8;paragraph(record.number,12,blue);y+=12;
 paragraph(`Issued ${record.date}   /   Due ${record.dueDate}`,10,muted);
 const status={paid:'Paid',partial:'Part paid',overdue:'Overdue',unpaid:'Unpaid'}[summary.status];
 paragraph(status,10,summary.status==='paid'?[20,105,83]:blue);
 heading('Bill to');paragraph(customer.name,12);if(customer.email)paragraph(customer.email,10,muted);if(customer.phone)paragraph(customer.phone,10,muted);
 heading('Description');paragraph(record.description,11);y+=20;ensure(130);rule(y-8);
 amountRow('Total',record.amount);amountRow('Paid',summary.paid);amountRow('Balance due',summary.balance,true);
 if(payments.length){
  heading('Payments');text('Date',left,y,9,muted);text(`Amount (${record.currency})`,right,y,9,muted,'right');y+=22;
  for(let index=0;index<payments.length;index++){
   if(index%50===0){await new Promise(resolve=>setTimeout(resolve,0));check();}
   const payment=payments[index];ensure(28);text(payment.date,left,y,10,muted);text(amountText(payment.amount,record.currency),right,y,10,ink,'right');y+=27;rule(y-15);
  }
 }
 check();
 const pages=doc.getNumberOfPages();
 for(let page=1;page<=pages;page++){
  doc.setPage(page);const baseline=doc.internal.pageSize.getHeight()-31;rule(baseline-18);text(`Generated ${localDate(generatedAt)}`,left,baseline,8,muted);text(`${page} / ${pages}`,doc.internal.pageSize.getWidth()/2,baseline,8,muted,'center');text('Produced by Futura Group',right,baseline,8,muted,'right');
 }
 return doc.output('arraybuffer');
}
