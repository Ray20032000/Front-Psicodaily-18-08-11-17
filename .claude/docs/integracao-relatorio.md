# Relatório da integração com o backend

Feito em 01/11/2026. As tarefas das Fases 0 a 5 de `.claude/plans/integracao-backend.md` estão prontas. Nada foi commitado.

## Decidir antes de publicar

1. **O assistente envia as mensagens dos pacientes ao plano gratuito do Gemini.** O `architecture.md` do backend diz que o Google pode usar essas mensagens para treinar modelos e que isso "não é adequado a dados reais de pacientes". Coloquei um aviso no chat, mas ele não resolve o problema legal (LGPD, dado de saúde). Para publicar sem esse risco, troque por um plano pago ou tire o `<Assistente />` de `AppLayout.jsx`.
2. **Consulta sem pagamento fica sem saída.** Quem sai da tela depois de agendar não consegue mais pagar, porque `Sessoes.jsx` não tem botão de pagar e `GET /consultas/` não informa se a sessão foi paga. Isso já existia, mas agora é mais fácil de acontecer, com recusas de cartão. O conserto precisa do backend: um campo com a situação do pagamento em cada consulta.
3. **Validação com jurídico ou CRP/CRM do topo pago da busca.** Segue pendente (`.claude/docs/assinaturas.md`).

## O que falta testar

Quase tudo aqui exige credenciais reais:

| O quê | Situação |
|---|---|
| Pix e boleto de verdade: QR Code, PDF e confirmação do pagamento | Testei até a chamada e o erro com a Arkhé desligada. A tela de cobrança pendente não foi vista com dados reais |
| Cartão aprovado e recusado (402) | Só o formato inválido (400) e a Arkhé fora (503) |
| Pagar reembolso e repasse, com a recusa 502 e "Já paguei por fora" | Só as listas e os erros 404 e 409. Os botões de pagar não foram clicados |
| Anexo no chat | Precisa do R2. Só o 404 de anexo inexistente |
| Resposta do assistente e os botões de confirmar | Precisa da chave do Gemini. Só os erros |
| Artigos em destaque na `Home` e plano vencido em `Preferencias` e no painel | As rotas foram conferidas, mas essas telas não foram abertas nesses casos |
| Cliques em favoritar, responder o questionário até o fim, criar bloqueio, publicar artigo, encaminhar e filtrar a auditoria | Não exige credenciais. As telas abriram sem erro e as rotas foram conferidas por script, mas esses botões não foram clicados: vale um teste manual |

## Como foi conferido

- `npm run build` sem erro ao fim de cada fase.
- Scripts contra a API local cobrindo as rotas de todas as fases, inclusive os WebSockets do chat e da videochamada. Todos passaram.
- Edge sem interface (`playwright-core` fora do projeto), com os três perfis e nos dois temas: sem erro de JavaScript. Em 390 px de largura, nada estourou a tela nas 10 rotas testadas.
- Fluxos feitos no navegador: agendar com a cobrança falhando, abrir o cancelamento e receber mensagem do chat em tempo real em outra sessão.
- A API rodou num banco descartável, sem Arkhé, SMTP, WhatsApp e Gemini, então nada foi cobrado nem enviado. No seu banco local, `migrar.py` não mudou nada e houve uma tentativa de login com um usuário que não existe nele.

## O que foi feito

| Fase | Entregue |
|---|---|
| 0 | Selo de patrocinado, aviso de reembolso do profissional, links mortos, texto da taxa na carteira e remoção de `components/Menu` |
| 1 | Tela de assinaturas ligada à API, Pix, boleto e cartão na consulta, cancelamento pelo paciente e bloqueio de férias |
| 2 | Questionário na API, recomendados, favoritos, lista de espera, evolução do humor, perfil completo, filtros novos e assistente |
| 3 | Perfil completo em `Preferencias`, artigos, destaques na `Home`, desempenho e encaminhamentos no prontuário |
| 4 | Sino de notificações, página `/mensagens` com anexos e presença na videochamada |
| 5 | Abas no painel do admin: métricas, auditoria, reembolsos e repasses |

Novos reaproveitáveis: `CodigoPix`, `MetodoPagamento`, `useAssinatura`, `useFavoritos` e `utils/pdf.js`. Nenhuma dependência nova.

## Decisões que o plano não definia

- **Dados do cartão sem estado no React:** os campos ficam só no formulário e são limpos depois de cada envio, inclusive em recusa. O paciente redigita depois de um erro.
- **Pagar depois do assistente:** ao confirmar, a consulta é agendada e o paciente vai para o perfil do profissional só para escolher como pagar. Sem isso, a sessão ficaria sem pagamento.
- **Cancelamento pelo assistente:** a API também devolve `cancelamento`, que o plano não citava. Fiz a confirmação igual à do agendamento, porque o assistente ofereceria algo que o paciente não conseguiria concluir.
- **Histórico do assistente:** o que vai à API é cortado em 40 mensagens e 2000 caracteres cada, porque uma resposta longa dele faria a mensagem seguinte dar 400.
- **Aviso extra de cobrança dupla:** o modal de assinatura avisa quando já existe cobrança pendente, não só na lista.
- **Assistente escondido em `/mensagens` e `/videochamada`:** o botão cobriria o envio e os controles. A conversa continua em memória.
- **Lista de espera:** janela fixa de 30 dias a partir de agora.
- **Notificações:** consulta a cada 60 s com a aba visível, porque não há canal em tempo real.
- **Evolução do humor:** o título de humor médio agora cobre os últimos 7 dias, e o gráfico de barras antigo saiu.
- **Fora do pedido, mas pequeno:** o botão "Escolher data e horário" do perfil estava quase invisível, e `Assinaturas.module.css` tinha cores soltas. Corrigi os dois.

## Diferenças em relação ao plano

- A tarefa de presença dizia que `utils/videoCall.js` já tratava os eventos, mas ninguém importa esse arquivo. Fiz em `Videochamada.jsx`.
- A sala da videochamada só abre 15 minutos antes da sessão. Fora disso a conexão fecha, sem mensagem de erro específica.

## Problemas encontrados e não corrigidos

Fora do plano:

- `utils/videoCall.js` é código morto.
- A tabela de usuários do admin tem "Editar", que leva a `/editar-usuario/:id` (rota inexistente), e "Desativar", que não faz nada.
- `ProtectedRoute` manda para `/nao-autorizado`, que cai no 404.
- `.claude/docs/assinaturas.md` do backend ainda marca os benefícios com os estados antigos. A cópia atualizada é a do front.
