DESENVOLVEDORES

API Arkhé
Integre seu sistema à infraestrutura financeira do Arkhé.
BASE URL
https://arkhe-backend.zbbquj.easypanel.host
Introdução
Autenticação
Endpoints
Erros da API
Boas práticas
VISÃO GERAL

Integração para contas empresariais
A API Arkhé permite que sistemas autorizados por uma conta PJ consultem informações financeiras e criem cobranças Pix internas.

Antes de começar
Crie uma integração na conta PJ e salve o Client ID e o Client Secret exibidos.
AUTENTICAÇÃO

Credenciais em todas as requisições
Todas as rotas externas da API exigem o Client ID e o Client Secret da integração nos headers abaixo.

JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}
Nunca exponha o Client Secret no frontend público. Faça as chamadas à API pelo servidor do sistema integrado.

REFERÊNCIA

Endpoints disponíveis
Conta
Saldo
Movimentações
Resumo financeiro
Criar cobrança Pix
Consultar cobrança Pix
GET
/api/v1/conta
Retorna os dados da conta PJ vinculada à integração.

Exemplo JavaScript
JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}

const response = await fetch('https://arkhe-backend.zbbquj.easypanel.host/api/v1/conta', {
  method: 'GET',
  headers
})

const data = await response.json()
console.log(data)
Exemplo de resposta
JSON
Copiar
{
  "id_conta": 9,
  "numero_conta": "00012345",
  "agencia": "0001",
  "banco": "Arkhé",
  "tipo_conta": 1,
  "nome": "Empresa Exemplo"
}
GET
/api/v1/saldo
Retorna o saldo atual da conta vinculada à integração.

Exemplo JavaScript
JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}

const response = await fetch('https://arkhe-backend.zbbquj.easypanel.host/api/v1/saldo', {
  method: 'GET',
  headers
})

const data = await response.json()
console.log(data.saldo)
Exemplo de resposta
JSON
Copiar
{
  "saldo": 5250.75
}
GET
/api/v1/movimentacoes
Retorna as movimentações da conta.

Sem datas, a API consulta automaticamente do primeiro dia do mês atual até hoje.

Parâmetros opcionais
data_inicio
Data inicial no formato YYYY-MM-DD.
data_fim
Data final no formato YYYY-MM-DD.
Exemplo sem período
JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}

const response = await fetch('https://arkhe-backend.zbbquj.easypanel.host/api/v1/movimentacoes', {
  method: 'GET',
  headers
})

const data = await response.json()
console.log(data.movimentacoes)
Exemplo com período
JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}

const parametros = new URLSearchParams({
  data_inicio: '2026-09-01',
  data_fim: '2026-09-15'
})

const response = await fetch(
  'https://arkhe-backend.zbbquj.easypanel.host/api/v1/movimentacoes?' + parametros,
  { method: 'GET', headers }
)

const data = await response.json()
console.log(data.movimentacoes)
Exemplo de resposta
JSON
Copiar
{
  "data_inicio": "2026-09-01",
  "data_fim": "2026-09-15",
  "movimentacoes": [
    {
      "id_movimentacao": 53,
      "id_pagador": 12,
      "nome_pagador": "João da Silva",
      "id_recebedor": 9,
      "nome_recebedor": "Empresa Exemplo",
      "nome_contraparte": "João da Silva",
      "valor": 350.00,
      "data_movimentacao": "2026-09-15 09:43:10",
      "id_cobranca": null,
      "tipo_cobranca": null,
      "tipo": "entrada",
      "origem": "pix"
    }
  ]
}
Campos da movimentação
tipo
entrada ou saida.
origem
pix, pix_qrcode ou boleto.
nome_pagador
Nome da conta que realizou o pagamento.
nome_recebedor
Nome da conta que recebeu o pagamento.
nome_contraparte
Nome da outra parte da movimentação, facilitando o uso no frontend integrador.
GET
/api/v1/resumo-financeiro
Retorna receitas, despesas e saldo do período.

Sem datas, a API considera automaticamente do primeiro dia do mês atual até hoje.

