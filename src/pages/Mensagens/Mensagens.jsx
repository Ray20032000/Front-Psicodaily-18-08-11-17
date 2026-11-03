import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import css from "./Mensagens.module.css";

const POR_PAGINA = 50;
const MAXIMO_TEXTO = 2000;
const MAXIMO_ARQUIVO = 10 * 1024 * 1024;
const horario = (valor) => new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const tamanho = (bytes) => bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const previa = (mensagem) => mensagem ? mensagem.texto || mensagem.arquivo?.nome || "" : "Sem mensagens ainda";

// A mensagem pode chegar pelo POST e pelo WebSocket: o id evita mostrar duas vezes
function juntar(atuais, novas) {
    const ids = new Set(atuais.map((mensagem) => mensagem.mensagem_id));
    return [...atuais, ...novas.filter((mensagem) => !ids.has(mensagem.mensagem_id))]
        .sort((a, b) => a.mensagem_id - b.mensagem_id);
}

async function pedirJson(caminho, opcoes) {
    const resposta = await fetch(`${api}${caminho}`, { credentials: "include", ...opcoes });
    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok || !dados) throw new Error(dados?.error || "Não foi possível falar com o servidor.");
    return dados;
}

export default function Mensagens() {
    const { usuario } = useUsuario();
    const [conversas, setConversas] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);
    const [aberta, setAberta] = useState(null);
    const [mensagens, setMensagens] = useState(null);
    const [temAnteriores, setTemAnteriores] = useState(false);
    const [carregandoAnteriores, setCarregandoAnteriores] = useState(false);
    const [texto, setTexto] = useState("");
    const [arquivo, setArquivo] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const entradaArquivo = useRef(null);
    const fim = useRef(null);
    const rolarParaFim = useRef(false);
    // O WebSocket vive a página inteira: lê o estado atual por aqui
    const abertaRef = useRef(null);
    const mensagensRef = useRef([]);
    abertaRef.current = aberta;
    mensagensRef.current = mensagens || [];

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        pedirJson("/chat/", { signal: controller.signal })
            .then((dados) => setConversas(dados.conversas))
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [versao]);

    useEffect(() => {
        if (rolarParaFim.current) fim.current?.scrollIntoView({ block: "end" });
        rolarParaFim.current = false;
    }, [mensagens]);

    function atualizarConversa(outroId, mensagem, somarNaoLida) {
        setConversas((atuais) => {
            if (!atuais) return atuais;
            const conversa = atuais.find((item) => item.id_usuario === outroId);
            // Conversa que ainda não estava na lista (vínculo novo): o recarregamento a traz
            if (!conversa) return atuais;
            return [
                { ...conversa, ultima_mensagem: mensagem, nao_lidas: conversa.nao_lidas + (somarNaoLida ? 1 : 0) },
                ...atuais.filter((item) => item !== conversa),
            ];
        });
    }

    // /ws/chat só recebe. Ao reconectar, busca com `depois` o que chegou enquanto estava fora
    useEffect(() => {
        let encerrado = false;
        let reconectando = false;
        let espera = 1000;
        let temporizador;
        let socket;

        async function recuperar() {
            setVersao((atual) => atual + 1);
            const outroId = abertaRef.current;
            const ultima = mensagensRef.current.at(-1)?.mensagem_id;
            if (!outroId || !ultima) return;
            const dados = await pedirJson(`/chat/${outroId}?depois=${ultima}&limite=100`).catch(() => null);
            if (dados && abertaRef.current === outroId && dados.mensagens.length) {
                rolarParaFim.current = true;
                setMensagens((atuais) => juntar(atuais || [], dados.mensagens));
            }
        }

        function receber(evento) {
            let dados;
            try {
                dados = JSON.parse(evento.data);
            } catch {
                return;
            }
            if (dados.type !== "mensagem") return;
            const { mensagem } = dados;
            const outroId = dados.paciente_id === usuario.id_usuario ? dados.profissional_id : dados.paciente_id;
            const minha = mensagem.remetente_id === usuario.id_usuario;
            const naTela = abertaRef.current === outroId;
            atualizarConversa(outroId, mensagem, !minha && !naTela);
            if (naTela) {
                rolarParaFim.current = true;
                setMensagens((atuais) => juntar(atuais || [], [mensagem]));
                // O GET é o que marca como lida para o remetente
                if (!minha) pedirJson(`/chat/${outroId}?depois=${mensagem.mensagem_id}&limite=1`).catch(() => {});
            }
        }

        function conectar() {
            const url = new URL(api, window.location.origin);
            url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
            url.pathname = "/ws/chat";
            socket = new WebSocket(url.toString());
            socket.addEventListener("open", () => {
                espera = 1000;
                if (reconectando) recuperar();
                reconectando = true;
            });
            socket.addEventListener("message", receber);
            socket.addEventListener("close", () => {
                if (encerrado) return;
                reconectando = true;
                temporizador = setTimeout(conectar, espera);
                espera = Math.min(espera * 2, 30000);
            });
        }

        conectar();
        return () => {
            encerrado = true;
            clearTimeout(temporizador);
            socket.close();
        };
    }, [usuario.id_usuario]);

    async function abrir(outroId) {
        setAberta(outroId);
        setMensagens(null);
        setTexto("");
        setArquivo(null);
        try {
            const dados = await pedirJson(`/chat/${outroId}?limite=${POR_PAGINA}`);
            if (abertaRef.current !== outroId) return;
            rolarParaFim.current = true;
            setMensagens(dados.mensagens);
            setTemAnteriores(dados.mensagens.length === POR_PAGINA);
            setConversas((atuais) => atuais.map((item) => item.id_usuario === outroId ? { ...item, nao_lidas: 0 } : item));
        } catch (falha) {
            toast.error(falha.message);
            if (abertaRef.current === outroId) setAberta(null);
        }
    }

    async function carregarAnteriores() {
        setCarregandoAnteriores(true);
        try {
            const dados = await pedirJson(`/chat/${aberta}?antes=${mensagens[0].mensagem_id}&limite=${POR_PAGINA}`);
            setMensagens((atuais) => juntar(atuais, dados.mensagens));
            setTemAnteriores(dados.mensagens.length === POR_PAGINA);
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setCarregandoAnteriores(false);
        }
    }

    function escolherArquivo(evento) {
        const escolhido = evento.target.files?.[0];
        evento.target.value = "";
        if (!escolhido) return;
        if (escolhido.size > MAXIMO_ARQUIVO) {
            toast.error("O arquivo deve ter no máximo 10 MB.");
            return;
        }
        setArquivo(escolhido);
    }

    async function enviar(evento) {
        evento.preventDefault();
        const conteudo = texto.trim();
        if ((!conteudo && !arquivo) || enviando) return;
        setEnviando(true);
        try {
            let opcoes = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto: conteudo }),
            };
            if (arquivo) {
                const corpo = new FormData();
                corpo.append("arquivo", arquivo);
                if (conteudo) corpo.append("texto", conteudo);
                opcoes = { method: "POST", body: corpo };
            }
            const { mensagem } = await pedirJson(`/chat/${aberta}${arquivo ? "/arquivo" : ""}`, opcoes);
            rolarParaFim.current = true;
            setMensagens((atuais) => juntar(atuais || [], [mensagem]));
            atualizarConversa(aberta, mensagem, false);
            setTexto("");
            setArquivo(null);
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setEnviando(false);
        }
    }

    // A URL expira em 5 minutos, então só é pedida no clique. A aba abre antes do fetch para não ser bloqueada
    async function abrirAnexo(mensagemId) {
        const aba = window.open("", "_blank");
        try {
            const { url } = await pedirJson(`/chat/arquivo/${mensagemId}`);
            if (aba) {
                aba.opener = null;
                aba.location.href = url;
            } else {
                window.location.assign(url);
            }
        } catch (falha) {
            aba?.close();
            toast.error(falha.message);
        }
    }

    const conversaAberta = conversas?.find((item) => item.id_usuario === aberta);

    return <main className={`${css.pagina} ${aberta ? css.comConversa : ""}`}>
        <section className={css.lista} aria-label="Conversas">
            <h1>Mensagens</h1>
            {erro && !conversas && <p role="alert" className={css.vazio}>{erro} <button type="button" className={css.link} onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</button></p>}
            {!erro && !conversas && <Carregando texto="Carregando conversas...">
                {[1, 2, 3].map((item) => <Skeleton key={item} height="56px" radius="10px" className={css.esqueleto} />)}
            </Carregando>}
            {conversas && !conversas.length && <p className={css.vazio}>A conversa com um profissional ou paciente aparece aqui depois da primeira sessão agendada.</p>}
            {conversas?.map((conversa) => <button
                key={conversa.id_usuario}
                type="button"
                className={css.conversa}
                aria-current={conversa.id_usuario === aberta}
                onClick={() => abrir(conversa.id_usuario)}
            >
                <span className={css.avatar}><UserAvatar nome={conversa.nome} src={conversa.foto_url} /></span>
                <span className={css.resumo}>
                    <strong>{conversa.nome}</strong>
                    <small>{previa(conversa.ultima_mensagem)}</small>
                </span>
                {conversa.nao_lidas > 0 && <span className={css.naoLidas} aria-label={`${conversa.nao_lidas} não lidas`}>{conversa.nao_lidas}</span>}
            </button>)}
        </section>

        <section className={css.conversaAberta} aria-label={conversaAberta ? `Conversa com ${conversaAberta.nome}` : "Conversa"}>
            {!aberta ? <p className={css.vazio}>Escolha uma conversa para começar.</p> : <>
                <header className={css.cabecalho}>
                    <button type="button" className={css.voltar} aria-label="Voltar às conversas" onClick={() => setAberta(null)}><ArrowLeft size={18} aria-hidden="true" /></button>
                    <strong>{conversaAberta?.nome}</strong>
                </header>

                <div className={css.mensagens}>
                    {!mensagens && <Carregando texto="Carregando mensagens..."><Skeleton height="120px" radius="10px" /></Carregando>}
                    {temAnteriores && <button type="button" className={css.anteriores} disabled={carregandoAnteriores} onClick={carregarAnteriores}>
                        {carregandoAnteriores ? "Carregando..." : "Mensagens anteriores"}
                    </button>}
                    {mensagens && !mensagens.length && <p className={css.vazio}>Nenhuma mensagem ainda. Envie a primeira.</p>}
                    {mensagens?.map((mensagem) => <article key={mensagem.mensagem_id} className={mensagem.remetente_id === usuario.id_usuario ? css.minha : css.dele}>
                        {mensagem.arquivo && <button type="button" className={css.anexo} onClick={() => abrirAnexo(mensagem.mensagem_id)}>
                            <FileText size={16} aria-hidden="true" />
                            <span>{mensagem.arquivo.nome}</span>
                            <small>{tamanho(mensagem.arquivo.tamanho)}</small>
                        </button>}
                        {mensagem.texto && <p>{mensagem.texto}</p>}
                        <time dateTime={mensagem.criado_em}>{horario(mensagem.criado_em)}</time>
                    </article>)}
                    <div ref={fim} />
                </div>

                <form className={css.formulario} onSubmit={enviar}>
                    {arquivo && <p className={css.arquivoEscolhido}>
                        <FileText size={14} aria-hidden="true" /> {arquivo.name} ({tamanho(arquivo.size)})
                        <button type="button" aria-label="Tirar anexo" onClick={() => setArquivo(null)}><X size={14} aria-hidden="true" /></button>
                    </p>}
                    <div className={css.linhaEnvio}>
                        <input ref={entradaArquivo} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.mp3,.m4a,.ogg,.opus,.webm,application/pdf,image/jpeg,image/png,audio/*" onChange={escolherArquivo} />
                        <button type="button" className={css.icone} aria-label="Anexar PDF, imagem (JPG, PNG) ou áudio de até 10 MB" title="Anexar PDF, imagem (JPG, PNG) ou áudio de até 10 MB" onClick={() => entradaArquivo.current.click()}>
                            <Paperclip size={18} aria-hidden="true" />
                        </button>
                        <input
                            type="text"
                            value={texto}
                            maxLength={MAXIMO_TEXTO}
                            placeholder={arquivo ? "Legenda (opcional)" : "Escreva uma mensagem"}
                            aria-label="Mensagem"
                            onChange={(evento) => setTexto(evento.target.value)}
                        />
                        <button type="submit" className={css.enviar} aria-label="Enviar mensagem" disabled={enviando || (!texto.trim() && !arquivo)}>
                            <Send size={16} aria-hidden="true" />
                        </button>
                    </div>
                </form>
            </>}
        </section>
    </main>;
}
