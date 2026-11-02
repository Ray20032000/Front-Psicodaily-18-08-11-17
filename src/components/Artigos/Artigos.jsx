import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import UserAvatar from "../UserAvatar/UserAvatar.jsx";
import Skeleton from "../Skeleton/Skeleton.jsx";
import css from "./Artigos.module.css";

const TAMANHO_TRECHO = 160;
export const dataArtigo = (valor) => new Date(valor).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
const trecho = (texto) => texto.length > TAMANHO_TRECHO ? `${texto.slice(0, TAMANHO_TRECHO).trimEnd()}...` : texto;

// O react-markdown não interpreta HTML do texto (fica como texto) e bloqueia links javascript:.
// Imagem externa fica de fora: o servidor dela saberia quem leu o artigo.
export function Markdown({ texto }) {
    return <div className={css.markdown}>
        <ReactMarkdown disallowedElements={["img"]} unwrapDisallowed
            components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>
            {texto}
        </ReactMarkdown>
    </div>;
}

// Lista do perfil. A API só devolve artigos de quem tem Premium; sem nenhum, a seção não aparece
export function ArtigosPerfil({ idProfissional, className = "" }) {
    const [artigos, setArtigos] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        fetch(`${api}/artigos/?autor=${idProfissional}&page_size=5`, { credentials: "include", signal: controller.signal })
            .then((resposta) => resposta.ok ? resposta.json() : null)
            .then((dados) => setArtigos(dados?.artigos || []))
            .catch(() => {});
        return () => controller.abort();
    }, [idProfissional]);

    if (!artigos.length) return null;

    return <section className={`${css.perfil} ${className}`} aria-label="Artigos do profissional">
        <h2>Artigos</h2>
        {artigos.map((artigo) => <Link key={artigo.artigo_id} to={`/artigos/${artigo.artigo_id}`} className={css.artigo}>
            <strong>{artigo.titulo}</strong>
            {artigo.subtitulo && <span>{artigo.subtitulo}</span>}
            <small>{dataArtigo(artigo.publicado_em)}</small>
        </Link>)}
    </section>;
}

