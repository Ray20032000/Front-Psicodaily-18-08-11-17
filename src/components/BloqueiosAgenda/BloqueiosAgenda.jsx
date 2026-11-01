import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import { dataHoraLocal } from "../../utils/agendamento.js";
import Skeleton from "../Skeleton/Skeleton.jsx";
import css from "./BloqueiosAgenda.module.css";

const dataCurta = (data) => new Date(`${data}T00:00`).toLocaleDateString("pt-BR");

// Férias e folgas: GET, POST e DELETE /profissionais/me/bloqueios. Bloquear não cancela sessões já marcadas
export default function BloqueiosAgenda() {
    const [bloqueios, setBloqueios] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);
    const [inicio, setInicio] = useState("");
    const [fim, setFim] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [apagando, setApagando] = useState(null);
    const hoje = dataHoraLocal().slice(0, 10);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        fetch(`${api}/profissionais/me/bloqueios`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok || !Array.isArray(dados?.bloqueios)) throw new Error(dados?.error || "Não foi possível carregar seus bloqueios.");
                setBloqueios(dados.bloqueios);
            })
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [versao]);

    async function criar(evento) {
        evento.preventDefault();
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/profissionais/me/bloqueios`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inicio, fim }),
            });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível bloquear o período.");
            setBloqueios((atuais) => [...atuais, dados.bloqueio].sort((a, b) => a.inicio.localeCompare(b.inicio)));
            setInicio("");
            setFim("");
            const sessoes = dados.sessoes_no_periodo;
            if (sessoes > 0) {
                toast.warning(`${sessoes === 1 ? "1 sessão segue marcada" : `${sessoes} sessões seguem marcadas`} nesse período; cancele as que não for atender.`, { duration: 8000 });
            } else {
                toast.success("Período bloqueado.");
            }
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setSalvando(false);
        }
    }

    async function apagar(id) {
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/profissionais/me/bloqueios/${id}`, { method: "DELETE", credentials: "include" });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível apagar o bloqueio.");
            setBloqueios((atuais) => atuais.filter((bloqueio) => bloqueio.bloqueio_id !== id));
            toast.success("Bloqueio apagado.");
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setApagando(null);
            setSalvando(false);
        }
    }

    return <>
        <h2>Férias e folgas</h2>
        <p className={css.dica}>Nos dias bloqueados, os pacientes não conseguem agendar. As sessões já marcadas continuam.</p>
        {erro ? <p role="alert">{erro} <button type="button" onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</button></p>
            : !bloqueios ? <Skeleton height="90px" radius="10px" />
                : <>
                    {bloqueios.length > 0 && <ul className={css.lista}>
                        {bloqueios.map(({ bloqueio_id: id, inicio: de, fim: ate }) => <li key={id}>
                            <span>{de === ate ? dataCurta(de) : `${dataCurta(de)} a ${dataCurta(ate)}`}</span>
                            {apagando === id ? <span className={css.confirmar}>
                                Apagar?
                                <button type="button" disabled={salvando} onClick={() => apagar(id)}>Sim</button>
                                <button type="button" disabled={salvando} onClick={() => setApagando(null)}>Não</button>
                            </span> : <button type="button" className={css.remover} aria-label={`Apagar bloqueio de ${dataCurta(de)}`} onClick={() => setApagando(id)}>
                                <X size={16} aria-hidden="true" />
                            </button>}
                        </li>)}
                    </ul>}
                    <form className={css.formulario} onSubmit={criar}>
                        <label>De<input type="date" required min={hoje} value={inicio} onChange={(evento) => setInicio(evento.target.value)} /></label>
                        <label>Até<input type="date" required min={inicio || hoje} value={fim} onChange={(evento) => setFim(evento.target.value)} /></label>
                        <button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Bloquear período"}</button>
                    </form>
                </>}
    </>;
}