Parâmetros opcionais
data_inicio
Data inicial no formato YYYY-MM-DD.
data_fim
Data final no formato YYYY-MM-DD.
Exemplo sem período
JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}

const response = await fetch('https://arkhe-backend.zbbquj.easypanel.host/api/v1/resumo-financeiro', {
  method: 'GET',
  headers
})

const data = await response.json()
console.log('Receitas:', data.total_receitas)
console.log('Despesas:', data.total_despesas)
console.log('Saldo do período:', data.saldo_periodo)
Exemplo com período
JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}

const parametros = new URLSearchParams({
  data_inicio: '2026-09-01',
  data_fim: '2026-09-15'
})

const response = await fetch(
  'https://arkhe-backend.zbbquj.easypanel.host/api/v1/resumo-financeiro?' + parametros,
  { method: 'GET', headers }
)

const data = await response.json()
console.log(data)
Exemplo de resposta
JSON
Copiar
{
  "data_inicio": "2026-09-01",
  "data_fim": "2026-09-15",
  "total_receitas": 8500.00,
  "total_despesas": 3240.50,
  "saldo_periodo": 5259.50
}
POST
/api/v1/cobrancas/pix
Cria uma cobrança Pix para a conta vinculada à integração.

Body
JSON
Copiar
{
  "valor": 125.50
}
Exemplo JavaScript
JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}

const response = await fetch('https://arkhe-backend.zbbquj.easypanel.host/api/v1/cobrancas/pix', {
  method: 'POST',
  headers: {
    ...headers,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ valor: 125.50 })
})

const data = await response.json()
console.log('ID:', data.id_cobranca)
console.log('Código Pix:', data.codigo_pagamento)
Exemplo de resposta
JSON
Copiar
{
  "id_cobranca": 123,
  "valor": 125.50,
  "codigo_pagamento": "ARKHEPIX:EXEMPLO123",
  "status": 0,
  "tipo_cobranca": 1
}
O codigo_pagamento identifica a cobrança e pode ser usado pelo sistema integrado para gerar o QR Code do Pix Arkhé.

0 Pendente
1 Pago
GET
/api/v1/cobrancas/pix/{id_cobranca}
Consulta os dados e o status de uma cobrança Pix criada pela integração.

Parâmetro de rota
id_cobranca
Identificador retornado na criação da cobrança.
Exemplo JavaScript
JavaScript
Copiar
const headers = {
  'X-Client-ID': 'SEU_CLIENT_ID',
  'X-Client-Secret': 'SEU_CLIENT_SECRET'
}

const idCobranca = 123

const response = await fetch(
  'https://arkhe-backend.zbbquj.easypanel.host/api/v1/cobrancas/pix/' + encodeURIComponent(idCobranca),
  { method: 'GET', headers }
)

const data = await response.json()

if (data.status === 1) {
  console.log('Pagamento confirmado')
}
Exemplo de resposta
JSON
Copiar
{
  "id_cobranca": 123,
  "id_recebedor": 9,
  "valor": 125.50,
  "codigo_pagamento": "ARKHEPIX:EXEMPLO123",
  "status": 1,
  "tipo_cobranca": 1
}
0 Pendente
1 Pago
RESPOSTAS DE ERRO

Erros da API
Verifique sempre o status HTTP antes de utilizar os dados da resposta.

400
Requisição inválida.
401
Credenciais ausentes ou inválidas.
403
Integração sem permissão ou desativada.
404
Recurso não encontrado.
500
Erro interno.
Tratamento básico
JavaScript
Copiar
const response = await fetch('https://arkhe-backend.zbbquj.easypanel.host/api/v1/saldo', { headers })
const data = await response.json()

if (!response.ok) {
  console.error(data.mensagem || 'Não foi possível concluir a requisição')
  return
}

console.log(data)
SEGURANÇA

Boas práticas
Não exponha o Client Secret no navegador.
Mantenha as credenciais no servidor do sistema integrado.
Use HTTPS em todas as comunicações.
Não coloque credenciais em repositórios públicos.
Cada integração pertence a uma única conta PJ.