// Editor em Preferências. Publicar e editar são do Premium: abaixo dele a API responde 403 com `plano_necessario`
export function EditorArtigos({ idProfissional }) {
    const [artigos, setArtigos] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);
    const [editando, setEditando] = useState(null);
    const [titulo, setTitulo] = useState("");
    const [subtitulo, setSubtitulo] = useState("");
    const [corpo, setCorpo] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [apagando, setApagando] = useState(null);
    const [precisaPlano, setPrecisaPlano] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        fetch(`${api}/artigos/?autor=${idProfissional}&page_size=50`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok || !Array.isArray(dados?.artigos)) throw new Error(dados?.error || "Não foi possível carregar seus artigos.");
                setArtigos(dados.artigos);
            })
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [idProfissional, versao]);

    function limpar() {
        setEditando(null);
        setTitulo("");
        setSubtitulo("");
        setCorpo("");
    }

    // A lista não traz o corpo: busca o artigo inteiro para editar
    async function editar(id) {
        try {
            const resposta = await fetch(`${api}/artigos/${id}`, { credentials: "include" });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível abrir o artigo.");
            setEditando(id);
            setTitulo(dados.artigo.titulo);
            setSubtitulo(dados.artigo.subtitulo || "");
            setCorpo(dados.artigo.corpo);
        } catch (falha) {
            toast.error(falha.message);
        }
    }

    async function salvar(evento) {
        evento.preventDefault();
        setSalvando(true);
        try {
            const resposta = await fetch(editando ? `${api}/artigos/${editando}` : `${api}/artigos/`, {
                method: editando ? "PATCH" : "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titulo, subtitulo, corpo }),
            });
            const dados = await resposta.json().catch(() => null);
            if (resposta.status === 403 && dados?.plano_necessario) {
                setPrecisaPlano(true);
                return;
            }
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível salvar o artigo.");
            setArtigos((atuais) => editando
                ? atuais.map((artigo) => artigo.artigo_id === editando ? dados.artigo : artigo)
                : [dados.artigo, ...atuais]);
            toast.success(editando ? "Artigo atualizado." : "Artigo publicado.");
            limpar();
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setSalvando(false);
        }
    }

    async function apagar(id) {
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/artigos/${id}`, { method: "DELETE", credentials: "include" });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível apagar o artigo.");
            setArtigos((atuais) => atuais.filter((artigo) => artigo.artigo_id !== id));
            if (editando === id) limpar();
            toast.success("Artigo apagado.");
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setApagando(null);
            setSalvando(false);
        }
    }

    if (erro) return <p role="alert" className={css.legenda}>{erro} <button type="button" className={css.link} onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</button></p>;
    if (!artigos) return <Skeleton height="120px" radius="10px" />;

    return <div className={css.editor}>
        {precisaPlano && <p role="alert" className={css.aviso}>
            Publicar artigos é um benefício do plano Premium. <Link to="/assinaturas">Ver planos</Link>
        </p>}

        {artigos.length > 0 && <ul className={css.lista}>
            {artigos.map((artigo) => <li key={artigo.artigo_id}>
                <Link to={`/artigos/${artigo.artigo_id}`} className={css.tituloItem}>{artigo.titulo}</Link>
                {apagando === artigo.artigo_id ? <span className={css.acoes}>
                    Apagar?
                    <button type="button" className={css.link} disabled={salvando} onClick={() => apagar(artigo.artigo_id)}>Sim</button>
                    <button type="button" className={css.link} disabled={salvando} onClick={() => setApagando(null)}>Não</button>
                </span> : <span className={css.acoes}>
                    <button type="button" className={css.link} onClick={() => editar(artigo.artigo_id)}>Editar</button>
                    <button type="button" className={css.link} onClick={() => setApagando(artigo.artigo_id)}>Apagar</button>
                </span>}
            </li>)}
        </ul>}

        <form className={css.formulario} onSubmit={salvar}>
            <label>Título
                <input required minLength={3} maxLength={200} value={titulo} onChange={(evento) => setTitulo(evento.target.value)} />
            </label>
            <label>Subtítulo
                <input required minLength={3} maxLength={300} value={subtitulo} onChange={(evento) => setSubtitulo(evento.target.value)} />
            </label>
            <div className={css.escrita}>
                <label>Texto em Markdown
                    <textarea required rows={14} maxLength={20000} value={corpo} onChange={(evento) => setCorpo(evento.target.value)}
                        placeholder={"## Seção\n\nTexto com **negrito**, *itálico* e [link](https://exemplo.com).\n\n- item de lista"} />
                </label>
                <div className={css.previa} aria-live="polite">
                    <span>Pré-visualização</span>
                    {corpo.trim() ? <Markdown texto={corpo} /> : <p className={css.legenda}>O texto formatado aparece aqui.</p>}
                </div>
            </div>
            <div className={css.acoesFormulario}>
                {editando && <button type="button" className={css.secundario} onClick={limpar}>Cancelar</button>}
                <button type="submit" className={css.primario} disabled={salvando}>{salvando ? "Salvando..." : editando ? "Salvar artigo" : "Publicar artigo"}</button>
            </div>
        </form>
    </div>;
}

// Seção da Home. Some se a lista vier vazia ou der erro: o visitante não precisa saber
export function DestaquesArtigos({ className = "" }) {
    const [artigos, setArtigos] = useState([]);
    const [aberto, setAberto] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch(`${api}/artigos/destaques?limite=6`, { signal: controller.signal })
            .then((resposta) => resposta.ok ? resposta.json() : null)
            .then((dados) => setArtigos(dados?.artigos || []))
            .catch(() => {});
        return () => controller.abort();
    }, []);

    if (!artigos.length) return null;

    return <section className={className}>
        <div className="container">
            <h2 className={css.tituloDestaques}>Artigos de profissionais</h2>
            <div className={css.grade}>
                {artigos.map((artigo) => <button key={artigo.artigo_id} type="button" className={css.cartao} onClick={() => setAberto(artigo)}>
                    <strong>{artigo.titulo}</strong>
                    <span className={css.trecho}>{trecho(artigo.subtitulo || artigo.corpo)}</span>
                    <span className={css.autor}>
                        <span className={css.foto}><UserAvatar nome={artigo.autor.nome} src={artigo.autor.foto_url} /></span>
                        {artigo.autor.nome}
                    </span>
                </button>)}
            </div>
        </div>

        {/* No diálogo, e não na página /artigos: ela só abre para quem está logado */}
        <Dialog.Root open={Boolean(aberto)} onOpenChange={(abrir) => { if (!abrir) setAberto(null); }}>
            <Dialog.Portal>
                <Dialog.Overlay className={css.fundo}>
                    <Dialog.Content className={css.dialogo} aria-describedby={undefined}>
                        <Dialog.Close className={css.fechar} aria-label="Fechar"><X size={20} aria-hidden="true" /></Dialog.Close>
                        {aberto && <>
                            <Dialog.Title className={css.tituloDialogo}>{aberto.titulo}</Dialog.Title>
                            {aberto.subtitulo && <p className={css.subtituloDialogo}>{aberto.subtitulo}</p>}
                            <p className={css.legenda}>{aberto.autor.nome} · {dataArtigo(aberto.publicado_em)}</p>
                            <Markdown texto={aberto.corpo} />
                        </>}
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    </section>;
}
