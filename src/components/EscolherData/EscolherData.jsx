import { useState } from "react";
import css from "./EscolherData.module.css";
import { X } from "lucide-react";
import { dataHoraLocal } from "../../utils/agendamento.js";

export default function EscolherData({ fechar, onSalvar, dataInicial = "" }) {
    const [data, setData] = useState(dataInicial);

    function handleSalvar(event) {
        event.preventDefault();
        if (!data) return;
        onSalvar(data);
        fechar();
    }

    return (
        <div className={css.overlay}>
            <form className={css.container} onSubmit={handleSalvar} role="dialog" aria-modal="true" aria-labelledby="titulo-escolher-data">

                <button
                    type="button"
                    className={css.fecharX}
                    onClick={fechar}
                    title="Cancelar"
                >
                    <X size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>

                <h2 id="titulo-escolher-data" className={css.titulo}>Escolha uma data</h2>

                <label htmlFor="data-consulta">Data e horário da consulta</label>
                <input
                    id="data-consulta"
                    className={css.inpute}
                    type="datetime-local"
                    min={dataHoraLocal()}
                    required
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                />

                <button
                    className={css.botao}
                    type="submit"
                    disabled={!data}
                >
                    Salvar
                </button>
            </form>
        </div>
    );
}
