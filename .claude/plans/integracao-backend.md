# Integração do front com o backend

Criado em 27/10/2026 e revisado em 01/11/2026 contra o código do front e a produção. O backend (`psicodaily-api`) está na `main` com todas as rotas abaixo, incluindo taxa por plano, bloqueios e destaques.

A referência completa de rotas, campos e regras é a tabela "Rotas" de `psicodaily-api/.claude/architecture.md`. Os números `#` são os da sprint do backend. A lista de benefícios dos planos está em `.claude/docs/assinaturas.md`.

Esforço: **P** até 1 dia · **M** 2 a 4 dias · **G** uma semana ou mais.

## Como executar

Quando o pedido for "execute", siga este plano sem perguntar, com estas regras:

1. **Escopo:** sem fase indicada, faça todas as tarefas `a fazer`, na ordem das fases. Com "execute fase N", faça só essa fase.
2. **Só o front muda.** Não altere o backend. Se uma rota ou um campo não se comportar como aqui, marque a tarefa como `bloqueado: <motivo>` e siga para a próxima.
3. **Decisões:** quando o plano não definir um detalhe, escolha a opção mais simples, siga o padrão das telas vizinhas e registre no relatório. Pergunte só se a tarefa puder cobrar alguém ou apagar dados de forma diferente do que está aqui.
4. **Status:** ao terminar cada tarefa, troque o status para `feito em DD/MM`. Assim, outra sessão retoma de onde esta parou.
5. **Conferência:** ao fim de cada fase, rode a seção "Como conferir".
6. **Git:** commit e push só se o usuário pedir, seguindo `.claude/CLAUDE.md`. Nunca inclua Claude como autor ou coautor.
7. **Ao terminar:** escreva `.claude/docs/integracao-relatorio.md` com o que foi feito, as decisões tomadas, o que foi bloqueado e o que não deu para testar. No chat, responda com um resumo curto e o caminho desse arquivo.

Dependência nova só se a tarefa disser. Nenhuma tarefa deste plano precisa de uma.

## O que o front já consome

Em 01/11 o front passou a consumir todas as rotas deste plano. Só `/dashboard` segue sem uso, de propósito (ver "Fora deste plano"). O que foi feito e o que falta testar está em `.claude/docs/integracao-relatorio.md`.

Não usar `/pagamentos/financeiro`: é a conta da plataforma, não a do profissional. O certo é `/pagamentos/ganhos`.

## Regras que valem para todas as tarefas

- Dinheiro sempre em **centavos** na API; converter com `utils/dinheiro.js`. A exceção é o `valor` das respostas da Arkhé (`cobranca.valor`), que vem em **reais**.
- Datas e horários no formato `AAAA-MM-DDTHH:MM`, sem fuso (`intervaloConsulta` em `utils/agendamento.js`). Bloqueios usam só `AAAA-MM-DD`.
- Erro da API vem em `{error}`; mostrar com `toast`. Códigos que o front precisa tratar:
  - `409`: conflito de horário, horário fora da agenda ou em bloqueio, profissional sem plano;
  - `402`: cartão ou boleto recusado pela Arkhé, com o motivo dela;
  - `403` com `plano_necessario`: recurso de um plano acima do atual; mostrar link para `/assinaturas`;
  - `502` e `503`: Arkhé fora do ar ou recusando; mostrar a mensagem e deixar tentar de novo.
- O plano do profissional decide o que aparece:
  - **Essencial**: busca, agendamento, carteira e bloqueios;
  - **Profissional** ou acima: `video_url`, lista de espera, visualizações e desempenho;
  - **Premium**: artigos, destaques e selo `patrocinado`.

  A API já esconde ou recusa o que o plano não cobre; o front só não pode quebrar quando o campo vem `null`.
