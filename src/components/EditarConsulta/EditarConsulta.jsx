import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../config/api.js";
import { dataHoraLocal } from "../../utils/agendamento.js";
import { consultaAberta, linkConsulta, statusConsulta } from "../../utils/consultas.js";
import { formatarCentavos } from "../../utils/dinheiro.js";
import css from "./EditarConsulta.module.css";

export default function EditarConsulta({ consulta, aoFechar, aoSalvar }) {
    const dialogo = useRef(null);
    const [inicio, setInicio] = useState(dataHoraLocal(new Date(consulta.data_hora_inicio)));
    const [fim, setFim] = useState(dataHoraLocal(new Date(consulta.data_hora_fim)));
    const [link, setLink] = useState(consulta.link_reuniao || "");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [confirmarCancelamento, setConfirmarCancelamento] = useState(false);
    const aberta = consultaAberta(consulta);

    useEffect(() => { dialogo.current.showModal(); }, []);

    async function atualizar(dados) {
        if (salvando) return;
        setSalvando(true);
        setErro("");
        try {
            const resposta = await fetch(`${api}/consultas/${consulta.sessao_id}`, {
                method: "PATCH", credentials: "include",
                headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados),
            });
            const resultado = await resposta.json();
            if (!resposta.ok) throw new Error(resultado.error || "Não foi possível atualizar a sessão.");
            aoSalvar(resultado.sessao);
            toast.success("Sessão atualizada.");
            aoFechar();
        } catch (falha) {
            setErro(falha.message);
        } finally {
            setSalvando(false);
        }
    }

    function salvar(evento) {
        evento.preventDefault();
        const dados = {};
        if (inicio !== dataHoraLocal(new Date(consulta.data_hora_inicio)) || fim !== dataHoraLocal(new Date(consulta.data_hora_fim))) {
            const agora = new Date();
            agora.setSeconds(0, 0);
            if (!inicio || !fim || new Date(inicio) < agora || new Date(fim) <= new Date(inicio)) {
                setErro("Escolha um horário futuro, com o fim depois do início.");
                return;
            }
            dados.timestamp_inicio = inicio;
            dados.timestamp_fim = fim;
        }
        if (link.trim() !== (consulta.link_reuniao || "")) dados.link_reuniao = link.trim() || null;
        if (!Object.keys(dados).length) {
            setErro("Altere o horário ou o link antes de salvar.");
            return;
        }
        atualizar(dados);
    }

    return <dialog ref={dialogo} className={css.dialogo} aria-labelledby="titulo-consulta"
        onCancel={(evento) => { evento.preventDefault(); if (!salvando) aoFechar(); }}>
        <header className={css.cabecalho}>
            <h2 id="titulo-consulta">Sessão com {consulta.paciente_nome}</h2>
            <button type="button" onClick={aoFechar} disabled={salvando} aria-label="Fechar detalhes">×</button>
        </header>
        <p>{statusConsulta[consulta.status]} · {formatarCentavos(consulta.valor_centavos)}</p>
        <Link to={`/prontuario/${consulta.paciente_id}`}>Abrir prontuário</Link>
        <form onSubmit={salvar}>
            <fieldset disabled={!aberta || salvando} className={css.campos}>
                <label>Início<input type="datetime-local" value={inicio} onChange={(evento) => setInicio(evento.target.value)} required /></label>
                <label>Fim<input type="datetime-local" value={fim} onChange={(evento) => setFim(evento.target.value)} required /></label>
                <label>Link da reunião<input type="url" value={link} maxLength={255} placeholder="https://..." onChange={(evento) => setLink(evento.target.value)} /></label>
            </fieldset>
            {erro && <p role="alert" className={css.erro}>{erro}</p>}
            {salvando && <p role="status">Salvando sessão...</p>}
            {aberta && <div className={css.acoes}>
                <button type="submit" disabled={salvando}>Salvar alterações</button>
                {linkConsulta(consulta) && <a href={linkConsulta(consulta)} target="_blank" rel="noopener noreferrer">Iniciar sessão</a>}
                <button type="button" disabled={salvando || new Date(consulta.data_hora_fim) > new Date()}
                    title="Disponível após o fim do horário da sessão" onClick={() => atualizar({ status: "REALIZADO" })}>Concluir sessão</button>
                <button type="button" disabled={salvando} onClick={() => setConfirmarCancelamento(true)}>Cancelar sessão</button>
            </div>}
        </form>
        {aberta && confirmarCancelamento && <div className={css.confirmacao}>
            <p>Cancelar esta sessão? O horário será liberado. Esta ação não realiza estorno de pagamento.</p>
            <div className={css.acoes}>
                <button disabled={salvando} onClick={() => atualizar({ status: "CANCELADO" })}>Confirmar cancelamento</button>
                <button disabled={salvando} onClick={() => setConfirmarCancelamento(false)}>Manter sessão</button>
            </div>
        </div>}
    </dialog>;
}
