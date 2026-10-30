let adminCsrf='',adminCursor='0',adminNext='0',adminRows=[],adminLoading=false;
async function adminRequest(action,method='GET',body){
  const r=await fetch('/api/admin?action='+action,{method,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-Admin-CSRF':adminCsrf},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});
  const data=await r.json();if(!r.ok){const e=Error(data.error||'Falha na consulta.');e.status=r.status;throw e;}return data;
}
function adminMessage(text){const el=$('admin-message');if(el)el.textContent=text;}
async function showAdmin(){
  screen='admin';
  $('main').innerHTML=`<section id="admin-view"><p class="eyebrow">Centro Universitário Campo Real</p><h1>Área do professor</h1><p id="admin-message" role="status">Verificando acesso…</p><div id="admin-content"></div></section>`;
  try{const session=await adminRequest('session');if(!$('admin-content'))return;adminCsrf=session.csrf;adminCursor='0';renderAdminShell();await loadAdminStudents();}catch(e){if($('admin-content'))renderAdminLogin(e.status===401?'':e.message);}
}
function renderAdminLogin(message=''){
  adminCsrf='';adminRows=[];adminMessage(message);
  $('admin-content').innerHTML=`<form id="admin-login" class="card admin-login"><label for="admin-email">E-mail do professor</label><input id="admin-email" type="email" autocomplete="username" required value="prof_pedroneto@camporeal.edu.br"><label for="admin-password">Senha</label><input id="admin-password" type="password" autocomplete="current-password" required maxlength="256"><button class="button" type="submit">Entrar no painel</button><p class="tiny">Acesso exclusivo do professor. Os alunos continuam entrando pelo nome.</p></form>`;
  $('admin-login').onsubmit=async event=>{event.preventDefault();const button=event.submitter;button.disabled=true;adminMessage('Validando acesso…');try{const session=await adminRequest('login','POST',{email:$('admin-email').value.trim(),password:$('admin-password').value});$('admin-password').value='';adminCsrf=session.csrf;adminCursor='0';renderAdminShell();await loadAdminStudents();}catch(e){adminMessage(e.message);}finally{if(button.isConnected)button.disabled=false;}};
}
function renderAdminShell(){
  $('admin-content').innerHTML=`<div class="actions"><button class="button secondary" id="admin-refresh">Atualizar lista</button><button class="button secondary" id="admin-first">Primeira página</button><button class="button secondary" id="admin-next">Próxima página</button><button class="button secondary" id="admin-password-open">Alterar senha</button><button class="button secondary" id="admin-logout">Sair</button></div><p class="tiny">Perfis do banco de questões oficiais. Perfis antigos continuam disponíveis na versão anterior. Nomes são informados pelos alunos; homônimos podem ter perfis distintos. Atualização automática a cada 30 segundos enquanto a lista estiver aberta. Ao visualizar um aluno, use Atualizar lista para consultar novas gravações.</p><label for="admin-filter">Filtrar nomes nesta página</label><input id="admin-filter" type="search" placeholder="Nome do aluno"><div id="admin-list"></div><div id="admin-detail"></div>`;
  $('admin-password-open').onclick=renderAdminPassword;
  $('admin-refresh').onclick=loadAdminStudents;$('admin-first').onclick=()=>{adminCursor='0';loadAdminStudents();};$('admin-next').onclick=()=>{adminCursor=adminNext;loadAdminStudents();};$('admin-filter').oninput=renderAdminRows;
  $('admin-logout').onclick=async()=>{try{await adminRequest('logout','POST',{});renderAdminLogin('Sessão encerrada.');}catch(e){adminMessage(e.message);}};
}
async function loadAdminStudents(){
  if(adminLoading||!$('admin-list'))return;adminLoading=true;adminMessage('Consultando alunos…');
  try{const data=await adminRequest('students&cursor='+encodeURIComponent(adminCursor));if(!$('admin-list'))return;adminRows=data.students.filter(r=>r.progress.bankId===BANK_ID);adminNext=data.cursor;$('admin-next').disabled=adminNext==='0';renderAdminRows();$('admin-detail').innerHTML='';adminMessage('Atualizado às '+new Date().toLocaleTimeString('pt-BR')+' · '+adminRows.length+' perfis nesta página.');}catch(e){if(e.status===401&&$('admin-content'))renderAdminLogin(e.message);else adminMessage(e.message);}finally{adminLoading=false;}
}
function renderAdminRows(){
  const query=$('admin-filter').value.toLocaleLowerCase('pt-BR'),rows=adminRows.filter(r=>r.name.toLocaleLowerCase('pt-BR').includes(query)).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  $('admin-list').innerHTML=rows.length?`<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Aluno</th><th>Respostas</th><th>Aproveitamento</th><th>Última gravação</th><th>Ações</th></tr></thead><tbody>${rows.map(r=>{const x=xpFor(r.progress.answers);return `<tr><td>${esc(r.name)}<small>${esc(r.id.slice(0,8))}</small></td><td>${x.n}/${TOTAL_QUESTIONS}<div class="progress"><span style="width:${Math.round(x.n/TOTAL_QUESTIONS*100)}%"></span></div></td><td>${x.n?Math.round(x.ok/x.n*100)+'%':'Sem respostas'}</td><td>${esc(new Date(r.updatedAt).toLocaleString('pt-BR'))}</td><td><button class="button secondary" data-admin-view="${r.id}">Ver progresso</button> <button class="button secondary danger-button" data-admin-delete="${r.id}">Excluir aluno</button></td></tr>`;}).join('')}</tbody></table></div>`:'<p class="notice">Nenhum perfil encontrado nesta página. Consulte a próxima página se disponível.</p>';
  document.querySelectorAll('[data-admin-view]').forEach(b=>b.onclick=()=>renderAdminDetail(adminRows.find(r=>r.id===b.dataset.adminView)));
  document.querySelectorAll('[data-admin-delete]').forEach(b=>b.onclick=()=>renderAdminDetail(adminRows.find(r=>r.id===b.dataset.adminDelete),true));
}
function renderAdminDetail(r, deleting=false){
  $('admin-detail').innerHTML=`<section class="card"><h2>${esc(r.name)}</h2><p class="tiny">Perfil ${esc(r.id)} · revisão ${r.revision}. Os percentuais de acerto consideram as questões respondidas.</p>${modules.map((m,i)=>{const answers=r.progress.answers[i]||{},count=m.quiz.filter((_,j)=>Number.isInteger(answers[j])).length,correct=m.quiz.filter((q,j)=>answers[j]===q[2]).length;return `<details><summary>${esc(m.title)} · ${count}/${m.quiz.length} respostas · ${count?Math.round(correct/count*100)+'%':'—'}</summary><p>${(r.progress.seen[i]||[]).length}/3 telas de conteúdo visitadas</p>${m.quiz.map((q,j)=>`<p><strong>Questão ${j+1}</strong> · ${esc(q[0])}<br>Resposta: ${answers[j]===undefined?'Não respondida':String.fromCharCode(65+answers[j])} · Gabarito: ${String.fromCharCode(65+q[2])}</p>`).join('')}</details>`;}).join('')}<details class="admin-delete" ${deleting?'open':''}><summary>Excluir perfil do banco</summary><p>A exclusão remove este perfil e suas respostas do banco. PDFs e cópias locais no aparelho do aluno permanecem. Para confirmar, digite o nome completo abaixo.</p><form id="admin-delete-form"><label for="admin-delete-name">${esc(r.name)}</label><input id="admin-delete-name" autocomplete="off" required><button class="button" type="submit">Excluir definitivamente este perfil</button></form></details></section>`;
  $('admin-delete-form').onsubmit=async event=>{event.preventDefault();if($('admin-delete-name').value!==r.name){adminMessage('Digite o nome exatamente como aparece no perfil.');return;}event.submitter.disabled=true;try{await adminRequest('student','DELETE',{id:r.id,revision:r.revision,name:$('admin-delete-name').value});await loadAdminStudents();adminMessage('Perfil excluído do banco.');}catch(e){adminMessage(e.message);if(event.submitter.isConnected)event.submitter.disabled=false;}};
  if(deleting)$('admin-delete-name').focus({preventScroll:true});
  $('admin-detail').scrollIntoView?.({behavior:'smooth',block:'start'});
}
function initAdmin(){const button=document.createElement('button');button.type='button';button.id='professor-login';button.textContent='Professor';button.onclick=showAdmin;document.querySelector('.top-actions').append(button);setInterval(()=>{if(adminCsrf&&$('admin-list')&&document.visibilityState!=='hidden'&&!$('admin-detail')?.innerHTML)loadAdminStudents();},30000);}

function renderAdminPassword(){
  adminMessage('');
  $('admin-content').innerHTML=`<form id="admin-password-form" class="card admin-login"><h2>Alterar senha</h2><label for="admin-current-password">Senha atual</label><input id="admin-current-password" type="password" autocomplete="current-password" required maxlength="256"><label for="admin-new-password">Nova senha</label><input id="admin-new-password" type="password" autocomplete="new-password" required minlength="7" maxlength="256"><label for="admin-confirm-password">Confirmar nova senha</label><input id="admin-confirm-password" type="password" autocomplete="new-password" required minlength="7" maxlength="256"><p class="tiny">Use de 7 a 256 caracteres. Ao salvar, todas as sessões serão encerradas. A nova senha vale imediatamente.</p><div class="actions"><button class="button" type="submit">Salvar nova senha</button><button class="button secondary" type="button" id="admin-password-cancel">Voltar ao painel</button></div></form>`;
  $('admin-password-cancel').onclick=()=>{renderAdminShell();loadAdminStudents();};
  $('admin-password-form').onsubmit=async event=>{
    event.preventDefault();
    if($('admin-new-password').value!==$('admin-confirm-password').value){adminMessage('A confirmação deve ser igual à nova senha.');return;}
    const button=event.submitter;button.disabled=true;
    try{await adminRequest('password','POST',{currentPassword:$('admin-current-password').value,newPassword:$('admin-new-password').value});renderAdminLogin('Senha alterada. Entre com a nova senha.');}
    catch(e){adminMessage(e.message);}finally{if(button.isConnected)button.disabled=false;}
  };
  $('admin-current-password').focus();
}
