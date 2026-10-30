import test from 'node:test';import assert from 'node:assert/strict';import {scryptSync,randomUUID} from 'node:crypto';
import {makeAdmin,verifyPassword,ADMIN_EMAIL} from '../server/admin.js';
import handler from '../api/admin.js';
const salt='a'.repeat(32),password='Somente-para-teste-123',hash='scrypt:'+salt+':'+scryptSync(password,salt,64).toString('hex');
class MemoryStore{
  values=new Map();rates=new Map();
  async rate(key){const n=(this.rates.get(key)||0)+1;this.rates.set(key,n);return n;}
  async get(id){const raw=this.values.get('cr:profile:'+id);return raw?JSON.parse(raw):null;}
  async command(cmd,...args){if(cmd==='GET')return this.values.get(args[0])||null;if(cmd==='SET'){this.values.set(args[0],args[1]);return'OK';}if(cmd==='DEL')return this.values.delete(args[0]);if(cmd==='SCAN')return['0',[...this.values.keys()].filter(x=>x.startsWith('cr:profile:'))];if(cmd==='EVAL'&&args[1]===1){const [,count,key,fallback,expected,next]=args;if((this.values.get(key)||fallback)!==expected)return 'conflict';this.values.set(key,next);return 'ok';}if(cmd==='EVAL'){const [,count,key,tomb,revision,name]=args;assert.equal(count,2);const r=JSON.parse(this.values.get(key)||'null');if(!r)return'missing';if(r.revision!==Number(revision)||r.name!==name)return'conflict';this.values.set(tomb,'1');this.values.delete(key);return'ok';}throw Error(cmd);}
}
test('senha scrypt, sessão opaca e revogação pela troca de senha',async()=>{
  const store=new MemoryStore(),admin=makeAdmin(store,{ADMIN_PASSWORD_HASH:hash});assert(verifyPassword(password,hash));assert(!verifyPassword('errada',hash));assert(!verifyPassword(password,'inválida'));
  await assert.rejects(admin.authenticate(''),e=>e.status===401);await assert.rejects(admin.login(ADMIN_EMAIL,'errada','ip'),e=>e.status===401);
  const session=await admin.login(ADMIN_EMAIL,password,'ip');assert.equal(session.token.length,43);assert(![...store.values.keys()].some(x=>x.includes(session.token)));assert.equal((await admin.authenticate(session.token)).csrf,session.csrf);
  await assert.rejects(makeAdmin(store,{ADMIN_PASSWORD_HASH:hash+'x'}).authenticate(session.token),e=>e.status===401);
  await admin.logout(session.token);await assert.rejects(admin.authenticate(session.token),e=>e.status===401);
});
test('tentativas de login limitadas e configuração obrigatória',async()=>{
  const store=new MemoryStore(),admin=makeAdmin(store,{ADMIN_PASSWORD_HASH:hash});for(let i=0;i<10;i++)await assert.rejects(admin.login(ADMIN_EMAIL,'errada','ip'),e=>e.status===401);await assert.rejects(admin.login(ADMIN_EMAIL,password,'ip'),e=>e.status===429);await assert.rejects(makeAdmin(store,{}).login(ADMIN_EMAIL,password,'ip'),e=>e.status===503);
});
test('lista não revela códigos; exclusão exige revisão e nome, mantém bloqueio de recriação',async()=>{
  const store=new MemoryStore(),admin=makeAdmin(store,{ADMIN_PASSWORD_HASH:hash}),id=randomUUID();store.values.set('cr:profile:'+id,JSON.stringify({id,name:'Aluno Teste',tokenHash:'segredo',revision:3,attemptId:'tentativa',progress:{answers:{0:{0:1}},seen:{}},updatedAt:'2026-10-28'}));
  const page=await admin.list();assert.equal(page.students.length,1);assert(!JSON.stringify(page).includes('segredo'));await assert.rejects(admin.list('injetado'),e=>e.status===400);await assert.rejects(admin.remove(id,2,'Aluno Teste'),e=>e.status===409);await assert.rejects(admin.remove(id,3,'Outro'),e=>e.status===409);assert(await store.get(id));await admin.remove(id,3,'Aluno Teste');assert.equal(await store.get(id),null);assert.equal(store.values.get('cr:deleted:'+id),'1');
});
test('API nega consulta anônima, origem externa e exclusão sem CSRF',async()=>{
  const oldFetch=globalThis.fetch,env={...process.env};process.env.UPSTASH_REDIS_REST_URL='https://redis.test';process.env.UPSTASH_REDIS_REST_TOKEN='test';process.env.ADMIN_PASSWORD_HASH=hash;process.env.VERCEL='1';
  const session={csrf:'valid-csrf',version:(await import('../server/service.js')).digest(hash)};
  globalThis.fetch=async(url,options)=>({ok:true,json:async()=>({result:JSON.parse(options.body)[1].startsWith('cr:admin-password:')?null:JSON.stringify(session)})});
  const call=async(method,url,headers={})=>{const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(raw){this.body=JSON.parse(raw);}};await handler({method,url,headers:{host:'aula.test',...headers}},res);return res;};
  try{assert.equal((await call('GET','/api/admin?action=students')).statusCode,401);assert.equal((await call('GET','/api/admin?action=students',{origin:'https://evil.test'})).statusCode,403);assert.equal((await call('DELETE','/api/admin?action=student',{cookie:'cr_admin='+'a'.repeat(43)})).statusCode,403);assert.equal((await call('POST','/api/admin?action=password',{cookie:'cr_admin='+'a'.repeat(43)})).statusCode,403);const r=await call('GET','/api/admin?action=session',{cookie:'cr_admin='+'a'.repeat(43)});assert.equal(r.statusCode,200);assert.equal(r.body.csrf,'valid-csrf');assert.equal(r.headers['Cache-Control'],'no-store, private');}finally{globalThis.fetch=oldFetch;for(const key of ['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','ADMIN_PASSWORD_HASH','VERCEL'])if(env[key]===undefined)delete process.env[key];else process.env[key]=env[key];}
});

test('troca de senha exige senha atual, persiste e revoga todas as sessões',async()=>{
 const store=new MemoryStore(),env={ADMIN_PASSWORD_HASH:hash},admin=makeAdmin(store,env);
 const a=await admin.login(ADMIN_EMAIL,password,'a'),b=await admin.login(ADMIN_EMAIL,password,'b');
 await assert.rejects(admin.changePassword(a.token,'incorreta','Nova-senha-123'),e=>e.status===401);
 await assert.rejects(admin.changePassword(a.token,password,'curta'),e=>e.status===400);
 await admin.changePassword(a.token,password,'Nova-senha-123');
 for(const token of [a.token,b.token])await assert.rejects(admin.authenticate(token),e=>e.status===401);
 const fresh=makeAdmin(store,env);
 await assert.rejects(fresh.login(ADMIN_EMAIL,password,'c'),e=>e.status===401);
 assert((await fresh.login(ADMIN_EMAIL,'Nova-senha-123','c')).token);
 assert(![...store.values.values()].some(v=>v.includes('Nova-senha-123')));
 // Resetting the bootstrap hash intentionally starts a new password namespace.
 const resetHash='scrypt:'+salt+':'+scryptSync('Reset-123',salt,64).toString('hex');
 assert((await makeAdmin(store,{ADMIN_PASSWORD_HASH:resetHash}).login(ADMIN_EMAIL,'Reset-123','d')).token);
});
