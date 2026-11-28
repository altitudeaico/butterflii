const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('private source and environment exclusions remain configured',()=>{
 const rules=new Set(fs.readFileSync(path.join(root,'.assetsignore'),'utf8').split(/\r?\n/).map(s=>s.trim()));
 for(const rule of ['server/','database/','hq/','.env','.env.*','**/.env','**/.env.*','**/.dev.vars','**/.dev.vars.*']) assert.ok(rules.has(rule),'Missing exclusion: '+rule);
});
