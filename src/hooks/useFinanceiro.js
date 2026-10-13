import { useEffect, useState } from "react";
import api from "../config/api.js";

// Saldo, resumo do mês e movimentações dos últimos `dias` da conta Arkhé
export default function useFinanceiro(dias) {
    const [financeiro, setFinanceiro] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        async function carregar() {
            setCarregando(true);
            setErro("");
            try {
                const resposta = await fetch(`${api}/pagamentos/financeiro?dias=${dias}`, { credentials: "include", signal: controller.signal });
                // Proxy ou servidor fora do ar podem responder HTML em vez de JSON
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok) throw new Error(dados?.error || "Não foi possível carregar o financeiro.");
                if (!Number.isFinite(dados?.saldo) || !dados.resumo || !Array.isArray(dados.movimentacoes)) {
                    throw new Error("A API retornou o financeiro em formato inválido.");
                }
                if (!controller.signal.aborted) setFinanceiro(dados);
            } catch (falha) {
                if (!controller.signal.aborted) setErro(falha.message);
            } finally {
                if (!controller.signal.aborted) setCarregando(false);
            }
        }
        carregar();
        return () => controller.abort();
    }, [dias, versao]);

    return { financeiro, carregando, erro, recarregar: () => setVersao((atual) => atual + 1) };
}
