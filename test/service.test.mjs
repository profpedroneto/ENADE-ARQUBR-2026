import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID,randomBytes} from 'node:crypto';import {makeService,ApiError,cleanProgress} from '../server/service.js';import {safeOrigin,jsonBody} from '../server/http.js';
class MemoryStore{records=new Map();counter=0;async get(id){return structuredClone(this.records.get(id)||null);}async create(r){if(this.records.has(r.id))return false;this.records.set(r.id,structuredClone(r));return true;}async rate(){return ++this.counter;}async compareSwap(id,hash,revision,next){const r=this.records.get(id);if(!r)return'missing';if(r.tokenHash!==hash)return'denied';if(r.revision!==revision)return'conflict';this.records.set(id,structuredClone(next));return'ok';}}
const credentials=()=>{const id=randomUUID(),secret=randomBytes(32).toString('base64url');return{id,secret,code:`CR1.${id}.${secret}`};};
async function fixture(name='Aluno Teste'){const store=new MemoryStore(),service=makeService(store),c=credentials(),p=await service.create({name,id:c.id,secret:c.secret},'127.0.0.1');return{store,service,c,p};}
test('criação idempotente, sem expor hash ou segredo',async()=>{const {store,service,c,p}=await fixture();assert.equal(p.name,'Aluno Teste');assert(!('tokenHash'in p));assert(!JSON.stringify(p).includes(c.secret));assert.equal((await service.create({name:'Mesmo',id:c.id,secret:c.secret},'ip')).id,p.id);assert.equal(store.records.size,1);assert.equal((await service.read(c.code)).id,p.id);});
test('nomes iguais não compartilham registros; código incorreto é negado',async()=>{const {service,c,p}=await fixture('Mesmo Nome'),b=credentials();const q=await service.create({name:'Mesmo Nome',id:b.id,secret:b.secret},'ip');assert.notEqual(p.id,q.id);await assert.rejects(service.read(`CR1.${c.id}.${b.secret}`),e=>e.status===401);});
test('primeira resposta é preservada no servidor e seen é união',async()=>{const {service,c,p}=await fixture();const x=await service.save(c.code,{revision:p.revision,attemptId:p.attemptId,mode:'merge',progress:{answers:{0:{0:1}},seen:{0:[0]}}});const y=await service.save(c.code,{revision:x.revision,attemptId:x.attemptId,mode:'merge',progress:{answers:{0:{0:4,1:3}},seen:{0:[1]}}});assert.equal(y.progress.answers[0][0],1);assert.equal(y.progress.answers[0][1],3);assert.deepEqual(y.progress.seen[0],[0,1]);});
test('CAS não aceita gravação concorrente com revisão antiga',async()=>{const {service,c,p}=await fixture();const body={revision:p.revision,attemptId:p.attemptId,mode:'merge',progress:{answers:{0:{0:1}}}};const results=await Promise.allSettled([service.save(c.code,body),service.save(c.code,body)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);const rejected=results.find(r=>r.status==='rejected').reason;assert.equal(rejected.status,409);assert.equal(rejected.details.profile.revision,1);});
test('cliente antigo não apaga primeiras respostas com replace',async()=>{const {service,c,p}=await fixture();const first=await service.save(c.code,{revision:0,attemptId:p.attemptId,mode:'merge',progress:{answers:{0:{0:1}}}});const reset=await service.save(c.code,{revision:1,attemptId:first.attemptId,mode:'replace',progress:{answers:{},resetAt:Date.now()}});assert.equal(reset.attemptId,first.attemptId);assert.equal(reset.progress.answers[0][0],1);const retry=await service.save(c.code,{revision:2,attemptId:first.attemptId,mode:'replace',progress:{answers:{0:{0:4,1:2}}}});assert.equal(retry.progress.answers[0][0],1);assert.equal(retry.progress.answers[0][1],2);});
test('entrada inválida e criação abusiva são rejeitadas',async()=>{assert.throws(()=>cleanProgress({answers:{10:{0:1}}}),ApiError);assert.throws(()=>cleanProgress({answers:{0:{0:9}}}),ApiError);assert.throws(()=>cleanProgress({answers:[]}),ApiError);const {store,service}=await fixture(),c=credentials();store.counter=300;await assert.rejects(service.create({name:'Aluno',id:c.id,secret:c.secret},'ip'),e=>e.status===429);});
test('origem externa e JSON acima do limite são rejeitados',async()=>{assert.throws(()=>safeOrigin({headers:{origin:'https://outro.example',host:'aula.example'}}),e=>e.status===403);assert.doesNotThrow(()=>safeOrigin({headers:{origin:'https://aula.example',host:'aula.example'}}));await assert.rejects(jsonBody({headers:{'content-type':'application/json'},body:'x'.repeat(48001)}),e=>e.status===413);});

test('banco oficial não recebe respostas da versão anterior nem questões inexistentes',async()=>{
 const bankId='inep-au-2026-10-v2',store=new MemoryStore(),service=makeService(store),c=credentials();
 const p=await service.create({name:'Teste Oficial',id:c.id,secret:c.secret,bankId});
 const base={revision:0,attemptId:p.attemptId,mode:'merge'};
 await assert.rejects(service.save(c.code,{...base,progress:{answers:{0:{0:1}}}}),e=>e.status===409);
 for(const answers of [{0:{1:0}},{7:{0:0}},{8:{0:0}}])await assert.rejects(service.save(c.code,{...base,progress:{bankId,answers}}),e=>e.status===400);
 const first=await service.save(c.code,{...base,progress:{bankId,answers:{0:{0:0}}}});
 const reset=await service.save(c.code,{revision:first.revision,attemptId:first.attemptId,mode:'replace',progress:{bankId,answers:{0:{0:3}}}});
 assert.equal(reset.progress.answers[0][0],0);assert.equal(reset.attemptId,p.attemptId);
});

class ShortStore extends MemoryStore {
 values=new Map(); collision=true;
 async command(cmd,...args){
  if(cmd==='GET')return this.values.get(args[0])??null;
  if(cmd==='EVAL'){const [, ,reverse,forward,id,code]=args;if(this.values.has(reverse))return this.values.get(reverse);if(this.collision){this.collision=false;return '';}if(this.values.has(forward))return '';this.values.set(forward,id);this.values.set(reverse,code);return code;}
  throw Error(cmd);
 }
 async rate(key){if(key.startsWith('short-fail:')){const k='cr:rate:'+key,n=(this.values.get(k)||0)+1;this.values.set(k,n);return n;}return super.rate(key);}
}
test('código curto preserva identidade, respostas e código antigo, mesmo após colisão',async()=>{
 const store=new ShortStore(),service=makeService(store,'test-ip'),c=credentials();
 const p=await service.create({name:'Aluno Teste',id:c.id,secret:c.secret});
 const {code}=await service.shortCode(c.code);assert.match(code,/^\d{6}$/);
 assert.equal((await service.shortCode(c.code)).code,code);assert.equal((await service.shortCode(code)).code,code);
 const saved=await service.save(code,{revision:0,attemptId:p.attemptId,mode:'merge',progress:{answers:{0:{0:2}}}});
 assert.equal(saved.progress.answers[0][0],2);assert.equal((await service.read(c.code)).progress.answers[0][0],2);
 store.records.delete(c.id);await assert.rejects(service.read(code),e=>e.status===401);assert.equal(store.values.get('cr:short:'+code),c.id);
});
test('vinte códigos incorretos limitam tentativas posteriores',async()=>{
 const store=new ShortStore(),service=makeService(store,'test-ip');
 for(let i=0;i<20;i++)await assert.rejects(service.read('000000'),e=>e.status===401);
 await assert.rejects(service.read('000000'),e=>e.status===429);
});