- **A ordem da busca é da API.** Não reordenar a lista no front quando não houver `ordenar`: os Premium vêm no topo, em rodízio diário.
- **Texto do usuário nunca vira HTML.** `corpo` de artigo aparece com `white-space: pre-wrap`, sem `dangerouslySetInnerHTML`.
- **Cartão:** os dados vão direto no `POST` e nunca ficam no navegador (nem `localStorage`, nem estado depois do envio).
- **PDF de boleto:** a rota exige o cookie, então baixar com `fetch` e `credentials: "include"`, transformar em `blob` e abrir com `URL.createObjectURL`.
- Todo host novo do front (domínio, porta local) precisa estar em `ORIGENS_FRONT` no backend, senão os WebSockets recusam a conexão. Se faltar, registre como bloqueio.

## Fase 0: correções do que já está no ar

Já feitas em 27/10: carteira com `/ganhos`, sessão expirada num lugar só, agendamento com horários reais e links mortos da `Sidebar`.

| # | Tarefa | O que fazer | Esf. | Status |
|---|---|---|---|---|
| 9 | **Selo de patrocinado** | Em produção os Premium já aparecem no topo da busca, e nenhuma tela usa o campo `patrocinado`: o paciente não sabe que aquela posição é paga. Mostrar o selo "Patrocinado" nos cartões de `SelecionarProfissional.jsx` e no perfil em `DescricaoPsicologo.jsx` | P | feito em 01/11 |
| 24 | **Aviso errado ao cancelar** | `EditarConsulta.jsx` diz "Esta ação não realiza estorno de pagamento", mas o cancelamento pelo profissional gera reembolso integral do que foi pago. Trocar por: "Se a sessão já foi paga, o valor será devolvido integralmente ao paciente" | P | feito em 01/11 |
| — | Links mortos restantes | `QuestionarioInicial.jsx` aponta para `/dashboard-paciente`, que não existe (2 lugares): trocar por `/app`. `components/Menu/Menu.jsx` não é importado por ninguém e também tem link morto: apagar a pasta | P | feito em 01/11 |
| 9 | Texto da taxa na carteira | Agora cada pagamento tem a taxa gravada, e `taxa_plataforma_percentual` em `/ganhos` é só a do plano **atual**. Em `Carteira.jsx`, trocar "já descontados X% da plataforma" por "já descontadas a taxa da plataforma e a do cartão", e rotular o outro uso como "taxa atual do seu plano: X%". O valor de cada consulta já vem certo em `taxa_plataforma_centavos` | P | feito em 01/11 |

## Fase 1: agenda e dinheiro

Tarefa feita: agenda do profissional com janelas semanais (27/10).

### Assinatura do profissional (#9) · M · feito em 01/11

Hoje `Assinaturas.jsx` é só visual, com preços fixos no código, e **nenhum link leva até ela**.

**Rotas**

| Rota | Resposta |
|---|---|
| `GET /assinaturas/planos` | `{planos: [{plano, nome, nivel, preco_centavos, taxa_plataforma_percentual}]}` |
| `GET /assinaturas/me` | `{assinatura: {plano, ativa, valida_ate, renovar, plano_proximo, periodo_gratis, cobrancas_pendentes}}` |
| `POST /assinaturas/me` com `{plano, metodo, cartao}` | `201` com `{assinatura, cobranca}`; downgrade com plano ativo é `200`, com `cobranca: null` |
| `POST /assinaturas/me/cancelar` | `{assinatura}`; `404` sem plano ativo |
| `GET /assinaturas/me/cobranca/<cobranca_id>/pdf` | PDF do boleto |

**Tela**

