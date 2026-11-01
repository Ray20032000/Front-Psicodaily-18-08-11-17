import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover } from "radix-ui";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import css from "./Notificacoes.module.css";

const POR_PAGINA = 20;
const INTERVALO = 60000;
const quando = (valor) => new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

// Para onde cada notificação leva. Sem destino, ela só é marcada como lida
function destino({ tipo, dados }, paciente, profissional) {
    if (tipo === "VAGA_LISTA_ESPERA" && dados?.profissional_id) return [`/profissionais/${dados.profissional_id}`];
    if (paciente && ["PAGAMENTO_CONFIRMADO", "REEMBOLSO_PAGO"].includes(tipo)) return ["/sessoes"];
    if (profissional && ["PAGAMENTO_RECEBIDO", "REPASSE_PAGO"].includes(tipo)) return ["/carteira"];
    if (profissional && tipo.startsWith("ASSINATURA_")) return ["/assinaturas"];
    if (tipo.startsWith("SESSAO_") || tipo === "LEMBRETE_CONSULTA") {
        if (paciente) return ["/sessoes"];
        if (profissional) return ["/agendaprofissional", { state: { sessaoId: dados?.sessao_id } }];
    }
    return null;
}

export default function Notificacoes() {
    const { usuario } = useUsuario();
    const navigate = useNavigate();
    const [aberto, setAberto] = useState(false);
    const [notificacoes, setNotificacoes] = useState(null);
    const [naoLidas, setNaoLidas] = useState(0);
    const [cursor, setCursor] = useState(null);
    const [erro, setErro] = useState("");
    const [carregandoMais, setCarregandoMais] = useState(false);
    const paciente = usuario?.tipo_usuario === "PACIENTE";
    const profissional = ["PSICOLOGO", "PSIQUIATRA"].includes(usuario?.tipo_usuario);

    async function buscarPagina(antes) {
        const parametros = new URLSearchParams({ limite: POR_PAGINA });
        if (antes) parametros.set("antes", antes);
        const resposta = await fetch(`${api}/notificacoes/?${parametros}`, { credentials: "include" });
        const dados = await resposta.json().catch(() => null);
        if (!resposta.ok || !dados) throw new Error(dados?.error || "Não foi possível carregar as notificações.");
        return dados;
    }

    async function atualizar() {
        try {
            const dados = await buscarPagina();
            setNotificacoes(dados.notificacoes);
            setNaoLidas(dados.nao_lidas);
            setCursor(dados.proximo_cursor);
            setErro("");
        } catch (falha) {
            setErro(falha.message);
        }
    }

    // ponytail: consulta a cada minuto; a API não tem canal em tempo real para notificações
    useEffect(() => {
        atualizar();
        const intervalo = setInterval(() => { if (!document.hidden) atualizar(); }, INTERVALO);
        return () => clearInterval(intervalo);
    }, []);

    async function carregarMais() {
        setCarregandoMais(true);
        try {
            const dados = await buscarPagina(cursor);
            setNotificacoes((atuais) => [...atuais, ...dados.notificacoes]);
            setCursor(dados.proximo_cursor);
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setCarregandoMais(false);
        }
    }

    async function marcarLidas(ids) {
        const resposta = await fetch(`${api}/notificacoes/lidas`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ids ? { ids } : {}),
        });
        if (!resposta.ok) throw new Error("Não foi possível marcar como lida.");
        setNotificacoes((atuais) => atuais.map((item) => !ids || ids.includes(item.notificacao_id) ? { ...item, lida: true } : item));
        setNaoLidas((atual) => ids ? Math.max(0, atual - ids.length) : 0);
    }

    async function abrir(notificacao) {
        if (!notificacao.lida) marcarLidas([notificacao.notificacao_id]).catch((falha) => toast.error(falha.message));
        const rota = destino(notificacao, paciente, profissional);
        if (rota) {
            setAberto(false);
            navigate(...rota);
        }
    }

    return <Popover.Root open={aberto} onOpenChange={(abrirAgora) => { setAberto(abrirAgora); if (abrirAgora) atualizar(); }}>
        <Popover.Trigger className={css.sino} aria-label={naoLidas ? `Notificações, ${naoLidas} não lidas` : "Notificações"}>
            <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
            {naoLidas > 0 && <span className={css.contador} aria-hidden="true">{naoLidas > 99 ? "99+" : naoLidas}</span>}
        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Content align="end" sideOffset={8} className={css.painel}>
                <header className={css.cabecalho}>
                    <strong>Notificações</strong>
                    {naoLidas > 0 && <button type="button" className={css.link} onClick={() => marcarLidas().catch((falha) => toast.error(falha.message))}>Marcar todas como lidas</button>}
                </header>
                {erro && !notificacoes && <p className={css.vazio} role="alert">{erro}</p>}
                {notificacoes && !notificacoes.length && <p className={css.vazio}>Nenhuma notificação por enquanto.</p>}
                {notificacoes?.length > 0 && <ul className={css.lista}>
                    {notificacoes.map((notificacao) => <li key={notificacao.notificacao_id}>
                        <button type="button" className={`${css.item} ${notificacao.lida ? "" : css.naoLida}`} onClick={() => abrir(notificacao)}>
                            <strong>{notificacao.titulo}</strong>
                            <span>{notificacao.mensagem}</span>
                            <small>{quando(notificacao.criado_em)}{notificacao.lida ? "" : " · Não lida"}</small>
                        </button>
                    </li>)}
                </ul>}
                {cursor && <button type="button" className={css.mais} disabled={carregandoMais} onClick={carregarMais}>{carregandoMais ? "Carregando..." : "Carregar mais"}</button>}
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>;
}
