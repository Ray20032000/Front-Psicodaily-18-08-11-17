import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import css from "./Assistente.module.css";

// Limites de POST /assistente
const MAXIMO_MENSAGENS = 40;
const MAXIMO_CARACTERES = 2000;

const quando = (valor) => new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

// A API exige que a conversa comece com o paciente e recusa texto acima do limite,
// e a resposta do próprio assistente pode passar dele
function paraEnvio(mensagens) {
    const validas = mensagens.filter((mensagem) => mensagem.content.trim())
        .map((mensagem) => ({ role: mensagem.role, content: mensagem.content.slice(0, MAXIMO_CARACTERES) }))
        .slice(-MAXIMO_MENSAGENS);
    const primeira = validas.findIndex((mensagem) => mensagem.role === "user");
    return validas.slice(primeira);
}

// Chat só em memória: fechar a aba apaga a conversa. A API nunca grava nada: agendar ou cancelar são propostas
// que só valem depois da confirmação do paciente aqui
export default function Assistente({ oculto = false }) {
    const navigate = useNavigate();
    const [aberto, setAberto] = useState(false);
    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [proposta, setProposta] = useState(null);
    const [confirmando, setConfirmando] = useState(false);
    const fim = useRef(null);

    useEffect(() => {
        fim.current?.scrollIntoView({ block: "nearest" });
    }, [mensagens, proposta, enviando, aberto]);

    async function enviar(evento) {
        evento.preventDefault();
        const conteudo = texto.trim();
        if (!conteudo || enviando) return;
        const novas = [...mensagens, { role: "user", content: conteudo }];
        setMensagens(novas);
        setTexto("");
        setProposta(null);
        setEnviando(true);
        try {
            const resposta = await fetch(`${api}/assistente/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mensagens: paraEnvio(novas) }),
            });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "O assistente não respondeu. Tente de novo.");
            setMensagens([...novas, { role: "assistant", content: dados.resposta || "" }]);
            if (dados.agendamento) setProposta({ tipo: "agendamento", dados: dados.agendamento });
            else if (dados.cancelamento) setProposta({ tipo: "cancelamento", dados: dados.cancelamento });
        } catch (falha) {
            toast.error(falha.message);
            // Devolve o texto para o paciente não precisar digitar de novo
            setMensagens(mensagens);
            setTexto(conteudo);
        } finally {
            setEnviando(false);
        }
    }

    async function confirmarAgendamento() {
        setConfirmando(true);
        try {
            const resposta = await fetch(`${api}/consultas/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(proposta.dados),
            });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível agendar a consulta.");
            toast.success("Consulta agendada. Agora escolha como pagar.");
            setProposta(null);
            setAberto(false);
            navigate(`/profissionais/${proposta.dados.id_profissional}`, {
                state: { dataAgendamento: proposta.dados.timestamp_inicio, sessaoAgendada: dados.sessao },
            });
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setConfirmando(false);
        }
    }

    async function confirmarCancelamento() {
        setConfirmando(true);
        try {
            const resposta = await fetch(`${api}/consultas/${proposta.dados.sessao_id}/cancelar`, { method: "POST", credentials: "include" });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível cancelar a consulta.");
            toast.success("Consulta cancelada.");
            setProposta(null);
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setConfirmando(false);
        }
    }

    // Só deixa de aparecer: a conversa continua em memória ao voltar
    if (oculto) return null;

    if (!aberto) {
        return <button type="button" className={css.abrir} aria-label="Abrir assistente" onClick={() => setAberto(true)}>
            <MessageCircle size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>;
    }

    return <section className={css.painel} aria-label="Assistente">
        <header className={css.cabecalho}>
            <strong>Assistente PSICOdaily</strong>
            <button type="button" aria-label="Fechar assistente" onClick={() => setAberto(false)}><X size={18} aria-hidden="true" /></button>
        </header>

        <div className={css.mensagens} aria-live="polite">
            <p className={css.aviso}>
                Ajudo a encontrar profissionais e a marcar consultas. Não substituo atendimento. Suas mensagens passam por um serviço
                de IA externo: evite dados pessoais e de saúde. Em crise, ligue 188 (CVV) ou 192 (SAMU).
            </p>
            {mensagens.filter((mensagem) => mensagem.content).map((mensagem, indice) => (
                <p key={indice} className={mensagem.role === "user" ? css.minha : css.dele}>{mensagem.content}</p>
            ))}
            {enviando && <p className={css.dele}>Pensando...</p>}

            {proposta?.tipo === "agendamento" && <div className={css.proposta}>
                <p>Agendar consulta em <strong>{quando(proposta.dados.timestamp_inicio)}</strong>? O pagamento vem depois.</p>
                <div className={css.acoes}>
                    <button type="button" disabled={confirmando} onClick={() => setProposta(null)}>Agora não</button>
                    <button type="button" className={css.primario} disabled={confirmando} onClick={confirmarAgendamento}>
                        {confirmando ? "Agendando..." : "Confirmar"}
                    </button>
                </div>
            </div>}

            {proposta?.tipo === "cancelamento" && <div className={css.proposta}>
                <p>
                    Cancelar a consulta com <strong>{proposta.dados.profissional_nome}</strong> em <strong>{quando(proposta.dados.inicio)}</strong>?
                    {proposta.dados.reembolso_integral && " O que você pagou será devolvido integralmente pela equipe."}
                </p>
                <div className={css.acoes}>
                    <button type="button" disabled={confirmando} onClick={() => setProposta(null)}>Manter consulta</button>
                    <button type="button" className={css.primario} disabled={confirmando} onClick={confirmarCancelamento}>
                        {confirmando ? "Cancelando..." : "Cancelar consulta"}
                    </button>
                </div>
            </div>}
            <div ref={fim} />
        </div>

        <form className={css.formulario} onSubmit={enviar}>
            <input
                type="text"
                value={texto}
                maxLength={MAXIMO_CARACTERES}
                placeholder="Escreva sua mensagem"
                aria-label="Mensagem para o assistente"
                onChange={(evento) => setTexto(evento.target.value)}
            />
            <button type="submit" aria-label="Enviar mensagem" disabled={enviando || !texto.trim()}><Send size={16} aria-hidden="true" /></button>
        </form>
    </section>;
}
