export const nomesHumor = { PESSIMO: "Muito Mal", RUIM: "Mal", NEUTRO: "Neutro", BOM: "Bem", EXCELENTE: "Muito Bem" };
export const nomesSono = { RUIM: "Ruim", REGULAR: "Média", BOA: "Boa", EXCELENTE: "Excelente" };
export const nomesAlimentacao = { POUCA: "Pouca", DESREGULADA: "Desregulada", ADEQUADA: "Adequada", EXCESSIVA: "Excessiva" };

export function prepararRegistro(formulario) {
    const humor = Object.keys(nomesHumor).find((chave) => nomesHumor[chave] === formulario.humor);
    const qualidade_sono = Object.keys(nomesSono).find((chave) => nomesSono[chave] === formulario.qualidadeSono);
    const minutos_sono = Number(formulario.sono) * 60;
    if (!humor || !qualidade_sono || !Number.isInteger(minutos_sono) || minutos_sono < 0 || minutos_sono > 1440) {
        throw new Error("Confira o humor e os dados de sono.");
    }
    const duracao = formulario.duracao === "" ? null : Number(formulario.duracao);
    if (duracao !== null && (!Number.isInteger(duracao) || duracao < 0 || duracao > 1440)) {
        throw new Error("A duração deve ser um número inteiro entre 0 e 1440 minutos.");
    }
    const pessoas = formulario.socializacao.filter((pessoa) => pessoa !== "Ninguém");
    const refeicoes = [["cafe", "Café da manhã"], ["almoco", "Almoço"], ["jantar", "Jantar"], ["lanches", "Lanches"]]
        .filter(([campo]) => formulario[campo]).map(([, nome]) => nome);
    // Detalhes que não têm coluna própria ficam legíveis na anotação existente.
    const detalhes = [
        `Refeições marcadas: ${refeicoes.join(", ") || "nenhuma"}.`,
        `Água marcada: ${formulario.agua ? "sim" : "não"}.`,
        `Atividade: ${formulario.atividade || "não informada"}; duração: ${duracao === null ? "não informada" : `${duracao} minutos`}.`,
        `Socialização: ${formulario.socializacao.join(", ") || "não informada"}.`,
    ];
    const anotacao = [formulario.anotacao.trim(), "Detalhes do diário:", ...detalhes].filter(Boolean).join("\n");
    if (anotacao.length > 10000) throw new Error("Reduza as anotações para até 10000 caracteres, incluindo os detalhes.");
    return {
        humor, qualidade_sono, minutos_sono,
        alimentacao: formulario.alimentacao || null,
        exercicio_fisico: Boolean(formulario.atividade.trim()) || duracao > 0,
        // Quantidade de categorias de interação selecionadas, não de pessoas.
        interacao: formulario.socializacao.length ? pessoas.length : null,
        anotacao,
    };
}