1. **Planos:** preço e taxa vêm da API. Os benefícios ficam no código, copiados de `.claude/docs/assinaturas.md`, trocando as promessas vagas atuais. **Não prometer sessões recorrentes nem suporte prioritário**: ainda não existem. Tirar o aviso "versão visual do sistema".
2. **Situação atual:** plano, validade, se está no período grátis, renovação ligada ou desligada e `plano_proximo`. Marcar o cartão do plano atual.
3. **Assinar:** ao escolher o plano, abrir o modal com Pix, boleto ou cartão. Cartão pede `numero_cartao` (16 dígitos), `validade` `MM/AAAA`, `cvv` (3) e `tipo` `CREDITO` ou `DEBITO`. Na assinatura, não mostrar parcelas.
4. **Avisos por caso, antes de confirmar:**
   - **Subir de plano:** "Você paga o valor cheio. O novo plano começa quando o pagamento for confirmado, e os dias restantes do plano atual não são aproveitados."
   - **Descer de plano:** não pede método, porque não há cobrança. "Seu plano atual continua até o vencimento. A próxima renovação já vem no novo valor." Enviar só `{plano}`, porque `metodo` já tem padrão. Se já houver cobrança de renovação pendente, acrescentar: "A cobrança já gerada continua no valor atual; pagá-la renova o plano atual e desfaz a mudança."
   - **Renovar o mesmo plano:** "Os 30 dias contam a partir do fim do ciclo atual."
5. **Cobranças pendentes:** listar `cobrancas_pendentes`, com o plano e o valor. Pix mostra QR Code e "copiar" a partir de `codigo_pagamento`; boleto mostra o botão do PDF, com `cobranca_id`. Botão "Atualizar" chama `GET /assinaturas/me` de novo. Com mais de uma pendente, avisar: "Pague apenas uma. A Arkhé não cancela cobranças, e um pagamento a mais não é devolvido automaticamente."
6. **Cancelar:** com confirmação: "Seu plano continua até DD/MM/AAAA, sem reembolso. Se pagar uma cobrança já gerada, a assinatura volta a renovar."
7. **Texto de cobrança:** trocar "Cobrança mensal" por "Cobrança a cada 30 dias". Explicar que não há débito automático: a renovação chega como Pix por e-mail e WhatsApp, 3 dias antes do vencimento, mesmo para quem pagou com cartão.

**Em outras telas**

- **`Sidebar`:** novo item "Assinatura" em `itensProfissional`, apontando para `/assinaturas`.
- **`DashboardPsicologo`:** aviso quando o plano estiver vencido ("Você não aparece na busca e não recebe agendamentos") ou vencer em até 3 dias, com link para `/assinaturas`. Se `GET /assinaturas/me` falhar, não mostrar erro no painel e seguir sem o aviso, porque essa rota depende da Arkhé.
- **`Preferencias.jsx`:** com plano vencido, `GET /profissionais/<id>` dá 404 e a seção de atendimento mostra erro. Trocar a mensagem por uma que explique isso e aponte para `/assinaturas`.

**Armadilhas**

- A tela de pagamento **não serve** aqui: `/pagamentos/cobranca/<id>` só conhece consultas e dá 404 para assinatura. A confirmação vem por `GET /assinaturas/me`.
- `cobranca_id` é nosso; `id_cobranca` é da Arkhé. O PDF usa `cobranca_id`.
- Para reaproveitar, extrair de `Pagamento.jsx` só o QR Code com o botão de copiar, para um componente usado nas duas telas.

