import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=f=>fs.readFileSync(new URL('../src/'+f,import.meta.url),'utf8');
const context=vm.createContext({});
vm.runInContext(['conteudo.js','banco.js','comentarios.js','aprofundamento.js','modelos.js'].map(read).join('\n')+'\nfunction esc(s){return s;} globalThis.data={modules,officialItems,questionComments,theoryNotes,questionFeedback,solveTruss,modelView,ms};',context);
const d=context.data;
test('cada questão tem comentários para as cinco escolhas e mantém chave e fac-símile',()=>{
 const json=JSON.parse(read('questoes-oficiais.json'));
 assert.equal(d.officialItems.length,json.length);
 for(const item of d.officialItems){
  assert.deepEqual(JSON.parse(JSON.stringify(item)),json.find(x=>x.id===item.id));
  const comment=d.questionComments[`${item.year}-${item.number}`];assert(comment?.reason.length>100);
  assert.equal(comment.options.length,5);assert(comment.options.every(x=>typeof x==='string'&&x.trim().length>0));
  for(let answer=0;answer<5;answer++){const html=d.questionFeedback(item,answer);assert(html.includes(comment.options[answer]));assert(html.includes(comment.reason));assert(html.includes('Gabarito oficial: '+ 'ABCDE'[item.key]));assert(html.includes(answer===item.key?'Resposta correta':'Vamos revisar'));
  }
  for(const img of item.images)assert(fs.existsSync(new URL('../public'+img,import.meta.url)));
 }
});
test('os dez módulos têm aprofundamento nas três etapas e controles independentes do menu lateral',()=>{
 assert.equal(d.theoryNotes.length,10);
 for(let i=0;i<10;i++){
  assert.equal(d.theoryNotes[i].length,3);for(const paragraphs of d.theoryNotes[i])assert(paragraphs.length>=2&&paragraphs.every(p=>p.length>150));
  const model=d.modelView(i);assert(model.includes('Como ler este desenho'));assert(model.includes('aria-haspopup="dialog"'));assert(!model.includes('<aside'));
 }
});
test('treliça mantém equilíbrio ao alternar carga e força',()=>{
 for(const mode of [0,1])for(const F of [5,10,30]){
  const tr=d.solveTruss(F,mode);assert(tr.forces.every(Number.isFinite));
  assert(Math.abs(tr.forces[16]+tr.forces[17]-F*(mode?1:4))<1e-8);
  if(!mode)assert(Math.abs(tr.forces[16]-tr.forces[17])<1e-8);
  else assert(Math.abs(tr.forces[17]*12-F*4.5)<1e-8);
 }
});
test('exclusão no painel envia identificador, revisão e nome somente após confirmação exata',async()=>{
 const elements=new Map(),requests=[];const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',value:'',textContent:'',focus(){},scrollIntoView(){}});return elements.get(id);};
 const c=vm.createContext({$:el,modules:[],esc:s=>s,document:{querySelectorAll:()=>[]}});
 vm.runInContext(read('admin.js')+'\nglobalThis.render=renderAdminDetail;globalThis.setRequest=fn=>{adminRequest=fn;loadAdminStudents=async()=>{};};',c);
 c.setRequest(async(...args)=>{requests.push(args);return{deleted:true};});
 c.render({id:'perfil-teste',name:'Aluno Teste',revision:7,progress:{answers:{},seen:{}}},true);
 assert(el('admin-detail').innerHTML.includes('class="admin-delete" open'));
 const submitter={disabled:false,isConnected:true},event={preventDefault(){},submitter};
 el('admin-delete-name').value='Outro aluno';await el('admin-delete-form').onsubmit(event);assert.equal(requests.length,0);
 el('admin-delete-name').value='Aluno Teste';await el('admin-delete-form').onsubmit(event);
 assert.deepEqual(JSON.parse(JSON.stringify(requests)),[['student','DELETE',{id:'perfil-teste',revision:7,name:'Aluno Teste'}]]);
});

