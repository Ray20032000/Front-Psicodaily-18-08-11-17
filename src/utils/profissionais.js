import { intervaloConsulta } from "./agendamento.js";
import { centavosParaReais, reaisParaCentavos } from "./dinheiro.js";

export function normalizarProfissional(profissional) {
    const especialidades = { CRP: "Psicologia", CRM: "Psiquiatria" };
    return {
        ...profissional,
        id: profissional.id_usuario,
        crp: `${profissional.conselho_tipo || ""} ${profissional.conselho_numero || ""}`.trim(),
        especialidade: profissional.especialidade || especialidades[profissional.conselho_tipo] || "",
        valor_sessao: centavosParaReais(profissional.preco_centavos)
    };
}

export function parametrosProfissionais(filtros) {
    const parametros = new URLSearchParams({ page_size: "100" });
    if (filtros.especialidade) parametros.set("especialidade", filtros.especialidade);
    if (filtros.preco_max) {
        const preco = reaisParaCentavos(filtros.preco_max);
        parametros.set("preco_max", String(preco));
    }
    if (filtros.data || filtros.horario) {
        if (!filtros.data || !filtros.horario) throw new Error("Preencha a data e o horário para filtrar a disponibilidade.");
        const intervalo = intervaloConsulta(`${filtros.data}T${filtros.horario}`);
        parametros.set("disponibilidade_inicio", intervalo.inicio);
        parametros.set("disponibilidade_fim", intervalo.fim);
    }
    return parametros;
}
