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
