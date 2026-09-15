import css from "./VerHorarios.module.css";
import { X } from "lucide-react";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function VerHorarios({ horariosDisponiveis, onSelecionar, fechar }) {

    function selecionarHorario(dia, horario) {
        if (onSelecionar) {
            onSelecionar({ dia, horario });
        }
    }

    return (
        <div className={css.painel}>

            <div className={css.cabecalho}>
                <strong>Horários disponíveis:</strong>

                <button
                    className={css.fechar}
                    onClick={fechar}
                    title="Fechar"
                >
                    <X size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
            </div>

            <div className={css.listaDias}>

                {DIAS.map((dia) => {

                    const horariosDoDia = horariosDisponiveis?.[dia] || [];

                    return (
                        <div key={dia} className={css.blocoDia}>

                            <span className={css.nomeDia}>{dia}</span>

                            {horariosDoDia.length > 0 ? (

                                <div className={css.gradeHorarios}>
                                    {horariosDoDia.map((horario) => (
                                        <button
                                            key={horario}
                                            className={css.botaoHorario}
                                            onClick={() => selecionarHorario(dia, horario)}
                                        >
                                            {horario}
                                        </button>
                                    ))}
                                </div>

                            ) : (

                                <span className={css.semHorario}>
                                    Não possui horários disponíveis
                                </span>

                            )}

                        </div>
                    );

                })}

            </div>

        </div>
    );
}