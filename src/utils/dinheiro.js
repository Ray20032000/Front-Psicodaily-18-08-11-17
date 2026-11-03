// Campos monetários da API/banco são centavos; formulários e telas usam reais.
export function centavosParaReais(valor) {
    return Number(valor || 0) / 100;
}

// Máscara de valor em reais: os dígitos entram pela direita, como numa maquininha ("15050" vira "150,50")
export function mascaraReais(valor) {
    const digitos = String(valor).replace(/\D/g, "").replace(/^0+/, "").slice(0, 8);
    if (!digitos) return "";
    return (Number(digitos) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function reaisParaCentavos(valor) {
    // Aceita o formato da máscara ("1.234,56"): com vírgula, o ponto é separador de milhar
    const bruto = String(valor).trim();
    const texto = bruto.includes(",") ? bruto.replace(/\./g, "").replace(",", ".") : bruto;
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

// O `valor` das respostas da Arkhé vem em reais, não em centavos
export function formatarReais(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const nomesMetodo ={ PIX: "Pix", BOLETO: "Boleto", CARTAO: "Cartão" };

// `situacao` de cada consulta paga em /pagamentos/ganhos
export const nomesSituacao = {
    AGUARDANDO_CONSULTA: "Aguardando consulta",
    A_RECEBER: "A receber",
    EM_REPASSE: "Em repasse",
    REPASSADO: "Repassado",
    REEMBOLSADO: "Reembolsado",
};