### Outras tarefas

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| 17 | Pix, boleto e cartão na consulta | `POST /pagamentos/cobranca` com `metodo: PIX\|BOLETO\|CARTAO` e `cartao: {numero_cartao, validade, cvv, tipo, parcelas 1–15}` (débito só à vista). Responde `{cobranca}`. No cartão vem `id_compra`, e não `id_cobranca`. `GET /pagamentos/cobranca/<id>` traz `metodo` e `status` (0 pendente, 1 pago) | Escolher o método em `DescricaoPsicologo.jsx` **antes** de gerar a cobrança. **Cartão:** aprovado na hora, vai para `/sessoes` com `toast`; recusa é 402 com o motivo. **Boleto:** vai para `/pagamento/<id>`, que deve mostrar o botão do PDF no lugar do QR Code. Em `Pagamento.jsx`, os textos deixam de dizer sempre "Pix" e passam a usar `cobranca.metodo`. **Depois de gerada a cobrança, não oferecer outro método:** a Arkhé não cancela a anterior, e o paciente poderia pagar duas vezes. Se a criação falhar (402), nenhuma cobrança existe e ele pode escolher outro método | M | feito em 01/11 |
| 24 | Cancelamento pelo paciente | `POST /consultas/<id>/cancelar` até 15 min antes do horário (depois disso, 409); devolve `sessao` e `reembolso_centavos` | Botão "Cancelar" em `Sessoes.jsx`, na próxima sessão e na lista, para quem está `AGENDADO` ou `CONFIRMADO` e falta mais de 15 min. A API só informa o valor depois de cancelar, então a confirmação diz "O que você pagou será devolvido integralmente pela equipe", e o `toast` final mostra `reembolso_centavos` quando for maior que zero. Atualizar a lista com `atualizarConsulta(sessao)` | P | feito em 01/11 |
| 9 | Bloqueio de férias e folgas | `GET /profissionais/me/bloqueios` → `{bloqueios: [{bloqueio_id, inicio, fim}]}`. `POST` com exatamente `{inicio, fim}` em `AAAA-MM-DD`, dias inteiros e inclusivos → 201 com `{bloqueio, sessoes_no_periodo}`. `DELETE /profissionais/me/bloqueios/<id>`. 400 para `fim` antes de `inicio` ou no passado e para mais de 365 dias; 409 se sobrepõe outro. Vale em todos os planos | Componente `BloqueiosAgenda` em `components/`, no modelo de `HorariosAtendimento`, num novo `cardLateral` de `AgendaProfissional.jsx`: lista, duas datas e botão de apagar com confirmação. Bloquear **não cancela** sessões: se `sessoes_no_periodo` for maior que zero, avisar "N sessões seguem marcadas nesse período; cancele as que não for atender" | P | feito em 01/11 |

## Fase 2: paciente

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| 5 | Questionário inicial | `GET/PUT /usuarios/me/preferencias`. Campos: `motivos` (até 3, de `AREAS_ATUACAO`), `abordagem`, `modalidade`, `idioma` e `preco_max` em centavos, todos opcionais. O `GET` devolve as `opcoes` válidas, e o `PUT` recusa campo desconhecido | `QuestionarioInicial.jsx` só grava no `localStorage`, as perguntas não batem com a API e **nenhum link leva até ele**. Montar as opções a partir de `opcoes`, mandar só os campos aceitos e tirar o `localStorage`. "Não tenho preferência" e similares significam omitir o campo. O link de entrada vem na tarefa seguinte | M | feito em 01/11 |
| 2 | Recomendados | `GET /profissionais/recomendados` (até 10; `questionario_respondido`) | Seção "Recomendados para você" no `DashboardPaciente`; sem questionário respondido, convite com link para `/questionarioinicial` | P | feito em 01/11 |
| 7 | Favoritos | `GET /favoritos` (com `proximo_horario`), `POST` e `DELETE /favoritos/<id_profissional>` | O coração da busca é só estado local, e o do perfil não faz nada. Gravar na API, carregar o estado inicial de `GET /favoritos` e listar os favoritos no painel do paciente | P | feito em 01/11 |
| 6 | Lista de espera | `POST /lista-espera` com `{id_profissional, inicio, fim}` (janela de até 31 dias), `GET` e `DELETE /lista-espera/<id>`. 409 se o profissional não tem plano Profissional ou acima | Botão "Avisar se abrir horário" no perfil, quando não houver horário livre, e a lista com o `avisado_em` no painel do paciente. A vaga não fica reservada: o aviso só diz que abriu | P | feito em 01/11 |
| 28 | Evolução do humor | `GET /registros/evolucao?dias=7\|30\|90` (`resumo` + `evolucaoHumor`, no mesmo formato do prontuário) | Usar no `DashboardPaciente` com o `GraficoHumor` que já existe, em vez de calcular a partir de `/registros/?limite=100` | P | feito em 01/11 |
| 3, 15 | Perfil completo e filtros avançados | Busca e detalhe trazem `formacao`, `anos_experiencia`, `idiomas`, `areas_atuacao` e `video_url` (link de embed, `null` abaixo do plano Profissional). Filtros novos: `idioma`, `area_atuacao`, `experiencia_min` e `ordenar=preco\|avaliacao\|experiencia` | Mostrar os campos em `DescricaoPsicologo.jsx`, com o vídeo num `iframe`. Acrescentar os filtros em `parametrosProfissionais` (`utils/profissionais.js`) e na tela de busca. As listas válidas estão em `IDIOMAS` e `AREAS_ATUACAO` no `funcao.py` do backend: copiar para `utils/profissionais.js`, como já foi feito com `abordagens` | M | feito em 01/11 |
| 16/21/22 | Assistente de IA | `POST /assistente` com `{"mensagens": [{role, content}]}` (1 a 40 mensagens, começa e termina com `user`), que devolve `{resposta, agendamento}`. A API nunca grava nada: `agendamento` é uma proposta, já no formato do `POST /consultas` | Chat flutuante só para paciente; quando vier `agendamento`, pedir confirmação e só então chamar `POST /consultas/` | M | feito em 01/11 |

