export function dataHoraLocal(data = new Date()) {
    const doisDigitos = (valor) => String(valor).padStart(2, "0");
    return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

export function intervaloConsulta(valor) {
    const inicio = new Date(valor);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor) || Number.isNaN(inicio.getTime()) || dataHoraLocal(inicio) !== valor) {
        throw new Error("Escolha uma data e um horário válidos.");
    }
    const fim = new Date(inicio);
    fim.setHours(fim.getHours() + 1);
    return { inicio: valor, fim: dataHoraLocal(fim) };
}

export function resumoConsulta(contexto) {
    if (!contexto) return { temResumo: false };
    const inicio = new Date(contexto.inicio);
    const fim = new Date(contexto.fim);
    if (!contexto.psicologo?.nome || Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim <= inicio) {
        return { temResumo: false };
    }
    const horario = { hour: "2-digit", minute: "2-digit" };
    return {
        temResumo: true,
        psicologo: contexto.psicologo,
        diaSemana: inicio.toLocaleDateString("pt-BR", { weekday: "long" }),
        data: inicio.toLocaleDateString("pt-BR"),
        horarioInicio: inicio.toLocaleTimeString("pt-BR", horario),
        horarioFim: fim.toLocaleTimeString("pt-BR", horario),
        duracao: `${Math.round((fim - inicio) / 60000)} minutos`
    };
}
