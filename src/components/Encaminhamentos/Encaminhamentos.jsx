import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../../config/api.js";
import Skeleton from "../Skeleton/Skeleton.jsx";
import css from "./Encaminhamentos.module.css";

// A API manda a data em GMT, sem fuso de verdade: ler em UTC mantém o dia gravado
const dataEncaminhamento = (valor) => new Date(valor).toLocaleDateString("pt-BR", { timeZone: "UTC" });

// Encaminhamentos deste profissional para o paciente aberto no prontuário
export default function Encaminhamentos({ idPaciente }) {
    const [encaminhamentos, setEncaminhamentos] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);
    const [abrindo, setAbrindo] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [cid, setCid] = useState("");
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        fetch(`${api}/encaminhamentos/`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok || !Array.isArray(dados?.encaminhamentos)) throw new Error(dados?.error || "Não foi possível carregar os encaminhamentos.");
                setEncaminhamentos(dados.encaminhamentos.filter((item) => item.paciente_id === idPaciente));
            })
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [idPaciente, versao]);

    async function encaminhar(evento) {
        evento.preventDefault();
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/encaminhamentos/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_usuario: idPaciente, motivo: motivo.trim(), id_cid: cid.trim() || null }),
            });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível criar o encaminhamento.");
            setEncaminhamentos((atuais) => [dados.encaminhamento, ...(atuais || [])]);
            setMotivo("");
            setCid("");
            setAbrindo(false);
            toast.success("Encaminhamento registrado.");
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setSalvando(false);
        }
    }

    return <section className={css.secao}>
        <div className={css.topo}>
            <h2>Encaminhamentos</h2>
            {!abrindo && <button type="button" className={css.botao} onClick={() => setAbrindo(true)}>Encaminhar</button>}
        </div>

        {abrindo && <form className={css.formulario} onSubmit={encaminhar}>
            <label>Motivo
                <textarea required rows={4} maxLength={2000} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
            </label>
            <label>CID-10 (opcional)
                <input value={cid} maxLength={6} placeholder="Ex.: F32.1" pattern="[A-Za-z]\d{2}(\.?\d{1,2})?" title="Código CID-10, ex.: F32.1" onChange={(evento) => setCid(evento.target.value)} />
            </label>
            <div className={css.acoes}>
                <button type="button" className={css.secundario} disabled={salvando} onClick={() => setAbrindo(false)}>Cancelar</button>
                <button type="submit" className={css.botao} disabled={salvando}>{salvando ? "Salvando..." : "Registrar"}</button>
            </div>
        </form>}

        {erro ? <p role="alert" className={css.legenda}>{erro} <button type="button" className={css.link} onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</button></p>
            : !encaminhamentos ? <Skeleton height="48px" radius="8px" />
                : !encaminhamentos.length ? !abrindo && <p className={css.legenda}>Nenhum encaminhamento para este paciente.</p>
                    : <ul className={css.lista}>
                        {encaminhamentos.map((item) => <li key={item.encaminhamento_id}>
                            <small>{dataEncaminhamento(item.criado_em)}{item.cid ? ` · CID ${item.cid}` : ""}</small>
                            <p>{item.motivo}</p>
                        </li>)}
                    </ul>}
    </section>;
}
