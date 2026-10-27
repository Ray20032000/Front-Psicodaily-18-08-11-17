import { useEffect, useState } from "react";
import api from "../config/api.js";

// Ganhos do profissional nos últimos `dias` (7, 30, 90 ou 365): consultas pagas com taxas e líquido,
// resumo do período, saldo a receber e repasses (estes dois não dependem do período)
export default function useGanhos(dias) {
    const [ganhos, setGanhos] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        async function carregar() {
            setCarregando(true);
            setErro("");
            try {
                const resposta = await fetch(`${api}/pagamentos/ganhos?dias=${dias}`, { credentials: "include", signal: controller.signal });
                // Proxy ou servidor fora do ar podem responder HTML em vez de JSON
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok) throw new Error(dados?.error || "Não foi possível carregar seus ganhos.");
                if (!dados?.resumo || !Number.isFinite(dados.saldo?.a_receber_centavos)
                    || !Array.isArray(dados.consultas) || !Array.isArray(dados.repasses)) {
                    throw new Error("A API retornou os ganhos em formato inválido.");
                }
                if (!controller.signal.aborted) setGanhos(dados);
            } catch (falha) {
                if (!controller.signal.aborted) setErro(falha.message);
            } finally {
                if (!controller.signal.aborted) setCarregando(false);
            }
        }
        carregar();
        return () => controller.abort();
    }, [dias, versao]);

    return { ganhos, carregando, erro, recarregar: () => setVersao((atual) => atual + 1) };
}
