const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('private source and environment exclusions remain configured',()=>{
 const rules=new Set(fs.readFileSync(path.join(root,'.assetsignore'),'utf8').split(/\r?\n/).map(s=>s.trim()));
 for(const rule of ['server/','database/','hq/','.env','.env.*','**/.env','**/.env.*','**/.dev.vars','**/.dev.vars.*']) assert.ok(rules.has(rule),'Missing exclusion: '+rule);
});

test('Worker serves only staged assets and routes API first',()=>{
 const config=JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8'));
 assert.equal(config.main,'server/storefront-worker.ts');
 assert.equal(config.assets.directory,'./dist-public');
 assert.equal(config.assets.binding,'ASSETS');
 assert.deepEqual(config.assets.run_worker_first,['/api','/api/*']);
 assert.equal(config.build.command,'node scripts/build-public.cjs');
});
test('generated public directory excludes private files',()=>{
 require('node:child_process').execFileSync(process.execPath,[path.join(root,'scripts/build-public.cjs')]);
 const out=path.join(root,'dist-public');
 const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  assert.ok(!e.isSymbolicLink(),'Unexpected symlink');
  return e.isDirectory()?walk(p):[path.relative(out,p).split(path.sep).join('/')];
 });
 const files=walk(out);
 for(const p of files) assert.match(p,/^(?:(?:index|gallery|shop|artwork|contact|tracking|customer-care|commissions|partnerships|press)\.html|(?:catalogue|merchandise|storefront|basket|gallery-render|contact)\.js|art\/[a-z0-9-]+\.html|images\/[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp|svg))$/);
 for(const p of ['index.html','shop.html','gallery.html','basket.js','storefront.js']) assert.ok(files.includes(p),p);
 for(const p of ['server','database','docs','hq','.git','.env','.dev.vars','wrangler.jsonc']) assert.ok(!fs.existsSync(path.join(out,p)),p);
});
