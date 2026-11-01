import test from 'node:test';
import assert from 'node:assert/strict';
import {reportPreset,historyDateLabel,overviewScope} from '../src/ui.mjs';
test('report shortcuts respect leap years and December to January boundaries',()=>{
 assert.deepEqual(reportPreset('last-month','2025-01-15'),{from:'2024-12-01',to:'2024-12-31'});
 assert.deepEqual(reportPreset('month','2024-02-29'),{from:'2024-02-01',to:'2024-02-29'});
 assert.deepEqual(reportPreset('last-month','2025-03-01'),{from:'2025-02-01',to:'2025-02-28'});
});
test('weekly reports start Monday and include Sunday across year and daylight-saving boundaries',()=>{
 assert.deepEqual(reportPreset('week','2026-11-01'),{from:'2026-10-26',to:'2026-11-01'});
 assert.deepEqual(reportPreset('week','2026-11-02'),{from:'2026-11-02',to:'2026-11-08'});
 assert.deepEqual(reportPreset('week','2025-01-01'),{from:'2024-12-30',to:'2025-01-05'});
});
test('date shortcuts reject invalid dates and stay inside supported calendar bounds',()=>{
 for(const value of ['2025-02-29','2026-13-01','not a date'])assert.throws(()=>reportPreset('today',value));
 assert.deepEqual(reportPreset('today','2026-11-01'),{from:'2026-11-01',to:'2026-11-01'});
 assert.throws(()=>reportPreset('unknown','2026-11-01'));
 assert.throws(()=>reportPreset('last-month','1900-01-01'));
 assert.deepEqual(reportPreset('week','9999-12-31'),{from:'9999-12-27',to:'9999-12-31'});
});
test('history headings distinguish Today and Yesterday across months and leap days',()=>{
 assert.equal(historyDateLabel('2026-11-01','2026-11-01'),'Today');
 assert.equal(historyDateLabel('2026-10-31','2026-11-01'),'Yesterday');
 assert.equal(historyDateLabel('2024-02-29','2024-03-01'),'Yesterday');
 assert.equal(historyDateLabel('2025-12-31','2026-11-01'),'31 Dec 2025');
});
test('overview scope makes each period and currency explicit',()=>{
 assert.equal(overviewScope('today','2026-11','USD','2026-11-01'),'Today · USD');
 assert.equal(overviewScope('all','2026-11','XAF','2026-11-01'),'All time · XAF');
 assert.equal(overviewScope('month','2026-10','EUR','2026-11-01'),'October 2026 · EUR');
});
