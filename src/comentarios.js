// Comentários didáticos autorais; enunciados e gabaritos permanecem os do INEP.
const questionComments = {
  '2023-26': {
    reason:'I, II e IV são verdadeiras. Os tirantes trabalham à tração e equilibram os balanços, transmitindo esforços às ancoragens e às paredes da fundação. A membrana protege os ambientes da incidência solar. III é falsa: a viga metálica recebe carregamento transversal e trabalha à flexão e ao cisalhamento; não deve ser confundida com um tirante.',
    options:['Reconhece I e II, mas deixa de incluir IV: a proteção solar também integra a solução apresentada.','Inclui III, que confunde viga com tirante, e omite II e IV.','Inclui III, falsa, e omite as contribuições estruturais descritas em I e II.','Reúne exatamente I, II e IV, sem incluir a afirmação falsa III.','Inclui III, falsa, e exclui I, que descreve o equilíbrio entre os balanços.']
  },
  '2019-32': {
    reason:'A asserção I é verdadeira: a protensão participa da solução que viabiliza o grande vão do MASP. II é falsa porque a protensão introduz compressão prévia no concreto; não retarda a compressão. Essa compressão pode compensar tensões de tração produzidas pelo carregamento, ajudando a controlar fissuras e deformações.',
    options:['Considera II verdadeira e explicativa, mas seu mecanismo está invertido: a protensão introduz compressão.','Também considera II verdadeira; o problema vem antes da relação causal, pois II é falsa.','Distingue corretamente a aplicação da protensão em I da explicação incorreta em II.','Inverte os valores: I é verdadeira e II é falsa.','Descarta I, embora a protensão participe da solução estrutural do vão livre.']
  },
  '2019-33': {
    reason:'As três afirmações são verdadeiras no sistema descrito. A continuidade entre vigas e pilares faz o pórtico trabalhar como conjunto; sua repetição organiza o desenvolvimento longitudinal do pavilhão; e a concentração dos apoios na periferia libera o espaço expositivo interno.',
    options:['Inclui apenas I e omite a repetição longitudinal e a liberação espacial reconhecidas em II e III.','Inclui III, mas também são verdadeiras I e II.','Omite III: a posição periférica dos elementos resistentes favorece o interior livre.','Omite I: vigas e pilares participam conjuntamente da transmissão dos esforços.','Inclui os três aspectos corretos: comportamento do pórtico, repetição longitudinal e espaço interno.']
  },
  '2023-17': {
    reason:'I e II são verdadeiras no contexto apresentado: a estrutura metálica permite grandes vãos e menos apoios, e sua pré-fabricação favorece a organização da montagem. III é falsa: industrialização não dispensa modulação, precisão das ligações nem compatibilização. Essas condições precisam ser planejadas para que as vantagens se concretizem.',
    options:['I é verdadeira, mas II também descreve uma vantagem da solução apresentada.','III é falsa porque o sistema exige planejamento e compatibilidade entre peças e projetos.','Inclui I e II e exclui corretamente a suposta dispensa de modulação e compatibilização.','Inclui III, falsa, e omite I, verdadeira.','Inclui III: facilidade de montagem não autoriza dispensar modulação e compatibilização.']
  },
  '2019-26': {
    reason:'O conjunto ilustrado é um pórtico transversal treliçado biarticulado: barras trianguladas constituem os elementos do pórtico e existem duas articulações nos apoios. A repetição desses pórticos ao longo da quadra sustenta a cobertura. O tipo de vínculo e a organização das barras distinguem as alternativas.',
    options:['Identifica a geometria treliçada transversal e as duas articulações da solução.','Acrescenta uma terceira articulação que não caracteriza o sistema apresentado.','Alma cheia designa um elemento contínuo; a imagem apresenta barras formando uma treliça.','Confunde pórticos planos repetidos com uma treliça espacial e altera os vínculos para engastes.','Classifica como arco engastado um sistema apresentado como pórtico treliçado biarticulado.']
  },
  '2023-23': {
    reason:'No gabarito do item, I e II são verdadeiras, mas II não justifica I. A distribuição das cargas pelas paredes orienta a solução de fundação. Já tratamento e proteção da madeira respondem à durabilidade diante de umidade e agentes de degradação. São requisitos diferentes. A resistência natural citada em II deve ser lida no contexto da durabilidade, sem confundi-la com baixa capacidade mecânica de toda madeira.',
    options:['Confunde duas afirmações verdadeiras com uma relação de causa: proteção da madeira não explica a distribuição das cargas.','Reconhece que as duas afirmações tratam de requisitos válidos, mas sem a relação causal proposta.','Descarta a necessidade de proteção descrita em II, considerada verdadeira no item.','Descarta I, embora as paredes portantes distribuam cargas ao longo dos apoios.','Descarta ambas, que o gabarito considera verdadeiras; o erro está na relação causal.']
  },
  '2023-24': {
    reason:'O gabarito reúne I, II e IV. O item reconhece o potencial resistente do bambu e a importância de protegê-lo da umidade do terreno. III é falsa porque o uso combinado com outros materiais pode ser projetado. V é falsa porque o bambu pode compor vigas e treliças. A comparação de II não torna bambu e aço intercambiáveis: anisotropia, variabilidade, estabilidade e ligações precisam de análise própria.',
    options:['Omite II e IV, consideradas verdadeiras no gabarito, incluindo a proteção contra umidade.','III traz uma proibição geral indevida ao uso combinado do bambu com outros materiais.','V é falsa: o bambu pode integrar vigas e treliças dimensionadas para esse uso.','Reúne I, II e IV e exclui as restrições generalizantes de III e V.','Inclui III e V, falsas; a necessidade de proteção em IV não valida essas duas afirmações.']
  },
  '2019-23': {
    reason:'I, II e IV são verdadeiras nas hipóteses do enunciado. A estrutura independente permite distinguir vedação de elementos portantes; alvenaria estrutural restringe alterações espaciais; LSF depende de industrialização e mão de obra qualificada. III é falsa ao dizer que desmontar drywall é mais trabalhoso que demolir alvenaria. Em uma reforma real, verificar a função da parede e suas interfaces continua indispensável.',
    options:['Inclui III, que inverte a comparação de desmontagem, e omite II e IV.','Inclui III, falsa, e omite I e IV.','II e IV estão corretas, mas I também é verdadeira na hipótese de divisórias não portantes.','Reúne I, II e IV, excluindo a comparação incorreta em III.','Inclui III, falsa, e omite a restrição de flexibilidade da alvenaria estrutural em II.']
  },
  '2011-25': {
    reason:'A alternativa A combina dois balanços iguais de 175 cm com vão central de 525 cm. Sob a mesma carga uniforme, os momentos negativos dos balanços reduzem o momento positivo no vão. Entre as opções desenhadas, A produz o menor pico absoluto de momento. “Mais econômica” é o critério simplificado do enunciado, não uma comparação completa de custos ou um dimensionamento.',
    options:['Os balanços simétricos e o vão central mais curto reduzem o maior momento entre as alternativas.','O vão de 750 cm e um único balanço de 125 cm deixam um momento positivo maior que em A.','Os balanços menores e o vão de 625 cm reduzem menos o momento positivo que a configuração A.','O vão de 700 cm com um só balanço não equilibra os momentos tão favoravelmente quanto A.','A assimetria dos balanços e o vão de 575 cm deixam um pico de momento maior que em A.']
  },
  '2019-11': {
    reason:'I e II são verdadeiras: participação e acesso das comunidades integram a dimensão social, e vegetação nativa participa da recuperação ecológica local. III é falsa ao desqualificar todo o projeto apenas pelo uso de concreto. Sustentabilidade exige avaliação do conjunto e do ciclo de vida, incluindo impactos dos materiais, gestão da água, energia e benefícios sociais.',
    options:['Omite II, que também relaciona a vegetação nativa às condições ecológicas locais.','III adota um critério isolado e absoluto para julgar todo o projeto.','Inclui os aspectos social e ecológico válidos e rejeita a desqualificação automática pelo concreto.','Inclui III, falsa, e omite a dimensão social reconhecida em I.','Inclui III: reconhecer impactos do concreto não basta para invalidar toda a solução.']
  },
  '2023-25': {
    reason:'I é verdadeira: jardins de chuva podem reter temporariamente, infiltrar e retardar parte do escoamento, contribuindo para reduzir alagamentos. II é falsa ao colocar como focos principais o tratamento das águas de toda a bacia e a estética do passeio. Filtração e qualidade paisagística são benefícios, mas não substituem a função de manejo local das águas pluviais descrita no item.',
    options:['Trata II como verdadeira e causal, embora ela distorça a finalidade principal da solução.','Ainda considera II verdadeira; não basta negar a relação causal.','Reconhece o efeito hidrológico de I e o equívoco de finalidade em II.','Inverte os valores de verdade das duas asserções.','Descarta I, apesar da contribuição da retenção e infiltração para reduzir o escoamento.']
  },
  '2019-14': {
    reason:'I e III são verdadeiras: infraestrutura verde pode integrar benefícios hidrológicos, ecológicos e urbanos, e suas camadas de solo, vegetação e materiais filtrantes contribuem para o manejo da chuva. II é falsa porque não existe a incompatibilidade geral alegada com lazer e recreação; essas funções podem ser integradas com projeto e manutenção adequados.',
    options:['Omite III: os elementos filtrantes também participam do manejo da água.','II inventa uma exclusão geral entre recuperação da água e atividades de lazer.','Reúne I e III e exclui a incompatibilidade indevida proposta em II.','Inclui II, falsa, e omite I, verdadeira.','Inclui II: o caráter multifuncional permite integrar lazer e funções ambientais.']
  },
  '2023-27': {
    reason:'As três afirmações são verdadeiras no contexto da coordenação de projetos. Detalhamento compatível melhora quantitativos e orçamento; a integração entre disciplinas reduz erros; e a análise conjunta dos desenhos permite identificar interferências. Isso reduz incertezas e retrabalho, sem garantir ausência absoluta de alterações durante a obra.',
    options:['Omite II e III, que também descrevem funções da compatibilização.','Omite I e III: orçamento e identificação de interferências também fazem parte do processo.','Omite II, que relaciona compatibilidade à prevenção de erros.','Omite I, que reconhece a melhoria da confiabilidade do orçamento.','Inclui os três efeitos reconhecidos no item: orçamento, prevenção de erros e análise das interferências.']
  },
  '2019-13': {
    reason:'I, II e IV são verdadeiras: coordenação acompanha o processo, considera contexto e riscos e integra as soluções às necessidades do empreendimento. III é falsa ao impor que o coordenador seja necessariamente externo e sem autoria de projetos ou responsabilidade pela execução. O arranjo deve definir competências e responsabilidades, sem essa exigência universal.',
    options:['Inclui a obrigação indevida de III e omite II e IV.','II e IV são verdadeiras, mas I também é parte essencial da coordenação.','Inclui III, falsa, e omite I e II.','Inclui III e omite IV, que trata da integração das soluções técnicas.','Inclui I, II e IV e exclui a exigência universal incorreta de III.']
  }
};
function questionFeedback(item, answer) {
  const c=questionComments[`${item.year}-${item.number}`],right=answer===item.key;
  return `<h3>${right?'Resposta correta':'Vamos revisar o raciocínio'}</h3><p><strong>Sua resposta: ${'ABCDE'[answer]} · Gabarito oficial: ${'ABCDE'[item.key]}</strong></p><p>${esc(c.options[answer])}</p><h4>Por que ${'ABCDE'[item.key]} é a correta?</h4><p>${esc(c.reason)}</p><details><summary>Entender todas as alternativas</summary>${c.options.map((text,j)=>`<p><strong>${'ABCDE'[j]} · ${j===item.key?'Correta':'Incorreta'}:</strong> ${esc(text)}</p>`).join('')}</details><p class="tiny">Comentário didático elaborado para esta aula. O gabarito é do INEP.</p>`;
}
