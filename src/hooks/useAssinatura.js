import { useCallback, useEffect, useState } from "react";
import api from "../config/api.js";

// Dias inteiros até `data` (AAAA-MM-DD); negativo se já passou
export function diasAte(data) {
    const hoje = new Date();
    return Math.round((new Date(`${data}T00:00`) - new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) / 86400000);
}

export const dataAssinatura = (data) => new Date(`${data}T00:00`).toLocaleDateString("pt-BR");

// GET /assinaturas/me confere as cobranças na Arkhé, então pode falhar mesmo com a API no ar
export default function useAssinatura() {
    const [assinatura, setAssinatura] = useState(null);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    const recarregar = useCallback(async (sinal) => {
        setCarregando(true);
        setErro("");
        try {
            const resposta = await fetch(`${api}/assinaturas/me`, { credentials: "include", signal: sinal });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok || !dados?.assinatura) throw new Error(dados?.error || "Não foi possível carregar sua assinatura.");
            if (!sinal?.aborted) setAssinatura(dados.assinatura);
        } catch (falha) {
            if (!sinal?.aborted) setErro(falha.message);
        } finally {
            if (!sinal?.aborted) setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        recarregar(controller.signal);
        return () => controller.abort();
    }, [recarregar]);

    return { assinatura, setAssinatura, erro, carregando, recarregar: () => recarregar() };
}
