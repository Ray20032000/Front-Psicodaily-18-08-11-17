import { useEffect, useState } from "react";
import api from "../config/api.js";
import { ordenarConsultas } from "../utils/consultas.js";

export default function useConsultas() {
    const [consultas, setConsultas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        async function carregar() {
            setCarregando(true);
            setErro("");
            try {
                const resposta = await fetch(`${api}/consultas/`, { credentials: "include", signal: controller.signal });
                const dados = await resposta.json();
                if (!resposta.ok) throw new Error(dados.error || "Não foi possível carregar as consultas.");
                if (!Array.isArray(dados.consultas)) throw new Error("A API retornou consultas em formato inválido.");
                if (!controller.signal.aborted) setConsultas(ordenarConsultas(dados.consultas));
            } catch (falha) {
                if (!controller.signal.aborted) setErro(falha.message);
            } finally {
                if (!controller.signal.aborted) setCarregando(false);
            }
        }
        carregar();
        return () => controller.abort();
    }, [versao]);

    function atualizarConsulta(sessao) {
        setConsultas((atuais) => ordenarConsultas(atuais.map((consulta) =>
            consulta.sessao_id === sessao.sessao_id ? { ...consulta, ...sessao } : consulta)));
    }

    return { consultas, carregando, erro, atualizarConsulta, recarregar: () => setVersao((atual) => atual + 1) };
}