test('simulado tem 8 + 4 questões e preserva os endereços das respostas anteriores',()=>{
 const c=vm.createContext({});
 vm.runInContext(['conteudo.js','banco.js','curso.js'].map(read).join('\n')+'\nglobalThis.d={modules,officialItems,examEntries,storedQuestionTotal,TOTAL_QUESTIONS};',c);
 assert.equal(c.d.TOTAL_QUESTIONS,12);
 assert.equal(c.d.examEntries(0).length,8);assert.equal(c.d.examEntries(1).length,4);
 for(const g of [0,1])for(const e of c.d.examEntries(g))assert.equal(e.q[4].id,c.d.officialItems.filter(q=>q.module===e.i)[e.j].id);
 assert.equal(c.d.storedQuestionTotal(3),3);assert.equal(c.d.storedQuestionTotal(9),2);
});
test('recuperação guarda respostas históricas fora da seleção atual',()=>{
 const c=vm.createContext({});
 vm.runInContext(['conteudo.js','banco.js','identificacao.js'].map(read).join('\n')+'\nglobalThis.decode=decodeProgress;',c);
 const restored=c.decode(JSON.stringify({version:1,bankId:'inep-au-2026-10-v2',answers:{3:{2:1},9:{1:4}}}));
 assert.equal(restored.answers[3][2],1);assert.equal(restored.answers[9][1],4);
});

test('formulário de senha exige confirmação e volta ao login após salvar',async()=>{
 const elements=new Map(),requests=[];const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',value:'',textContent:'',focus(){}});return elements.get(id);};
 const c=vm.createContext({$:el});vm.runInContext(read('admin.js')+'\nglobalThis.render=renderAdminPassword;globalThis.setup=fn=>{adminRequest=fn;};',c);
 c.setup(async(...args)=>{requests.push(args);return{ok:true};});c.render();
 el('admin-current-password').value='Atual-123';el('admin-new-password').value='Nova-123';el('admin-confirm-password').value='Outra-123';
 const event={preventDefault(){},submitter:{disabled:false,isConnected:true}};
 await el('admin-password-form').onsubmit(event);assert.equal(requests.length,0);
 el('admin-confirm-password').value='Nova-123';await el('admin-password-form').onsubmit(event);
 assert.equal(requests[0][0],'password');assert.equal(requests[0][2].newPassword,'Nova-123');assert(el('admin-content').innerHTML.includes('id="admin-login"'));assert(el('admin-message').textContent.includes('Senha alterada'));
});

test('marcadores distinguem resultado parcial e final; XP conta apenas dois simulados',()=>{
 const c=vm.createContext({window:{}});vm.runInContext(['conteudo.js','banco.js','painel.js'].map(read).join('\n')+'\nglobalThis.d={modules,blockPerformance,xpFor};',c);
 const answers={};assert.equal(c.d.blockPerformance(answers).label,'Não iniciado');
 c.d.modules.forEach((m,i)=>{answers[i]={};m.quiz.forEach((q,j)=>answers[i][j]=q[2]);});
 assert.equal(c.d.blockPerformance(answers).label,'Destaque');assert.equal(c.d.xpFor(answers).xp,420);assert.equal(c.d.xpFor(answers).completed,2);
 delete answers[0][0];assert.equal(c.d.blockPerformance(answers).label,'Em andamento');assert.equal(c.d.blockPerformance(answers,1).done,true);assert.equal(c.d.xpFor(answers).completed,1);
 c.d.modules.forEach((m,i)=>m.quiz.forEach((q,j)=>answers[i][j]=(q[2]+1)%5));assert.equal(c.d.blockPerformance(answers).label,'Reforçar conceitos');
 let index=0;c.d.modules.forEach((m,i)=>m.quiz.forEach((q,j)=>{if(index++<8)answers[i][j]=q[2];}));assert.equal(c.d.blockPerformance(answers).label,'Bom avanço');
});
