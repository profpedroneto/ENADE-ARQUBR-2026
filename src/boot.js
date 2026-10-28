// Este aviso só aparece quando a inicialização falha; não envia dados.
window.addEventListener('error',function(){
 if(document.body.getAttribute('data-app-ready')==='true')return;
 const main=document.getElementById('main');if(!main)return;
 main.innerHTML='<section class="card boot" role="alert"><h1>Não foi possível iniciar a aula</h1><p>Recarregue a página. Se continuar, baixe o HTML e abra-o em um navegador, fora do visualizador de anexos.</p><p>As respostas já salvas não foram apagadas.</p><button class="button" id="retry-boot">Tentar novamente</button></section>';
 document.getElementById('retry-boot').onclick=function(){window.location.reload();};
});
