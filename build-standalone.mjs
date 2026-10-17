import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
// Bundle PDF generation into this portable file while retaining module scope.
const bundled=await build({absWorkingDir:fileURLToPath(new URL('.',import.meta.url)),entryPoints:['src/app.mjs'],bundle:true,minify:true,format:'esm',target:['es2022'],tsconfigRaw:{},write:false,define:{__BIZTRACK_PORTABLE__:'true'},plugins:[{name:'portable-report',setup(api){api.onResolve({filter:/^\.\/report-v2\.mjs$/},()=>({path:fileURLToPath(new URL('dist/report.mjs',import.meta.url))}));}}]});
const js=bundled.outputFiles[0].text,hash=createHash('sha256').update(js).digest('base64');
const css=await readFile('dist/styles-v3.css','utf8'),svg=await readFile('dist/icon.svg','utf8');
let html=await readFile('dist/index.html','utf8');
html=html.replace("script-src 'self'",`script-src 'self' 'sha256-${hash}'`).replace('<link rel="stylesheet" href="./styles-v3.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="./app-v3.mjs"></script>','').replaceAll('./icon.svg','data:image/svg+xml,'+encodeURIComponent(svg)).replace('</body>',()=>`<script type="module">${js}</script></body>`);
await writeFile('../BizTrack.html',html);console.log('Standalone app: ../BizTrack.html');
