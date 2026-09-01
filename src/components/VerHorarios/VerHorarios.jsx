import { Clock } from "lucide-react";
import css from "./VerHorarios.module.css";

const DIAS = [
    {
        label: "Segunda",
        horarios: ["08:00", "14:00"],
    },
    {
        label: "Terça",
        horarios: ["09:00", "15:00", "17:00"],
    },
    {
        label: "Quarta",
        horarios: [],
    },
    {
        label: "Quinta",
        horarios: ["10:00", "15:00", "17:00"],
    },
    {
        label: "Sexta",
        horarios: [],
    },
    {
        label: "Sábado",
        horarios: ["09:00"],
    },
];

export default function VerHorarios() {
    return (
        <div className={css.container}>

            <strong className={css.titulo}>Horários disponíveis:</strong>

            {DIAS.map((dia) => (
                <div key={dia.label} className={css.blocoDia}>

                    <div className={css.cabecalhoDia}>
                        <Clock size={13} />
                        <span className={css.nomeDia}>{dia.label}</span>
                    </div>

                    {dia.horarios.length > 0 ? (
                        <div className={css.pilulas}>
                            {dia.horarios.map((h) => (
                                <div key={h} className={css.pilulaHorario}>
                                    {h}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={css.semHorario}>
                            Não possui horários disponíveis
                        </p>
                    )}

                </div>
            ))}

        </div>
    );
}