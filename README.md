# Campo Real · Retomada ENADE · GitHub → Vercel

## Revisão local de 29/10/2026 — ainda não publicada

Esta revisão está em análise local. Não enviar para GitHub/Vercel antes da revisão do professor: um push pode disparar publicação automática.

- `node build.mjs` atualiza `public/index.html`; `node dev.mjs` abre o servidor local; `node --test test/*.test.mjs` executa os testes.
- Os dez modelos têm controles próprios, orientação de leitura e ampliação em diálogo. No computador, o desenho se ajusta à janela; no celular, a ampliação permite rolagem horizontal. Fechar ou pressionar Escape retorna ao conteúdo.
- A navegação identifica Conceitos, Relações, Aplicação, Questões ENADE e Síntese. O próximo módulo é anunciado pelo nome. O cronômetro do aluno foi removido; o roteiro do professor continua separado.
- `src/aprofundamento.js` complementa as 30 etapas teóricas. `src/comentarios.js` contém comentários didáticos autorais para cada uma das cinco alternativas dos 14 itens oficiais, exibidos depois da confirmação.
- `src/questoes-oficiais.json` registra prova, ano, questão, gabarito e imagens originais. `public/questoes/` precisa acompanhar o HTML: as imagens não estão embutidas nele. O simulado tem 12 questões: 8 de estruturas e 4 de instalações/interfaces, reunidas ao final dos dois blocos. Os 14 registros originais permanecem no banco para preservar respostas históricas; dois ficam fora da seleção atual. Elétrica e incêndio permanecem conceituais, sem questão oficial nesta seleção.
- Revisar desde o início preserva respostas. O servidor também preserva a primeira alternativa recebida, inclusive quando um cliente antigo pede substituição. A recuperação de cópias combina dados e preserva respostas já existentes no navegador.
- O banco oficial tem identificador próprio, sem recalcular respostas antigas com novos gabaritos. A versão anterior permanece em `public/versao-anterior/`.
- Professor → entrar com senha → Excluir aluno. A confirmação exige nome exato e revisão vigente; o servidor bloqueia recriação do perfil excluído. Cópias locais e PDFs já entregues não são apagados. A exclusão foi testada com banco simulado, sem remover alunos reais.

Antes de publicação, revisar pedagogicamente os comentários, validar os fluxos com o banco do ambiente de teste e conferir o PDF. Esta seção descreve a revisão local; as instruções de hospedagem abaixo são para a etapa posterior.

Projeto pronto para subir a um repositório e importar na Vercel. Preserva a aula de 200 minutos, os 10 módulos, modelos interativos, trilha de progresso, nome obrigatório, perfis locais, recuperação e relatório em PDF.

Código disponível no repositório https://github.com/profpedroneto/ENADE-ARQUBR-2026. A sincronização e o painel administrativo foram testados com banco simulado; a ativação e o teste na hospedagem dependem das configurações abaixo.

## O que funciona sem configurar banco

O aluno abre o endereço, informa o nome e acompanha a aula. Respostas e progresso ficam no navegador, com cópia local e arquivo de recuperação. O PDF é gerado no aparelho para envio ao professor. Não exige Google, senha ou conta de outro serviço.

O aplicativo é responsivo para navegadores atuais em celular, tablet e PC. Não é necessário instalar. A interface completa deve ser ensaiada nos dispositivos reais antes da aula; testes de código não garantem compatibilidade com navegadores antigos ou visualizadores de anexos.

## O que muda ao ativar a sincronização

O primeiro acesso continua exigindo **somente o nome**. O navegador cria uma credencial aleatória e o servidor guarda apenas seu hash. O aluno recebe um **código privado de recuperação** no formato `CR1...` e deve guardá-lo. Em outro dispositivo, abre o mesmo site, escolhe **Abrir perfil pelo código** e informa esse código.

- O nome é identificação declarada, não comprovação de identidade acadêmica.
- Nomes iguais criam perfis separados; não há pesquisa pública de alunos pelo nome.
- Quem tem o código pode acessar e alterar aquele perfil. Ele funciona como uma chave de acesso: não compartilhe em grupos, URLs ou capturas de tela.
- Reabrir no mesmo navegador usa a credencial já guardada, sem digitá-la novamente.
- Sem o código, sem os dados do navegador e sem uma cópia da aula, não há recuperação do perfil online apenas pelo nome. Isso evita entregar os dados de outra pessoa com o mesmo nome.

O progresso é salvo primeiro no navegador e enviado em seguida. A interface só afirma sincronização após resposta do servidor. Em desconexão, os dados locais e o PDF continuam funcionando; o envio é tentado novamente. Outro aparelho consulta atualizações a cada 30 segundos enquanto a página está visível. Não é um painel de presença em tempo real.

Se o mesmo perfil for usado simultaneamente em dois aparelhos, prevalece a alternativa que o servidor já recebeu para cada questão na mesma tentativa. Uma resposta feita offline pode ser conciliada com uma resposta recebida antes em outro aparelho. Confira o placar após a confirmação online antes de emitir o PDF final.

## 1. Subir ao GitHub

