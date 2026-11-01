import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../config/api.js";

// Ids dos profissionais favoritos do paciente, gravados em /favoritos
export default function useFavoritos() {
    const [favoritos, setFavoritos] = useState(() => new Set());

    useEffect(() => {
        const controller = new AbortController();
        fetch(`${api}/favoritos/`, { credentials: "include", signal: controller.signal })
            .then((resposta) => resposta.ok ? resposta.json() : null)
            .then((dados) => {
                if (dados?.favoritos) setFavoritos(new Set(dados.favoritos.map((item) => item.id_profissional)));
            })
            // O coração só aparece vazio: não vale um erro na tela por isso
            .catch(() => {});
        return () => controller.abort();
    }, []);

    function trocarLocal(id, marcar) {
        setFavoritos((atuais) => {
            const novos = new Set(atuais);
            if (marcar) novos.add(id);
            else novos.delete(id);
            return novos;
        });
    }

    // Marca na hora e desfaz se a API recusar
    async function alternarFavorito(id) {
        const marcar = !favoritos.has(id);
        trocarLocal(id, marcar);
        try {
            const resposta = await fetch(`${api}/favoritos/${id}`, { method: marcar ? "POST" : "DELETE", credentials: "include" });
            if (!resposta.ok) {
                const dados = await resposta.json().catch(() => null);
                throw new Error(dados?.error || "Não foi possível atualizar seus favoritos.");
            }
        } catch (falha) {
            trocarLocal(id, !marcar);
            toast.error(falha.message);
        }
    }

    return { favoritos, alternarFavorito };
}
