import { useState } from "react";
import { Dialog } from "radix-ui";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { dataHoraLocal, intervaloConsulta } from "../../utils/agendamento.js";
import css from "./VerHorarios.module.css";

// O GET /profissionais/<id>/horarios devolve, por padrão, os próximos 14 dias
const TOTAL_DIAS = 14;
const DIAS_POR_PAGINA = 7;
const periodos = [["Manhã", 0, 12], ["Tarde", 12, 18], ["Noite", 18, 24]];

const chaveDia = (data) => dataHoraLocal(data).slice(0, 10);

// `horarios` vem de GET /profissionais/<id>/horarios ([{inicio, fim}] em AAAA-MM-DDTHH:MM), ou é null
// quando o profissional não tem agenda: aí o POST /consultas aceita qualquer horário, e o modal oferece
// sessões de hora em hora, das 8h às 20h
export default function VerHorarios({ horarios, selecionado, onSelecionar, fechar }) {
    const hoje = new Date();
    const agora = dataHoraLocal();
    const dias = Array.from({ length: TOTAL_DIAS }, (_, indice) => new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + indice));
    const inicios = (horarios ? horarios.map((horario) => horario.inicio)
        : dias.flatMap((data) => Array.from({ length: 13 }, (_, indice) => `${chaveDia(data)}T${String(8 + indice).padStart(2, "0")}:00`)))
        .filter((inicio) => inicio > agora);
    const porDia = {};
    inicios.forEach((inicio) => (porDia[inicio.slice(0, 10)] ??= []).push(inicio));

    const [escolhido, setEscolhido] = useState(inicios.includes(selecionado) ? selecionado : "");
    const [dia, setDia] = useState(() => escolhido.slice(0, 10) || inicios[0]?.slice(0, 10) || chaveDia(hoje));
    const [pagina, setPagina] = useState(() => Math.floor(Math.max(0, dias.findIndex((data) => chaveDia(data) === dia)) / DIAS_POR_PAGINA));

    const visiveis = dias.slice(pagina * DIAS_POR_PAGINA, (pagina + 1) * DIAS_POR_PAGINA);
    const meses = [...new Set(visiveis.map((data) => data.toLocaleDateString("pt-BR", { month: "long" })))];
    const horariosDoDia = porDia[dia] || [];

    return <Dialog.Root open onOpenChange={(aberto) => { if (!aberto) fechar(); }}>
        <Dialog.Portal>
            <Dialog.Overlay className={css.fundo} />
            <Dialog.Content className={css.modal}>
                <header className={css.cabecalho}>
                    <div>
                        <Dialog.Title className={css.titulo}>Escolha um horário</Dialog.Title>
                        <Dialog.Description className={css.subtitulo}>
                            {horarios ? "Sessões de 1 hora." : "Este profissional ainda não publicou a agenda: o horário é confirmado ao agendar."}
                        </Dialog.Description>
                    </div>
                    <Dialog.Close className={css.fechar} aria-label="Fechar"><X size={18} aria-hidden="true" /></Dialog.Close>
                </header>

                <div className={css.corpo}>
                    <div className={css.topoDias}>
                        <span className={css.mes}>{meses.join(" – ")} {visiveis.at(-1).getFullYear()}</span>
                        <div className={css.setas}>
                            <button type="button" aria-label="Dias anteriores" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>
                                <ChevronLeft size={18} aria-hidden="true" />
                            </button>
                            <button type="button" aria-label="Próximos dias" disabled={(pagina + 1) * DIAS_POR_PAGINA >= TOTAL_DIAS} onClick={() => setPagina(pagina + 1)}>
                                <ChevronRight size={18} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <div className={css.dias} role="group" aria-label="Dia da consulta">
                        {visiveis.map((data) => {
                            const chave = chaveDia(data);
                            const quantidade = porDia[chave]?.length || 0;
                            return <button key={chave} type="button" className={css.dia} aria-pressed={chave === dia} disabled={!quantidade}
                                aria-label={`${data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}, ${quantidade ? `${quantidade} horários` : "sem horários"}`}
                                onClick={() => setDia(chave)}>
                                <span>{data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span>
                                <strong>{data.getDate()}</strong>
                            </button>;
                        })}
                    </div>

                    {!inicios.length ? <p className={css.vazio}>Nenhum horário livre nas próximas duas semanas.</p>
                        : !horariosDoDia.length ? <p className={css.vazio}>Nenhum horário livre neste dia.</p>
                            : periodos.map(([nome, de, ate]) => {
                                const doPeriodo = horariosDoDia.filter((inicio) => Number(inicio.slice(11, 13)) >= de && Number(inicio.slice(11, 13)) < ate);
                                return doPeriodo.length > 0 && <section key={nome} className={css.periodo} aria-label={nome}>
                                    <h3>{nome}</h3>
                                    <div className={css.grade}>
                                        {doPeriodo.map((inicio) => <button key={inicio} type="button" className={css.horario}
                                            aria-pressed={inicio === escolhido} onClick={() => setEscolhido(inicio)}>
                                            {inicio.slice(11)}
                                        </button>)}
                                    </div>
                                </section>;
                            })}
                </div>

                <footer className={css.rodape}>
                    <p className={css.resumo} aria-live="polite">
                        {escolhido ? <>
                            <span>{new Date(escolhido).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })}</span>
                            <strong>{escolhido.slice(11)} – {intervaloConsulta(escolhido).fim.slice(11)}</strong>
                        </> : "Selecione um horário"}
                    </p>
                    <div className={css.acoes}>
                        <Dialog.Close className={css.secundario}>Cancelar</Dialog.Close>
                        <button type="button" className={css.primario} disabled={!escolhido} onClick={() => onSelecionar(escolhido)}>Confirmar</button>
                    </div>
                </footer>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>;
}
