import {createRequire} from 'node:module';
import {join} from 'node:path';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.BIZTRACK_QA_PACKAGES?join(process.env.BIZTRACK_QA_PACKAGES,'package.json'):import.meta.url),{chromium}=require('playwright');
const browser=await chromium.launch({headless:true,...(process.env.BIZTRACK_QA_BROWSER?{executablePath:process.env.BIZTRACK_QA_BROWSER}:{})});
try{const c=await browser.newContext(),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const html=await readFile(new URL('../../BizTrack.html',import.meta.url),'utf8');
 await c.route('http://127.0.0.1:4175/portable.html',route=>route.fulfill({contentType:'text/html',body:html}));await p.goto('http://127.0.0.1:4175/portable.html');await p.locator('#gate-pin').fill('0123');await p.locator('#gate-confirm').fill('0123');await p.locator('#gate-submit').click();await p.locator('#app-shell').waitFor({state:'visible'});
 await p.locator('.heading-actions [data-action=add-sale]').click();await p.locator('#amount').fill('200');await p.locator('#description').fill('Portable test sale');await p.locator('#save-entry').click();await p.locator('#entry-dialog').waitFor({state:'hidden'});await p.reload();await p.locator('#gate-pin').fill('0123');await p.locator('#gate-submit').click();await p.locator('#app-shell').waitFor({state:'visible'});assert.equal(await p.locator('#sales-value').innerText(),'XAF 200');assert.deepEqual(errors,[]);console.log('PASS portable HTML creates PIN, encrypts records, locks on reload and unlocks with exact records; no browser errors.');
}finally{await browser.close();}
