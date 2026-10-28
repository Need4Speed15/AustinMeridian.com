import {readFile} from 'node:fs/promises';
const review=JSON.parse(await readFile(new URL('../release-review.json',import.meta.url),'utf8'));
const pending=Object.entries(review).filter(([,v])=>v!==true).map(([k])=>k);
const privacy=await readFile(new URL('../src/pages/privacy.html',import.meta.url),'utf8');
const deletion=await readFile(new URL('../src/pages/delete-account.html',import.meta.url),'utf8');
const build=await readFile(new URL('./build.mjs',import.meta.url),'utf8');
if(/DRAFT FOR OWNER REVIEW|No effective date assigned|Decisions required before publication/.test(privacy))pending.push('final privacy text and effective date');
if(/OWNER REVIEW/.test(deletion))pending.push('final account-deletion status wording');
if(/draft:\s*true/.test(build))pending.push('remove draft metadata/labels only after owner approval');
if(pending.length){console.error('Publication is not approved. Pending:\n- '+pending.join('\n- '));process.exitCode=1;}
else console.log('Release-review declarations and final text checks passed.');
