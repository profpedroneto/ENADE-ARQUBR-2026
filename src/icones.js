// Ícones vetoriais locais: sem fontes de ícones, biblioteca ou conexão externa.
function icon(name,extra=''){
const shapes={
map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
structure:'<path d="M3 8h18M5 8v13m14-13v13M3 21h18M12 8v13M4 8l8-5 8 5"/>',
beam:'<path d="M3 8h18v5H3ZM6 13l-3 6h6Zm12 0-3 6h6ZM7 2v4m5-4v4m5-4v4"/>',
truss:'<path d="M2 18 7 6l5 12 5-12 5 12ZM7 6h10M7 6v12m10-12v12"/>',
layers:'<path d="m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
ruler:'<path d="m4 16 12-12 5 5L9 21ZM9 11l2 2m2-6 2 2m-10 6 2 2"/>',
water:'<path d="M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
pipes:'<path d="M4 3v8a4 4 0 0 0 4 4h8v6M9 3v7h7a5 5 0 0 1 5 5v6M2 3h9m3 18h9"/>',
bolt:'<path d="m14 2-9 12h7l-2 8 9-12h-7Z"/>',
fire:'<path d="M12 2c1 5-2 6-2 9 2 0 4-2 4-4 4 4 6 7 4 11a7 7 0 0 1-12 0C3 13 8 8 12 2Z"/><path d="M12 13c-4 4-3 7 0 8 3-1 4-4 0-8Z"/>',
link:'<path d="m9 15 6-6M8 17l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 10a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1" transform="translate(1 0) scale(.9)"/>',
flag:'<path d="M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
book:'<path d="M12 5c-3-3-7-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-2-10 1Zm0 0v15"/>',
trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0ZM7 5H3v3a5 5 0 0 0 5 5m9-8h4v3a5 5 0 0 1-5 5M12 14v6m-5 1h10"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
rank:'<path d="m12 2 3 3 4 1 1 4 2 3-3 3-1 4-4 1-3 1-3-3-4-1-1-4-1-3 3-3 1-4 4-1Z"/><path d="m8 12 3 3 5-6"/>',
star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
check:'<path d="m5 12 4 4L19 6"/>',
play:'<path d="m8 4 12 8-12 8Z"/>',
chart:'<path d="M4 3v18h17M9 16v-5m5 5V6m5 10v-8"/>',
users:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m1-18a4 4 0 0 1 0 8m2 3a7 7 0 0 1 3 6"/>',
upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
download:'<path d="M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
screen:'<path d="M3 3h18v13H3Zm9 13v6m-5 0h10"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>'
};return `<svg class="ui-icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes[name]||shapes.compass}</svg>`;
}
function buildTrail(g,next){const ids=modules.map((m,i)=>i).filter(i=>modules[i].group===g),names=['structure','beam','truss','layers','ruler','water','pipes','bolt','fire','link'];let paths='';
for(let j=0;j<4;j++){const x=j%2?280:120,xx=j%2?120:280,y=56+j*124,yy=y+124;const done=answered(ids[j])===3&&answered(ids[j+1])===3,active=answered(ids[j])===3&&ids[j+1]===next;paths+=`<path class="route-segment ${done?'route-done':active?'route-active':''}" d="M${x} ${y}C${x} ${y+62} ${xx} ${yy-62} ${xx} ${yy}"/>`;}
const complete=ids.every(i=>answered(i)===3);paths+=`<path class="route-segment ${complete?'route-done':''}" d="M120 552C120 605 200 605 200 645"/>`;
return `<div class="module-map game-trail"><svg class="trail-connectors" viewBox="0 0 400 700" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>${ids.map((i,j)=>{const m=modules[i],done=answered(i)===3,started=!!(answered(i)||state.seen[i]?.length),current=i===next;return `<button type="button" class="module-tile ${done?'completed':started?'started':''} ${current?'current-node':''}" data-dash-module="${i}" style="--trail-row:${j};--node-x:${j%2?70:30}%" ${current?'aria-current="step"':''}><span class="tile-index">${icon(done?'check':names[i])}<span class="node-number">${String(i+1).padStart(2,'0')}</span>${current&&!done?'<span class="node-current-label">ATUAL</span>':''}</span><span class="tile-label"><strong>${m.short}</strong><small>${done?'Concluído · '+correct(i)+'/3 acertos':answered(i)?'Em andamento · '+answered(i)+'/3 respostas':started?'Conteúdo iniciado':'Disponível'}</small>${done?`<span class="tile-stars" aria-label="${correct(i)} de 3 acertos">${[0,1,2].map(k=>icon('star',k<correct(i)?'star-earned':'')).join('')}</span>`:`<span class="tile-meta">20 min · até 120 XP</span>`}</span></button>`;}).join('')}<div class="trail-checkpoint ${complete?'checkpoint-earned':''}"><span>${icon('trophy')}</span><strong>${complete?'Fase concluída':'Fim da fase'}</strong><small>${ids.filter(i=>answered(i)===3).length}/5 quizzes concluídos</small></div></div>`;
}
function decorateHeader(){const labels={home:['compass','Painel'],menu:['map','Módulos'],projector:['screen','Projeção'],sources:['book','Fontes e guia']};Object.entries(labels).forEach(([id,[name,text]])=>{const b=document.getElementById(id);if(b)b.innerHTML=icon(name)+`<span>${text}</span>`;});}