## Fase 3: profissional

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| 3 | Editar o perfil completo | `POST /profissionais/` e `PATCH /profissionais/me` aceitam `formacao`, `ano_inicio_atuacao`, `idiomas`, `areas_atuacao` (até 8) e `video_url` (YouTube ou Vimeo); `null` ou vazio limpa o campo | Campos novos em `Preferencias.jsx`. Usar as listas criadas na tarefa de filtros. Não mexer em `CadastroPsicologo.jsx` | P | feito em 01/11 |
| 8 | Artigos | `GET /profissionais/<id>/conteudos` (público; lista vazia abaixo do Premium); `POST`, `PATCH` e `DELETE /conteudos/<id>` só do dono e do plano Premium. `titulo` de 3 a 200, `corpo` até 20000, sem tag HTML | Lista de artigos no perfil e editor simples em `Preferencias.jsx`; no 403, chamada para `/assinaturas`. Mostrar o `corpo` como texto. Sem biblioteca de Markdown | M | feito em 01/11 |
| 9 | Artigos em destaque | `GET /conteudos/destaques?limite=` (público; de 1 a 12, senão 400): `{conteudos: [{conteudo_id, profissional_id, titulo, corpo, publicado_em, atualizado_em, profissional_nome, profissional_foto_url}]}` | Seção na `Home.jsx`, com `limite=6`: cartões com título, autor, foto e um trecho do `corpo`. Abrir o artigo inteiro num diálogo, sem navegar, porque o perfil só abre para paciente logado. **Esconder a seção se a lista vier vazia ou der erro:** hoje produção devolve lista vazia | P | feito em 01/11 |
| 9 | Desempenho | `GET /profissionais/me/desempenho?dias=7\|30\|90`: `visualizacoes`, `visualizacoes_por_dia`, `consultas` por status, `agendamentos_feitos` e `novos_favoritos`; no Premium, também `conversao` e `periodo_anterior`. Abaixo do plano Profissional, 403 com `plano_necessario` | Gráficos no `DashboardPsicologo`; no 403, chamada para `/assinaturas` | P | feito em 01/11 |
| — | Encaminhamentos | `GET /encaminhamentos` e `POST /encaminhamentos` (só para paciente com quem o profissional teve sessão) | Ação no `Prontuario.jsx` | P | feito em 01/11 |

