# Integração do front com o backend novo

Criado em 27/10/2026. Entre 19 e 27/10 o backend (`psicodaily-api`) ganhou mais de 20 features que o front ainda não usa. A referência de rotas, campos e regras é a tabela "Rotas" de `psicodaily-api/.claude/architecture.md`; os números `#` são os da sprint do backend (`psicodaily-api/.claude/plans/ultima-sprint.md`).

Esforço: **P** até 1 dia · **M** 2 a 4 dias · **G** uma semana ou mais.

## O que o front já consome

`/auth/*`, `/usuarios/` e `/usuarios/me`, `/consultas/` (listar, agendar, `PATCH`, avaliação, `ice-servers`), `/pagamentos/cobranca` (só Pix), `/pagamentos/financeiro`, `/profissionais/` (busca com `abordagem`, `modalidade`, `avaliacao_min`, disponibilidade; detalhe; cadastro; `PATCH /me` de preço e descrição), `/prontuario/<id>`, `/registros/` e `/ws/signaling` com TURN (#23, feito em 26/10).

Nenhuma tela usa: `/favoritos`, `/lista-espera`, `/notificacoes`, `/chat` e `/ws/chat`, `/assinaturas`, `/assistente`, `/admin`, `/conteudos`, `/encaminhamentos`, `/dashboard`, `/registros/evolucao`, `/usuarios/me/preferencias`, `/profissionais/recomendados`, `/profissionais/<id>/horarios`, `/profissionais/me/disponibilidade` e `/profissionais/me/desempenho`.

## Regras que valem para todas as tarefas

- Dinheiro sempre em **centavos** na API; converter com `utils/dinheiro.js`.
- Datas e horários no formato `AAAA-MM-DDTHH:MM`, sem fuso (`intervaloConsulta` em `utils/agendamento.js`).
- Erro da API vem em `{error}`; mostrar com `toast`. Códigos que o front precisa tratar:
  - `409`: conflito de horário, horário fora da agenda, profissional sem plano;
  - `402`: cartão recusado pela Arkhé, com o motivo dela;
  - `403` com `plano_necessario`: recurso de um plano acima do atual.
- O plano do profissional decide o que aparece:
  - **Profissional** ou acima: `video_url`, lista de espera, visualizações e desempenho;
  - **Premium**: conteúdos e selo `patrocinado`.

  A API já esconde ou recusa o que o plano não cobre; o front só não pode quebrar quando o campo vem `null`.
- Todo host novo do front (domínio, porta local) precisa estar em `ORIGENS_FRONT` no backend, senão os WebSockets recusam a conexão.

## Fase 0: o que está errado hoje

| # | Tarefa | O que fazer | Esf. | Status |
|---|---|---|---|---|
| 32 | **Carteira mostra o saldo da plataforma** | `hooks/useFinanceiro.js` chama `/pagamentos/financeiro`, que é o saldo da conta PJ da plataforma na Arkhé, não o do profissional: todo psicólogo vê o caixa da empresa. Trocar por `GET /pagamentos/ganhos?dias=7\|30\|90\|365`, que devolve por consulta o valor, os 10% da plataforma, a taxa do cartão e o líquido, além de `resumo`, `saldo` a receber e `repasses`. Refazer `Carteira.jsx` e os cartões de `DashboardPsicologo.jsx` com esses campos | M | feito em 27/10 |
| — | Sessão expirada | O JWT expira em 8h. Hoje só `UsuarioContext` trata o 401 (em `/usuarios/me`); as outras telas mostram erro genérico. Tratar 401 num lugar só: sair e mandar para `/login` | P | feito em 27/10 |
| — | Agendamento com horário inventado | `DescricaoPsicologo.jsx` lê `profissional.horarios` e `horariosDisponiveis`, que a API não manda, e deixa o paciente escolher qualquer data. Usar `GET /profissionais/<id>/horarios?de=&ate=&duracao=` (horários livres em fatias, até 31 dias) em `VerHorarios`. O `POST /consultas/` já recusa com 409 o que estiver fora da agenda | M | feito em 27/10 |
| — | Links e telas mortas | `Sidebar` aponta para `/suporte` (sem rota, cai no 404); o questionário navega para `/buscar-profissionais` (não existe, o certo é `/profissionais`); `Marketplace.jsx` é importado no `App.jsx`, mas nenhuma rota o usa. Corrigir os links e apagar o `Marketplace` | P | feito em 27/10 |

## Fase 1: agenda e dinheiro (o agendamento depende disso)

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| — | Agenda do profissional | `GET /profissionais/<id>/disponibilidade` e `PUT /profissionais/me/disponibilidade` com `{"janelas": [{dia_semana, inicio, fim}]}` (0 = domingo; substitui todas; sem sobreposição no mesmo dia) | Editor de janelas semanais em `AgendaProfissional.jsx`. Hoje a tela só mostra as consultas. Sem janelas cadastradas o profissional aceita qualquer horário; depois de cadastrar, só as janelas | M | feito em 27/10 |
| 9 | Assinatura do profissional | `GET /assinaturas/planos` (público), `GET /assinaturas/me`, `POST /assinaturas/me` com `{plano, metodo, cartao}` (201 com a `cobranca`; downgrade vira `plano_proximo`), `POST /assinaturas/me/cancelar`, `GET /assinaturas/me/cobranca/<id>/pdf` | `Assinaturas.jsx` é estática e tem os preços fixos no código: buscar os planos da API, mostrar o plano atual, a validade e a renovação, e pagar como na consulta. Avisar no `DashboardPsicologo` quando o plano estiver vencido: sem plano válido o profissional some da busca e não recebe agendamento | M | a fazer |
| 17 | Pix, boleto e cartão | `POST /pagamentos/cobranca` com `metodo: PIX\|BOLETO\|CARTAO` e `cartao: {numero_cartao (16 dígitos), validade "MM/AAAA", cvv (3), tipo CREDITO\|DEBITO, parcelas 1–15}` (débito só à vista); `GET /cobranca/<id>/pdf` para o boleto | Escolha do método em `DescricaoPsicologo.jsx` e `Pagamento.jsx`; formulário do cartão (o resultado sai na hora, sem tela de espera); botão do PDF no boleto. Nunca guardar dados do cartão no navegador | M | a fazer |
| 24 | Cancelamento pelo paciente | `POST /consultas/<id>/cancelar` até 15 min antes do horário (depois disso, 409); devolve `sessao` e `reembolso_centavos` | Botão "Cancelar" em `Sessoes.jsx` com confirmação; mostrar o valor que será devolvido. O profissional já cancela pelo `EditarConsulta` | P | a fazer |

## Fase 2: paciente

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| 5 | Questionário inicial | `GET/PUT /usuarios/me/preferencias`. Campos: `motivos` (até 3, de `AREAS_ATUACAO`), `abordagem`, `modalidade`, `idioma` e `preco_max` em centavos, todos opcionais. O `GET` devolve as `opcoes` válidas, e o `PUT` recusa campo desconhecido | `QuestionarioInicial.jsx` só grava no `localStorage`, e as perguntas não batem com a API: os motivos são outros, não pergunta idioma, e "horários" e "o que é mais importante" a API não guarda. Montar as opções a partir de `opcoes` e mandar só os campos aceitos | M | a fazer |
| 2 | Recomendados | `GET /profissionais/recomendados` (até 10; `questionario_respondido`) | Seção "Recomendados para você" no `DashboardPaciente`; sem questionário respondido, convite para responder | P | a fazer |
| 7 | Favoritos | `GET /favoritos` (com `proximo_horario`), `POST` e `DELETE /favoritos/<id_profissional>` | Hoje o coração da busca e do perfil é só estado local. Gravar na API e listar os favoritos no painel do paciente | P | a fazer |
| 6 | Lista de espera | `POST /lista-espera` com `{id_profissional, inicio, fim}` (janela de até 31 dias), `GET` e `DELETE /lista-espera/<id>`. 409 se o profissional não tem plano Profissional ou acima | Botão "Avisar se abrir horário" no perfil, quando não houver horário livre, e a lista com o `avisado_em` no painel do paciente. A vaga não fica reservada: o aviso só diz que abriu | P | a fazer |
| 28 | Evolução do humor | `GET /registros/evolucao?dias=7\|30\|90` (`resumo` + `evolucaoHumor`, no mesmo formato do prontuário) | Usar no `DashboardPaciente`/`DiarioDeHumor` com o `GraficoHumor` que já existe, em vez de calcular a partir de `/registros/?limite=100` | P | a fazer |
| 3, 15 | Perfil completo e filtros avançados | Busca e detalhe trazem `formacao`, `anos_experiencia`, `idiomas`, `areas_atuacao`, `video_url` (link de embed, `null` abaixo do plano Profissional) e `patrocinado`. Filtros novos: `idioma`, `area_atuacao`, `experiencia_min` e `ordenar=preco\|avaliacao\|experiencia` | Mostrar os campos em `DescricaoPsicologo.jsx`, com o vídeo num `iframe` e o selo de patrocinado. Acrescentar os filtros em `parametrosProfissionais` (`utils/profissionais.js`) e na tela de busca | M | a fazer |
| 16/21/22 | Assistente de IA | `POST /assistente` com `{"mensagens": [{role, content}]}` (1 a 40 mensagens, começa e termina com `user`), que devolve `{resposta, agendamento}`. A API nunca grava nada: `agendamento` é uma proposta, já no formato do `POST /consultas` | Chat flutuante só para paciente; quando vier `agendamento`, pedir confirmação e só então chamar `POST /consultas/` | M | a fazer |

## Fase 3: profissional

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| 3 | Editar o perfil completo | `POST /profissionais/` e `PATCH /profissionais/me` aceitam `formacao`, `ano_inicio_atuacao`, `idiomas`, `areas_atuacao` (até 8) e `video_url` (YouTube ou Vimeo); `null` ou vazio limpa o campo | Campos novos em `Preferencias.jsx` e, opcionalmente, em `CadastroPsicologo.jsx`. As listas válidas estão em `IDIOMAS` e `AREAS_ATUACAO` no `funcao.py` do backend: copiar para `utils/profissionais.js`, como já foi feito com `abordagens` | P | a fazer |
| 8 | Conteúdos e artigos | `GET /profissionais/<id>/conteudos` (público); `POST`, `PATCH` e `DELETE /conteudos/<id>` só do dono e do plano Premium. `corpo` é texto ou Markdown sem HTML | Lista de artigos no perfil e editor simples para o profissional. Mostrar o `corpo` como texto (`white-space: pre-wrap`); Markdown só se o time quiser uma dependência | M | a fazer |
| 9 | Desempenho | `GET /profissionais/me/desempenho?dias=7\|30\|90`: `visualizacoes`, `visualizacoes_por_dia`, `consultas` por status, `agendamentos_feitos` e `novos_favoritos`; no Premium, também `conversao` e `periodo_anterior`. Abaixo do plano Profissional, 403 com `plano_necessario` | Gráficos no `DashboardPsicologo`; no 403, chamada para `/assinaturas` | P | a fazer |
| — | Encaminhamentos | `GET /encaminhamentos` e `POST /encaminhamentos` (só para paciente com quem o profissional teve sessão) | Ação no `Prontuario.jsx` | P | a fazer |

## Fase 4: comunicação

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| F3 | Notificações | `GET /notificacoes?limite=&antes=` (`tipo`, `titulo`, `mensagem`, `dados`, `lida`, `nao_lidas`, `proximo_cursor`) e `POST /notificacoes/lidas` (`{"ids": [...]}`, ou sem corpo para marcar todas) | Sino com contador no header do `AppLayout`, lista e "marcar como lidas". Usar `dados` para abrir a tela certa (ex.: `VAGA_LISTA_ESPERA` → perfil do profissional) | M | a fazer |
| 18/19 | Chat com anexos | `GET /chat` (conversas), `GET /chat/<outro_id>?antes=\|depois=`, `POST /chat/<outro_id>` (`{texto}`), `POST /chat/<outro_id>/arquivo` (multipart com PDF, JPG ou PNG até 10 MB), `GET /chat/arquivo/<mensagem_id>` (URL que vale 5 min). `/ws/chat` só **recebe** as mensagens novas; o envio é pelo REST | Página nova `/mensagens` e item na `Sidebar`. Ao reconectar o WebSocket, buscar o que perdeu com `depois`. Pedir a URL do anexo só no clique, porque ela expira | G | a fazer |
| 14 | Presença na videochamada | O `/ws/signaling` emite `peers`, `peer-joined` e `peer-left` | Mostrar em `Videochamada.jsx` "aguardando o outro participante" e "saiu da sala" | P | a fazer |

## Fase 5: admin

| # | Tarefa | Backend | Front | Esf. | Status |
|---|---|---|---|---|---|
| 25 | Painel de métricas | `GET /admin/metricas?dias=7\|30\|90\|365`: faturamento, consultas por status, usuários ativos, novos cadastros, avaliação e assinaturas | `DashboardAdm.jsx` hoje só lista usuários. Acrescentar cartões e gráficos (`recharts`, já instalado) | M | a fazer |
| 20 | Auditoria | `GET /admin/auditoria?usuario_id=&acao=&limite=&antes=` | Tabela com filtros e "carregar mais" pelo `proximo_cursor` | P | a fazer |
| 24/32 | Reembolsos e repasses | `GET /admin/reembolsos?status=`, `POST /admin/reembolsos/<id>/pagar` (`{}` paga por Pix da Arkhé, `{"manual": true}` só marca como pago), `GET /admin/repasses?status=`, `POST /admin/repasses` (fecha os repasses), `POST /admin/repasses/<id>/pagar` | Duas listas com o botão de pagar e confirmação; mostrar o motivo quando vier 502 (a Arkhé recusou) | M | a fazer |
| — | `CadastroAdmin` | Não existe rota que crie admin: a promoção é um `UPDATE` direto no banco | Decidir com o time se a tela sai ou fica só como visual | P | decidir |

## Fora deste plano

- `GET /api/dashboard` junta num só pedido o que os painéis buscam separado. Foi pensado para o app mobile (#1); no web só vale a troca se os painéis ficarem lentos.
- Transcrição das consultas (#11): depende de decisão ética e legal; não há rota.

## Ordem sugerida

Fase 0 primeiro, porque a Carteira expõe o saldo da plataforma e o agendamento aceita horário inventado. Depois a Fase 1 inteira: com a agenda e a assinatura valendo no backend, profissional sem janela ou sem plano já trava o fluxo. Fases 2 a 5 podem correr em paralelo entre o time.

## Como conferir

Não há testes no front. Para cada tarefa:
1. `npm run build` sem erro;
2. teste manual contra a API local (`python app.py` em `:5000`, que o proxy do Vite já usa), com os usuários fictícios do `seed.sql`: 22 psicólogo, 23 e 25 pacientes, 24 psiquiatra, 26 admin;
3. conferir o tema claro e o escuro.
