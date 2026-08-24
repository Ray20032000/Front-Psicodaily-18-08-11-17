import { useState, useEffect } from "react";
import css from './Alerts.module.css';

const titulosPorTipo = {
    erro: "Erro",
    sucesso: "Sucesso",
    redirecionamento: "Redirecionando"
};

export default function Alerts({ titulo, descricao, imagem, tipo = "erro", duracao = 10000, onClose }) {
    const [visivel, setVisivel] = useState(true);
    const tipoSeguro = titulosPorTipo[tipo] ? tipo : "erro";

    function fechar() {
        setVisivel(false);
        onClose?.();
    }

    useEffect(() => {
        const tempo = Number.isFinite(Number(duracao)) ? Number(duracao) : 10000;

        if (tempo <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            fechar();
        }, tempo);

        return () => clearTimeout(timer);
    }, [duracao]);

    if (!visivel) return null;

    return (
        <div
            className={`${css.alert} ${css[tipoSeguro]}`}
            role="alert"
            aria-live="polite"
        >
            {imagem && <img src={imagem} alt="" aria-hidden="true" />}

            <div className={css.conteudo}>
                <h4 className={css.titulo}>{titulo || titulosPorTipo[tipoSeguro]}</h4>
                {descricao && <p className={css.descricao}>{descricao}</p>}
            </div>


            <button
                type="button"
                className={`${css.fechar} ${css[`fechar_${tipoSeguro}`]} d-flex h-100 align-items-center`}
                onClick={fechar}
                aria-label="Fechar alerta"
            >
                ✕
            </button>
        </div>
    );
}
