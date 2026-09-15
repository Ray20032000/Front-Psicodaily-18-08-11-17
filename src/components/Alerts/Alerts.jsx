import { useEffect } from "react";
import { toast } from "sonner";

const titulosPorTipo = {
    erro: "Erro",
    sucesso: "Sucesso",
    redirecionamento: "Redirecionando",
    warning: "Atenção"
};

export default function Alerts({ titulo, descricao, imagem, tipo = "erro", duracao = 10000, onClose }) {
    const tipoSeguro = titulosPorTipo[tipo] ? tipo : "erro";

    useEffect(() => {
        const mensagem = titulo && descricao ? `${titulo}: ${descricao}` : descricao || titulo;
        if (!mensagem) return undefined;
        const opcoes = { id: `${tipoSeguro}-${mensagem}`, duration: duracao, onDismiss: onClose, onAutoClose: onClose };
        if (tipoSeguro === "sucesso") toast.success(mensagem, opcoes);
        else if (tipoSeguro === "warning") toast.warning(mensagem, opcoes);
        else if (tipoSeguro === "redirecionamento") toast.info(mensagem, opcoes);
        else toast.error(mensagem, opcoes);
        return undefined;
    }, [descricao, duracao, onClose, tipoSeguro, titulo]);

    return null;
}
