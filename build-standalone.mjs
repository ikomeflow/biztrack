import {readFile,writeFile} from 'node:fs/promises';
const css=await readFile('dist/styles.css','utf8');const svg=await readFile('dist/icon.svg','utf8');
const theme=await readFile('dist/theme.js','utf8');
// Preserve module scope in the portable build (including private vault keys).
const names=['core.mjs','report.mjs','vault.mjs','app.mjs'];
const files=await Promise.all(names.map(f=>readFile('dist/'+f,'utf8')));
const js=files.map((source,index)=>{
 const exports=[...source.matchAll(/^export (?:async )?(?:function|class|const|let) (\w+)/gm)].map(m=>m[1]);
 const code=source.replace(/^import \{([^}]+)\} from '\.\/([^']+)';\r?\n/gm,(_,imports,file)=>`const {${imports.replace(/(\w+) as (\w+)/g,'$1:$2')}}=modules[${JSON.stringify(file.split('?')[0])}];\n`).replace(/^export /gm,'');
 return `modules[${JSON.stringify(names[index])}]=(()=>{\n${code}\nreturn {${exports.join(',')}};\n})();`;
}).join('\n');
let html=await readFile('dist/index.html','utf8');
html=html.replace('script-src \'self\'','script-src \'self\' \'unsafe-inline\'').replace(/<script src="\.\/theme\.js[^\"]*"><\/script>/,()=>`<script>${theme}</script>`).replace(/<link rel="stylesheet" href="\.\/styles\.css[^\"]*">/,()=>`<style>${css.replace('@charset "UTF-8";','')}</style>`).replace(/<script type="module" src="\.\/app\.mjs[^\"]*"><\/script>/,'').replaceAll('./icon.svg','data:image/svg+xml,'+encodeURIComponent(svg)).replace('</body>',()=>`<script type="module">const modules=Object.create(null);\n${js}</script></body>`);
await writeFile('../BizTrack.html',html);console.log('Standalone app: ../BizTrack.html');