1. Extraia o ZIP fornecido, se estiver usando o pacote.
2. Crie um repositório no GitHub.
3. Envie **o conteúdo desta pasta** à raiz do repositório, incluindo `src`, `vendor`, `server`, `api`, `test`, `public`, `build.mjs`, `package.json`, `package-lock.json` e `vercel.json`.
4. Não envie o ZIP como se fosse o código do aplicativo. Não envie `.env.local`, tokens ou `node_modules`.

Se preferir manter esta pasta dentro de um repositório maior, configure a Root Directory da Vercel para a pasta `campo-real-vercel`.

## 2. Importar na Vercel

1. Na Vercel, escolha **Add New → Project**, conecte o GitHub e selecione o repositório.
2. Se esta pasta estiver na raiz, mantenha Root Directory como `.`.
3. Framework Preset: **Other**. O `vercel.json` já define:
   - Install Command: `npm ci --ignore-scripts`
   - Build Command: `npm run build`
   - Output Directory: `public`
4. Faça o deploy. As funções de `api/` são parte do projeto e usam Node.js 22.
5. Use o **endereço estável de produção** para a turma. URLs de preview e domínios diferentes não compartilham armazenamento local. Para mudar de endereço ou aparelho, o código online ou a cópia da aula permitem recuperar o progresso.

Sem as variáveis de banco, o deploy funciona em modo local e informa que a sincronização não está configurada.

## 3. Ativar perfis sincronizados — Upstash Redis

Na integração nativa do Marketplace Vercel, conecte o banco ao ambiente Production. O servidor reconhece automaticamente `KV_REST_API_URL` e `KV_REST_API_TOKEN`, injetadas pela integração; não é preciso copiar esses segredos. O par `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` abaixo continua disponível para configuração direta.

A Vercel hospeda o aplicativo e as funções; o banco persiste os perfis. Esta implementação usa a API REST do Upstash Redis, adequada a funções sem servidor. **Não depende de arquivos gravados no disco da Vercel.**

1. Crie/conecte um banco Redis no Upstash, pelo Marketplace/Storage da Vercel ou pelo painel do provedor.
2. Copie as credenciais **REST** e configure em Project → Settings → Environment Variables:

   ```text
   UPSTASH_REDIS_REST_URL=https://...upstash.io
   UPSTASH_REDIS_REST_TOKEN=...
   ```

3. Aplique ao ambiente **Production**. Se quiser testar Preview, prefira um banco separado para não misturar testes e dados da turma.
4. Faça um novo deploy para aplicar as variáveis.
5. Abra `/api/config`: deverá retornar `"cloudEnabled": true`. Esse endpoint não revela credenciais. Isso confirma configuração presente; o ensaio abaixo confirma acesso real ao banco.

Não coloque o token no código ou em variáveis com prefixo público. O servidor lê essas duas variáveis. O navegador só fala com `/api/config`, `/api/profile` e `/api/progress` no próprio site.

Não é necessário executar SQL ou criar tabelas. As chaves de perfil são criadas pelo aplicativo. O projeto não define expiração automática de progresso; retenção, backups e disponibilidade dependem do banco e do plano escolhido. Confira limites e custos atuais dos provedores antes de abrir o acesso à turma. A criação de perfis limita 300 tentativas por origem de rede em 10 minutos; redes institucionais podem compartilhar essa cota.

## 4. Ensaio obrigatório antes da aula

1. No computador, entre com um nome de teste, abra um módulo e confirme uma resposta.
2. Confira o salvamento local e a confirmação **online** na barra. Se houver aviso de falha online, não considere o banco validado.
3. Abra **Meu código de recuperação online**, copie e guarde o código em local privado.
4. Em celular ou tablet, abra o endereço de produção, escolha **Abrir perfil pelo código**, consulte e confirme o perfil. Confira nome, resposta e pontuação.
5. Responda outro item no segundo aparelho. No primeiro, volte à aba e aguarde a consulta periódica para conferir a conciliação.
6. Desconecte a internet durante a aula já aberta: confirme um item, confira o aviso de envio pendente e reconecte. Só avance o teste depois da confirmação online.
7. Feche e reabra no mesmo navegador. Confira retomada e pontuação.
8. Baixe uma cópia da aula e teste recuperação. Gere o PDF e abra o arquivo no aparelho.
9. Teste retrato/paisagem, zoom e os controles dos modelos. Navegadores de aplicativos de mensagem podem limitar download; prefira Chrome, Edge, Firefox ou Safari atualizados.

O HTML não tem service worker: abrir a página pela primeira vez ou recarregar sem conexão depende do cache do navegador. Uma página já aberta pode continuar funcionando com os recursos incorporados.

## Segurança e limites

