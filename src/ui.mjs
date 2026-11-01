// Calendar helpers work on date strings; they never access saved business data.
const iso=d=>d.toISOString().slice(0,10);
function calendar(value){
 const d=new Date(value+'T12:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(+d)||iso(d)!==value||value<'1900-01-01'||value>'9999-12-31')throw Error('Choose a valid date.');
 return d;
}
export function reportPreset(kind,reference){
 const d=calendar(reference),year=d.getUTCFullYear(),month=d.getUTCMonth();
 if(kind==='today')return {from:reference,to:reference};
 if(kind==='week'){
  const first=new Date(d);first.setUTCDate(first.getUTCDate()-(first.getUTCDay()+6)%7);
  const last=new Date(first);last.setUTCDate(last.getUTCDate()+6);
  return {from:first<calendar('1900-01-01')?'1900-01-01':iso(first),to:last>calendar('9999-12-31')?'9999-12-31':iso(last)};
 }
 if(kind!=='month'&&kind!=='last-month')throw Error('Unknown report period.');
 if(kind==='last-month'&&reference.slice(0,7)==='1900-01')throw Error('No earlier supported month.');
 const offset=kind==='last-month'?-1:0;
 return {from:iso(new Date(Date.UTC(year,month+offset,1,12))),to:iso(new Date(Date.UTC(year,month+offset+1,0,12)))};
}
export function historyDateLabel(value,reference){
 const d=calendar(value),now=calendar(reference),yesterday=new Date(now);yesterday.setUTCDate(yesterday.getUTCDate()-1);
 if(value===reference)return 'Today';
 if(value===iso(yesterday))return 'Yesterday';
 return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(d);
}
export function overviewScope(period,month,currency,reference){
 if(period==='today'){calendar(reference);return 'Today · '+currency;}
 if(period==='all')return 'All time · '+currency;
 const d=calendar(month+'-01');
 return new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(d)+' · '+currency;
}
