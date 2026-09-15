// Campos monetários da API/banco são centavos; formulários e telas usam reais.
export function centavosParaReais(valor) {
    return Number(valor || 0) / 100;
}

export function reaisParaCentavos(valor) {
    const texto = String(valor).trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
        throw new Error("Informe um valor positivo com até duas casas decimais.");
    }
    const [inteiros, decimais = ""] = texto.split(".");
    const centavos = Number(inteiros) * 100 + Number(decimais.padEnd(2, "0"));
    if (!Number.isSafeInteger(centavos) || centavos <= 0) {
        throw new Error("Informe um valor positivo válido.");
    }
    return centavos;
}

export function formatarCentavos(valor) {
    return centavosParaReais(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
