import { dataHoraLocal } from "./agendamento.js";

export const statusConsulta = {
    AGENDADO: "Agendada",
    CONFIRMADO: "Confirmada",
    REALIZADO: "Realizada",
    CANCELADO: "Cancelada",
};

export function consultaAberta(consulta) {
    return ["AGENDADO", "CONFIRMADO"].includes(consulta.status);
}

export function dataConsulta(valor) {
    return dataHoraLocal(new Date(valor)).slice(0, 10);
}

export function horarioConsulta(valor) {
    return new Date(valor).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function ordenarConsultas(consultas) {
    return [...consultas].sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));
}

export function resumoMensal(consultas, hoje = new Date()) {
    const mes = hoje.getMonth();
    const ano = hoje.getFullYear();
    const anterior = new Date(ano, mes - 1, 1);
    const doMes = (consulta, referencia) => {
        const data = new Date(consulta.data_hora_inicio);
        return consulta.status !== "CANCELADO" && data.getMonth() === referencia.getMonth()
            && data.getFullYear() === referencia.getFullYear();
    };
    const atuais = consultas.filter((consulta) => doMes(consulta, hoje));
    const somar = (lista) => lista.reduce((total, consulta) => total + Number(consulta.valor_centavos || 0), 0);
    const previsto = somar(atuais);
    const previstoAnterior = somar(consultas.filter((consulta) => doMes(consulta, anterior)));
    return {
        previsto,
        emAberto: somar(atuais.filter(consultaAberta)),
        sessoes: atuais.length,
        variacao: previstoAnterior > 0 ? ((previsto - previstoAnterior) / previstoAnterior) * 100 : null,
    };
}

export function linkConsulta(consulta) {
    if (!consultaAberta(consulta) || !consulta.link_reuniao) return null;
    try {
        const url = new URL(consulta.link_reuniao);
        return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch {
        return null;
    }
}

const grupoStatus = (status) => status === "REALIZADO" ? "realizadas" : status === "CANCELADO" ? "canceladas" : "agendadas";

// Contagem por mês (do mais antigo ao atual); agendadas inclui as confirmadas
export function sessoesPorMes(consultas, hoje = new Date(), meses = 6) {
    const lista = Array.from({ length: meses }, (_, indice) => {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - meses + 1 + indice, 1);
        return {
            chave: `${data.getFullYear()}-${data.getMonth()}`,
            mes: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
            mesCompleto: data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
            realizadas: 0, agendadas: 0, canceladas: 0,
        };
    });
    const porChave = Object.fromEntries(lista.map((item) => [item.chave, item]));
    consultas.forEach((consulta) => {
        const data = new Date(consulta.data_hora_inicio);
        const item = porChave[`${data.getFullYear()}-${data.getMonth()}`];
        if (item) item[grupoStatus(consulta.status)] += 1;
    });
    return lista;
}

// Último humor registrado de cada paciente, contado por nível
export function humorPacientes(consultas) {
    const ultimos = new Map(consultas.map((consulta) => [consulta.paciente_id, consulta.ultimo_humor]));
    const contagem = { PESSIMO: 0, RUIM: 0, NEUTRO: 0, BOM: 0, EXCELENTE: 0 };
    ultimos.forEach((humor) => { if (humor in contagem) contagem[humor] += 1; });
    return Object.entries(contagem).map(([humor, pacientes]) => ({ humor, pacientes }));
}
