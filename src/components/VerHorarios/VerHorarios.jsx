import css from "./VerHorarios.module.css";
import { X } from "lucide-react";

const nomeDia = (dia) => new Date(`${dia}T12:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });

// `horarios` vem de GET /profissionais/<id>/horarios: [{inicio, fim}] em AAAA-MM-DDTHH:MM
export default function VerHorarios({ horarios, selecionado, onSelecionar, fechar }) {
    const porDia = {};
    horarios.forEach((horario) => (porDia[horario.inicio.slice(0, 10)] ??= []).push(horario));

    return (
        <div className={css.painel}>

            <div className={css.cabecalho}>
                <strong>Horários disponíveis:</strong>

                <button
                    type="button"
                    className={css.fechar}
                    onClick={fechar}
                    title="Fechar"
                >
                    <X size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
            </div>

            <div className={css.listaDias}>

                {!horarios.length && <span className={css.semHorario}>Nenhum horário livre nas próximas duas semanas.</span>}

                {Object.entries(porDia).map(([dia, horariosDoDia]) => (
                    <div key={dia} className={css.blocoDia}>

                        <span className={css.nomeDia}>{nomeDia(dia)}</span>

                        <div className={css.gradeHorarios}>
                            {horariosDoDia.map((horario) => (
                                <button
                                    key={horario.inicio}
                                    type="button"
                                    className={css.botaoHorario}
                                    aria-pressed={horario.inicio === selecionado}
                                    onClick={() => onSelecionar(horario.inicio)}
                                >
                                    {horario.inicio.slice(11)}
                                </button>
                            ))}
                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}
