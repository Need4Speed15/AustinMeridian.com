import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(import.meta.dirname,'../dist');
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain'};
const server = createServer(async (req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    const file = resolve(root,'.'+decodeURIComponent(url.pathname));
    if (file!==root&&!file.startsWith(root+sep)) { res.writeHead(403).end(); return; }
    let target=file;
    const info=await stat(file);
    if(info.isDirectory()) {
      if(!url.pathname.endsWith('/')) {res.writeHead(301,{Location:url.pathname+'/'+url.search}).end();return;}
      target=resolve(file,'index.html');
    }
    const bytes=await readFile(target);
    res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(bytes);
  } catch {
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
    res.end(await readFile(resolve(root,'404.html')));
  }
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
