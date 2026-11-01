const BASE=new URL('./',self.location.href);
const PREFIX='biztrack:'+BASE.pathname+':';
const CACHE=PREFIX+'v17-20261101-browser-install';
const INDEX=new URL('index.html',BASE).href;
const OPEN=new URL('open.html',BASE).href;
const SHELL=['index.html','app-v9.mjs','styles-v9.css','report-v3.mjs','icon.svg','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'].map(p=>new URL(p,BASE).href);
// Save the visible screen first; installation icons and optional tools must not
// compete with its download on a slow connection. Both stages must finish.
const CORE=SHELL.filter(url=>/\/(?:index\.html|app-v\d+\.mjs|styles-v\d+\.css|icon\.svg)$/.test(url));
const EXTRAS=SHELL.filter(url=>!CORE.includes(url));
// A candidate becomes available only when its entire matching app is saved.
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(async c=>{await c.addAll(CORE);await c.addAll(EXTRAS);}).catch(async error=>{await caches.delete(CACHE);throw error;})));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==BASE.origin)return;
 const url=new URL(e.request.url);url.search='';url.hash='';
 const navigation=e.request.mode==='navigate'&&(url.pathname===BASE.pathname||url.href===INDEX||url.href===OPEN);
 if(!navigation&&!SHELL.includes(url.href))return;
 e.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(navigation?INDEX:url.href))||fetch(e.request)));
});
