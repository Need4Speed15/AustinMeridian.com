import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';

const root=resolve(import.meta.dirname,'../dist');
async function walk(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())result.push(...await walk(p));else result.push(p);}return result;}
const files=await walk(root);
const htmlFiles=files.filter(p=>extname(p)==='.html');
assert.equal(htmlFiles.length,6,'Expected five requested pages and one 404 page');
const ids=new Map();
for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  const found=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(found.length,new Set(found).size,`Duplicate ID in ${file}`);
  ids.set(file,new Set(found));
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`Exactly one h1 in ${file}`);
  for(const required of ['<title>','name="description"','rel="canonical"','name="viewport"','property="og:image"','<html lang="en"','Skip to content','<main id="main"']) assert(html.includes(required),`${file} missing ${required}`);
  assert(!/\{\{[^{}]+\}\}/.test(html),`Unresolved template marker in ${file}`);
  for(const image of html.matchAll(/<img\b[^>]*>/g)) assert(/\balt="[^"]*"/.test(image[0]),`Missing image alt in ${file}`);
  assert(!/<(?:iframe|form)\b|https?:\/\/[^"\s]+\.apk|support@gmail\.com|TODO/.test(html),`Unexpected embed, form, APK or placeholder in ${file}`);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const ref=match[1].replaceAll('&amp;','&');
    if(ref.startsWith('https://')||ref.startsWith('mailto:'))continue;
    assert(!ref.startsWith('http://'),`Insecure external URL in ${file}`);
    const pageUrl=new URL('https://local.test/'+relative(root,file).replaceAll('\\','/'));
    const targetUrl=new URL(ref,pageUrl);
    let target=resolve(root,'.'+decodeURIComponent(targetUrl.pathname));
    if((await stat(target)).isDirectory())target=resolve(target,'index.html');
    if(targetUrl.hash){const targetHtml=await readFile(target,'utf8');assert(targetHtml.includes(`id="${targetUrl.hash.slice(1)}"`),`Broken anchor ${ref} in ${file}`);}
  }
  if(file.endsWith('privacy\\index.html')||file.endsWith('delete-account\\index.html')||file.includes('/privacy/')||file.includes('/delete-account/')){
    assert(html.includes('noindex, nofollow'),'Review drafts must not be indexed');
    assert(/DRAFT FOR OWNER REVIEW|OWNER REVIEW/.test(html),'Review label must remain visible');
  }
}
const css=await readFile(resolve(root,'assets/styles.css'),'utf8');
assert(css.includes('prefers-reduced-motion:reduce'),'Reduced motion support required');
assert(css.includes(':focus-visible'),'Visible focus required');
for(const match of css.matchAll(/url\((?:['"])?\.\/([^)'"\s]+)/g))await stat(resolve(root,'assets',match[1]));
assert(files.every(p=>!/[\\/]\.(?:env|git)(?:[.\\/]|$)|\.apk$|service.account|google-services\.json|\.jks$|\.keystore$/i.test(p)),'Private mobile/runtime material must not be deployed');
const size=(await Promise.all(files.map(p=>stat(p)))).reduce((n,s)=>n+s.size,0);
console.log(`PASS: ${htmlFiles.length} pages; internal links/anchors/assets; metadata; alt text; draft gates; reduced motion/focus; private-file exclusions.`);
console.log(`Static output: ${files.length} files, ${(size/1024/1024).toFixed(2)} MiB. No package dependencies.`);
