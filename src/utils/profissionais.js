import { intervaloConsulta } from "./agendamento.js";
import { centavosParaReais, reaisParaCentavos } from "./dinheiro.js";

// Mesmos valores aceitos pela API (ABORDAGENS / dm_modalidade)
export const abordagens = ["TCC", "Psicanálise", "Humanista", "Gestalt", "Comportamental"];
export const nomesModalidade = { ONLINE: "Online", PRESENCIAL: "Presencial", AMBAS: "Online e presencial" };

export function normalizarProfissional(profissional) {
    const especialidades = { CRP: "Psicologia", CRM: "Psiquiatria" };
    return {
        ...profissional,
        id: profissional.id_usuario,
        crp: `${profissional.conselho_tipo || ""} ${profissional.conselho_numero || ""}`.trim(),
        especialidade: profissional.especialidade || especialidades[profissional.conselho_tipo] || "",
        valor_sessao: centavosParaReais(profissional.preco_centavos),
        totalAvaliacoes: profissional.total_avaliacoes || 0
    };
}

export function parametrosProfissionais(filtros) {
    const parametros = new URLSearchParams({ page_size: "100" });
    if (filtros.especialidade) parametros.set("especialidade", filtros.especialidade);
    if (filtros.preco_max) {
        const preco = reaisParaCentavos(filtros.preco_max);
        parametros.set("preco_max", String(preco));
    }
    ["abordagem", "modalidade", "avaliacao_min"].forEach((campo) => {
        if (filtros[campo]) parametros.set(campo, filtros[campo]);
    });
    if (filtros.data || filtros.horario) {
        if (!filtros.data || !filtros.horario) throw new Error("Preencha a data e o horário para filtrar a disponibilidade.");
        const intervalo = intervaloConsulta(`${filtros.data}T${filtros.horario}`);
        parametros.set("disponibilidade_inicio", intervalo.inicio);
        parametros.set("disponibilidade_fim", intervalo.fim);
    }
    return parametros;
}