## Fase 4: comunicação

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| F3 | Notificações | `GET /notificacoes?limite=&antes=` (`tipo`, `titulo`, `mensagem`, `dados`, `lida`, `nao_lidas`, `proximo_cursor`) e `POST /notificacoes/lidas` (`{"ids": [...]}`, ou sem corpo para marcar todas) | Sino com contador em `Header.jsx`, lista e "marcar como lidas". Usar `dados` para abrir a tela certa (ex.: `VAGA_LISTA_ESPERA` → perfil do profissional) | M | feito em 01/11 |
| 18/19 | Chat com anexos | `GET /chat` (conversas), `GET /chat/<outro_id>?antes=\|depois=`, `POST /chat/<outro_id>` (`{texto}`), `POST /chat/<outro_id>/arquivo` (multipart com PDF, JPG ou PNG até 10 MB), `GET /chat/arquivo/<mensagem_id>` (URL que vale 5 min). `/ws/chat` só **recebe** as mensagens novas; o envio é pelo REST | Página nova `/mensagens` e item na `Sidebar`. Ao reconectar o WebSocket, buscar o que perdeu com `depois`. Pedir a URL do anexo só no clique, porque ela expira | G | feito em 01/11 |
| 14 | Presença na videochamada | O `/ws/signaling` emite `peers`, `peer-joined` e `peer-left` | `utils/videoCall.js` já trata `joined` e `peer-left`. Falta tratar `peers` e `peer-joined`, para mostrar em `Videochamada.jsx` quando o outro participante entrou | P | feito em 01/11 |

## Fase 5: admin

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| 25 | Painel de métricas | `GET /admin/metricas?dias=7\|30\|90\|365`: `faturamento_centavos`, `consultas_por_status`, `usuarios_ativos`, `novos_cadastros`, `avaliacao` e `assinaturas` (`ativas_por_plano`, `receita_centavos`) | `DashboardAdm.jsx` hoje só lista usuários. Acrescentar cartões e gráficos (`recharts`, já instalado). `faturamento_centavos` é o total pago nas consultas, não a receita do app: rotular como "Total pago em consultas" | M | feito em 01/11 |
| 20 | Auditoria | `GET /admin/auditoria?usuario_id=&acao=&limite=&antes=` | Tabela com filtros e "carregar mais" pelo `proximo_cursor` | P | feito em 01/11 |
| 24/32 | Reembolsos e repasses | `GET /admin/reembolsos?status=`, `POST /admin/reembolsos/<id>/pagar` (`{}` paga por Pix da Arkhé, `{"manual": true}` só marca como pago), `GET /admin/repasses?status=`, `POST /admin/repasses` (fecha os repasses; 409 se não há nada), `POST /admin/repasses/<id>/pagar` | Duas listas com o botão de pagar e confirmação. Quando vier 502 (a Arkhé recusou), mostrar o motivo e oferecer "Já paguei por fora", que envia `{"manual": true}`. Não criar botão de estorno: ver "Fora deste plano" | M | feito em 01/11 |

## Fora deste plano

Não executar:

- **Estorno pelo admin e tratamento de pagamento duplicado:** decididos em 01/11, mas ainda sem rota no backend. A tela vem depois dela.
- **Sessões recorrentes e suporte prioritário:** não existem no backend.
- **`CadastroAdmin`:** não existe rota que crie admin. A decisão de manter ou tirar a tela é do time.
- **`GET /api/dashboard`:** junta num só pedido o que os painéis buscam separado. Só vale a troca se os painéis ficarem lentos.
- **Transcrição das consultas (#11):** depende de decisão ética e legal; não há rota.

## Como conferir

Não há testes no front. Ao fim de cada fase:

1. `npm run build` sem erro.
2. Teste manual contra a API local, com os usuários fictícios do `seed.sql` (senha `Senha@123`): 22 psicólogo, 23 e 25 pacientes, 24 psiquiatra, 26 admin.
   - **Backend no Windows:** `.venv\Scripts\python database/migrar.py` e depois `.venv\Scripts\python app.py`, na porta 5000. O proxy do Vite aponta por padrão para a `:8000`, então crie um `.env` no front com `VITE_API_PROXY_TARGET=http://127.0.0.1:5000`.
   - **Planos:** 22 e 24 são Premium até 2099. Para testar outro plano ou um plano vencido, mude `PLANO` e `VALIDA_ATE` em `ASSINATURA` **só no banco local**.
   - **Pagamentos:** com credenciais no `.env` do backend, as cobranças vão para a Arkhé de verdade. Criar um Pix pendente é suficiente para ver a tela. Não testar cartão com dados reais. Registrar no relatório o que depender de um pagamento confirmado, como teste manual pendente.
3. Conferir o tema claro e o escuro.
