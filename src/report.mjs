import {jsPDF} from 'jspdf';
import font from './NotoSans-Regular.ttf';
import {amountText,money,totals,CURRENCIES} from '../dist/core.mjs';

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
 for(const [index,label,value] of [[0,'Sales',sum.sales],[1,'Expenses',sum.expenses],[2,'Net profit',sum.profit]]){
  const x=left+index*column,total=money(value,currency),size=Math.min(15,15*(column-12)/Math.max(column-12,measure(total,15)));
  text(label,x,y,9,muted);text(total,x,y+24,size,index===2?blue:ink);
 }
 y+=45;text('Recorded sales minus recorded expenses. No currency conversion.',left,y,8,muted);y+=30;tableHeading();
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
  doc.setPage(page);rule(bottom+14);text(`Private / Generated on this device / ${localDate(generatedAt)}`,left,bottom+31,8,muted);text(`${page} / ${pages}`,right,bottom+31,8,muted,'right');
 }
 return doc.output('arraybuffer');
}
