import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');
const origin = 'https://austinmeridian.com';
const corporateSocialImage = `${origin}/assets/austin-meridian-social-v1.jpg`;
const corporateSocialAlt = 'Austin Meridian: Built on vision. Defined by purpose. Independent apps, games and ideas.';
const pages = [
  { source: 'home', path: '/', title: 'Austin Meridian — Independent projects & new possibilities', description: 'Austin Meridian is the umbrella brand for independent projects, apps, games, and ideas. Explore our portfolio, beginning with FitQuest.', theme: 'studio' },
  { source: 'fitquest', path: '/fitquest/', title: 'FitQuest — Turn your effort into adventure | Austin Meridian', description: 'Complete real exercises, take on fantasy battles, and build your own adventure. Discover FitQuest, currently in development and testing.', theme: 'quest' },
  { source: 'privacy', path: '/fitquest/privacy/', title: 'FitQuest Privacy Policy | Austin Meridian', description: 'How FitQuest handles accounts, workout data, cloud saves, social features, notifications, advertising choices and account deletion.', theme: 'legal' },
  { source: 'support', path: '/fitquest/support/', title: 'FitQuest Support | Austin Meridian', description: 'Get help with FitQuest saves, daily challenges, notifications and privacy. Contact Austin Meridian support.', theme: 'legal' },
  { source: 'delete-account', path: '/fitquest/delete-account/', title: 'FitQuest Account & Data Deletion Information | Austin Meridian', description: 'Request FitQuest account deletion by email or follow the updated-build instructions. Learn what is removed, what can remain, and current testing limits.', theme: 'legal' },
  { source: '404', path: '/404.html', title: 'Page not found | Austin Meridian', description: 'Find your way back to Austin Meridian or explore FitQuest.', theme: 'studio', noindex: true }
];
function icon(type = 'arrow') {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
    chart: '<path d="M4 4v16h16M8 14l4-4 4 2 4-7"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 20 10a4 4 0 0 1-1 8Z"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>'
  };
  return `<svg class="interface-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[type] || paths.arrow}</svg>`;
}
function header(page) {
  const nav = [['/', 'Home'], ['/#projects', 'Projects'], ['/fitquest/', 'FitQuest'], ['/#about', 'About']];
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container header-inner"><a class="brand" href="${page.base}" aria-label="Austin Meridian home"><span class="brand-symbol" aria-hidden="true"><img src="${page.base}assets/austin-meridian-symbol-160.webp" alt="" width="160" height="80"></span><span class="brand-name">AUSTIN<span>MERIDIAN</span></span></a><button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation"><span></span><span></span></button><nav id="primary-nav" aria-label="Main navigation">${nav.map(([href,label])=>`<a href="${local(href,page.base)}"${page.path===href?' aria-current="page"':href==='/fitquest/'&&page.path.startsWith('/fitquest/')?' aria-current="location"':''}>${label}</a>`).join('')}<a class="nav-feature" href="${page.base}#contact">Contact ${icon('mail')}</a></nav></div><span class="page-progress" aria-hidden="true"></span></header>`;
}
function local(href, base) { return href.startsWith('/') ? base + href.slice(1) : href; }
function footer(page) {
  return `<footer class="site-footer"><div class="container"><div class="footer-top"><a class="footer-brand" href="${page.base}"><img src="${page.base}assets/austin-meridian-footer.webp" alt="Austin Meridian" width="320" height="213" loading="lazy" decoding="async"><span>Independent projects. Shared purpose.</span></a><div class="footer-links"><div><span class="eyebrow">AUSTIN MERIDIAN</span><a href="${page.base}#projects">Projects</a><a href="${page.base}#about">About</a><a href="${page.base}#contact">Contact</a></div><div><span class="eyebrow">FITQUEST RESOURCES</span><a href="${page.base}fitquest/">Explore FitQuest</a><a href="${page.base}fitquest/support/">FitQuest support</a><a href="${page.base}fitquest/privacy/">Privacy policy</a><a href="${page.base}fitquest/delete-account/">Account deletion</a></div></div></div><div class="footer-bottom"><span>© 2026 Austin Meridian</span><span>INDEPENDENT BY DESIGN.</span><a href="mailto:AustinMeridianHQ@gmail.com">Get in touch ${icon()}</a></div></div></footer>`;
}
await mkdir(out, {recursive: true});
await cp(resolve(root,'public'), out, {recursive: true});
// Content-address shared assets so a deployment cannot mix old CSS/JS with new HTML.
// Retain earlier fingerprints so previously cached HTML can still load its assets.
async function fingerprint(name) {
  const bytes = await readFile(resolve(out,'assets',name));
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0,12);
  const versioned = name.replace(/\.(css|js)$/,'.'+hash+'.$1');
  await writeFile(resolve(out,'assets',versioned),bytes);
  return versioned;
}
const cssFile = await fingerprint('design.css');
const jsFile = await fingerprint('site.js');
function resourceNav(page) {
  if (page.theme !== 'legal') return '';
  const links = [['/fitquest/','FitQuest'],['/fitquest/support/','Support'],['/fitquest/privacy/','Privacy policy'],['/fitquest/delete-account/','Account deletion']];
  return '<nav class="resource-navigation container" aria-label="FitQuest resources">'+links.map(([path,label])=>'<a href="'+local(path,page.base)+'"'+(page.path===path?' aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav>';
}
for (const page of pages) {
  const socialImage = page.theme==='quest' || page.theme==='legal' ? origin+'/assets/fitquest-social-v1.jpg' : corporateSocialImage;
  const socialAlt = page.theme==='quest' || page.theme==='legal' ? 'FitQuest: Turn your effort into adventure. An Austin Meridian project, in development.' : corporateSocialAlt;
  const depth = page.path.split('/').filter(Boolean).length;
  page.base = page.path === '/404.html' ? '/' : depth ? '../'.repeat(depth) : './';
  let content = await readFile(resolve(root,`src/pages/${page.source}.html`),'utf8');
  content = content.replaceAll('{{base}}',page.base).replaceAll('{{arrow}}',icon()).replace(/\{\{icon:([a-z]+)\}\}/g,(_,name)=>icon(name));
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"><title>${page.title}</title><meta name="description" content="${page.description}"><link rel="canonical" href="${origin}${page.path}"><meta name="robots" content="${page.draft||page.noindex?'noindex, nofollow':'index, follow'}"><meta property="og:type" content="website"><meta property="og:site_name" content="Austin Meridian"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:url" content="${origin}${page.path}"><meta property="og:image" content="${socialImage}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${socialAlt}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${page.title}"><meta name="twitter:description" content="${page.description}"><meta name="twitter:image" content="${socialImage}"><meta name="twitter:image:alt" content="${socialAlt}"><meta name="theme-color" content="#0B0D10"><link rel="icon" type="image/svg+xml" href="${page.base}assets/favicon.svg"><link rel="stylesheet" href="${page.base}assets/${cssFile}"><script src="${page.base}assets/${jsFile}" defer></script><noscript><style>@media(max-width:900px){.header-inner{height:auto;flex-wrap:wrap;padding-block:15px}.menu-toggle{display:none}.header-inner nav{display:flex;position:static;width:100%;padding:12px 0;background:transparent;border:0}}</style></noscript></head><body class="theme-${page.theme}">${header(page)}${resourceNav(page)}<main id="main" tabindex="-1">${content}</main>${footer(page)}</body></html>`;
  const destination = resolve(out, page.path === '/404.html' ? '404.html' : '.'+page.path+'index.html');
  await mkdir(dirname(destination),{recursive:true});
  await writeFile(destination,html);
}
await writeFile(resolve(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p=>!p.draft&&!p.noindex).map(p=>`<url><loc>${origin}${p.path}</loc></url>`).join('')}</urlset>\n`);
await writeFile(resolve(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://austinmeridian.com/sitemap.xml\n');
await writeFile(resolve(out,'.nojekyll'),'');
console.log('Built 6 approved static pages in dist/.');
