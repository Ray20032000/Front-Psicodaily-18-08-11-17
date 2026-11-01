import api from "../config/api.js";

// A rota do PDF exige o cookie, então não dá para abrir direto por um link.
// A aba abre antes do fetch: depois de um await, o navegador bloquearia como pop-up.
export async function abrirPdf(caminho) {
    const aba = window.open("", "_blank");
    try {
        const resposta = await fetch(`${api}${caminho}`, { credentials: "include" });
        if (!resposta.ok) {
            const dados = await resposta.json().catch(() => null);
            throw new Error(dados?.error || "Não foi possível abrir o boleto.");
        }
        const url = URL.createObjectURL(await resposta.blob());
        if (aba) aba.location.href = url;
        else window.location.assign(url);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (falha) {
        aba?.close();
        throw falha;
    }
}