- Credencial aleatória de 256 bits; o banco guarda seu hash, não o código completo.
- Cada leitura/escrita exige o código daquele perfil. Não há lista pública de alunos ou autenticação por nome.
- Primeiras respostas são preservadas no servidor durante a mesma tentativa; pontuação não é aceita como entrada do cliente.
- Escritas usam revisão e comparação atômica. Conflitos recebem dados atuais para conciliação; um aparelho antigo não deve reintroduzir uma tentativa reiniciada.
- Se um reinício local encontrar uma versão online mais recente, a sincronização pausa e pede conferência pelo código. Não afirma que o reinício foi aplicado.
- O relatório continua sendo um treino formativo, sem verificação de identidade acadêmica ou certificado. O gabarito continua no material de estudo.
- A área administrativa exige banco configurado e senha do professor. Ela consulta progresso sincronizado; não mede presença ou autoria. Os PDFs continuam sendo entregues pelo aluno.
- O operador do projeto e o provedor do banco podem acessar os registros de nome e progresso. Ajuste a comunicação aos alunos às práticas da instituição. O uso não envia dados ao Google.

## Desenvolvimento e manutenção

```text
npm ci
npm run build
npm test
npm run dev
```

Para testar com banco localmente, copie `.env.example` para `.env.local` e preencha os valores privados. `npm run dev` usa `http://127.0.0.1:3000`. A publicação usa HTTPS e mantém a credencial do perfil no dispositivo.

Edite os arquivos em `src/`; `build.mjs` recompõe `public/index.html`. A biblioteca PDF está em `vendor/`, incorporada no build. As fontes e o logotipo estão locais; não há download externo de recursos para montar a interface. As dependências de execução do backend são módulos nativos do Node.js.

Testes incluídos cobrem criação idempotente, isolamento de homônimos, autorização por código, primeira resposta, concorrência, reinício, validação, limite de criação, origem e build. Os testes de integração do cliente foram realizados com DOM e serviço simulados; não houve deploy ou ensaio com Redis real nesta entrega.

Referências oficiais: [GitHub na Vercel](https://vercel.com/docs/git/vercel-for-github), [Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js), [Storage da Vercel](https://vercel.com/docs/storage), [Upstash REST](https://upstash.com/docs/redis/features/restapi).


## Área protegida do professor

O botão **Professor**, disponível antes de informar nome de aluno, abre um login com o e-mail `prof_pedroneto@camporeal.edu.br` e senha própria. O e-mail sozinho não concede acesso.

1. No seu computador, dentro da pasta do projeto, execute `npm run admin:setup`.
2. Guarde a senha gerada em seu gerenciador de senhas. O programa exibe também um valor iniciado por `scrypt:`.
3. Na Vercel, adicione **ADMIN_PASSWORD_HASH** com o valor completo iniciado por `scrypt:` ao ambiente Production. As duas variáveis de banco também precisam estar configuradas.
4. Faça novo deploy e entre pelo botão Professor com o e-mail e a senha gerada. Não envie a senha nem o hash ao GitHub ou pelo chat.

O painel lista os alunos sincronizados, filtra nomes na página atual, mostra questões respondidas, acertos e telas consultadas por módulo. Há paginação e atualização a cada 30 segundos enquanto a lista está aberta. Uma lista vazia com Próxima página disponível pode ocorrer pela paginação do Redis. Não representa presença online ou confirmação de autoria das respostas.

A sessão dura até oito horas, usando cookie HttpOnly, SameSite Strict e Secure na Vercel; a senha é verificada no servidor com scrypt. Dez tentativas de login por IP são permitidas a cada dez minutos. Sair invalida a sessão. Gerar e configurar um novo hash revoga as sessões anteriores.

Para excluir, abra Ver progresso → Excluir perfil do banco e digite exatamente o nome do aluno. A operação verifica a revisão para evitar excluir um registro que mudou desde a consulta. Remove os dados do banco e mantém apenas um bloqueio pelo identificador aleatório para impedir recriação automática pela sincronização antiga. PDFs, backups e dados já salvos no aparelho do aluno não são apagados remotamente. Um novo perfil pode ser criado pelo aluno.

Ensaio antes da aula: entre como aluno de teste, responda uma questão e aguarde confirmação online; entre no painel do professor em outro navegador, consulte esse perfil; exclua somente esse perfil de teste após digitar o nome; confirme que ele saiu da lista. Confira também que outro navegador sem sessão não consegue abrir `/api/admin?action=students`. Os testes automatizados usam dados simulados e não apagam alunos reais.

## Cadernos de estudo e simulados

A leitura tem três etapas por tema e não é interrompida por questões. O laboratório interativo fica em seção independente, com nove modelos; compatibilização final usa teoria e imagens estáticas. O ateliê de TCC trata de malhas de pilares, continuidade vertical, escolha de sistemas por programa e coordenação em planta e corte. Há glossário e nove ilustrações próprias em public/figuras/.

O caderno de incêndio referencia o catálogo oficial do CBMPR, com NPT 011 (janeiro de 2024), NPT 009 (2014) e NPT 013. Informa a transição normativa anunciada para 5 de novembro de 2026 e orienta a conferir a edição vigente no protocolo. Material didático não substitui projeto e verificação normativa completos.

## Publicação automática suspensa

Esta revisão foi autorizada para o GitHub, sem publicação na Vercel. O arquivo `vercel.json` mantém `git.deploymentEnabled: false` para impedir deploys automáticos por push. Quando a publicação for autorizada, remover essa configuração ou alterá-la para `true` antes de enviar a versão a publicar.
