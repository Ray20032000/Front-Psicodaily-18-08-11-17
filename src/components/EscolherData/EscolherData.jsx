import { useState } from "react";
import css from "./EscolherData.module.css";

export default function EscolherData({ fechar, onSalvar }) {
    const [data, setData] = useState("");

    function handleSalvar() {
        if (!data) return;
        onSalvar(data);
        fechar();
    }

    return (
        <div className={css.overlay}>
            <div className={css.container}>

                <button
                    className={css.fecharX}
                    onClick={fechar}
                    title="Cancelar"
                >
                    ×
                </button>

                <h2 className={css.titulo}>Escolha uma data</h2>

                <input
                    className={css.inpute}
                    type="datetime-local"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                />

                <button
                    className={css.botao}
                    onClick={handleSalvar}
                    disabled={!data}
                >
                    Salvar
                </button>
            </div>
        </div>
    );
}