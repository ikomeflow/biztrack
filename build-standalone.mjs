import {readFile,writeFile} from 'node:fs/promises';
const css=await readFile('dist/styles.css','utf8');const svg=await readFile('dist/icon.svg','utf8');
const theme=await readFile('dist/theme.js','utf8');
const files=await Promise.all(['core.mjs','report.mjs','app.mjs'].map(f=>readFile('dist/'+f,'utf8')));
const js=files.map(s=>s.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')).join('\n');
let html=await readFile('dist/index.html','utf8');
html=html.replace('script-src \'self\'','script-src \'self\' \'unsafe-inline\'').replace(/<script src="\.\/theme\.js[^\"]*"><\/script>/,()=>`<script>${theme}</script>`).replace(/<link rel="stylesheet" href="\.\/styles\.css[^\"]*">/,()=>`<style>${css.replace('@charset "UTF-8";','')}</style>`).replace(/<script type="module" src="\.\/app\.mjs[^\"]*"><\/script>/,'').replaceAll('./icon.svg','data:image/svg+xml,'+encodeURIComponent(svg)).replace('</body>',()=>`<script type="module">${js}</script></body>`);
await writeFile('../BizTrack.html',html);console.log('Standalone app: ../BizTrack.html');
