import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import UserAvatar from "../UserAvatar/UserAvatar.jsx";
import Skeleton from "../Skeleton/Skeleton.jsx";
import css from "./Artigos.module.css";

const TAMANHO_TRECHO = 160;
const dataArtigo = (valor) => new Date(valor).toLocaleDateString("pt-BR");
const trecho = (corpo) => corpo.length > TAMANHO_TRECHO ? `${corpo.slice(0, TAMANHO_TRECHO).trimEnd()}...` : corpo;

// `corpo` é texto do usuário: aparece sempre como texto, com pre-wrap, nunca como HTML

// Lista do perfil. A API devolve lista vazia abaixo do Premium, e aí a seção não aparece
export function ArtigosPerfil({ idProfissional, className = "" }) {
    const [artigos, setArtigos] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        fetch(`${api}/profissionais/${idProfissional}/conteudos`, { credentials: "include", signal: controller.signal })
            .then((resposta) => resposta.ok ? resposta.json() : null)
            .then((dados) => setArtigos(dados?.conteudos || []))
            .catch(() => {});
        return () => controller.abort();
    }, [idProfissional]);

    if (!artigos.length) return null;

    return <section className={`${css.perfil} ${className}`} aria-label="Artigos do profissional">
        <h2>Artigos</h2>
        {artigos.map((artigo) => <details key={artigo.conteudo_id} className={css.artigo}>
            <summary>{artigo.titulo} <small>{dataArtigo(artigo.publicado_em)}</small></summary>
            <p className={css.corpo}>{artigo.corpo}</p>
        </details>)}
    </section>;
}

// Editor em Preferências. Publicar é do Premium: abaixo dele a API responde 403 com `plano_necessario`
export function EditorArtigos({ idProfissional }) {
    const [artigos, setArtigos] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);
    const [editando, setEditando] = useState(null);
    const [titulo, setTitulo] = useState("");
    const [corpo, setCorpo] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [apagando, setApagando] = useState(null);
    const [precisaPlano, setPrecisaPlano] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        fetch(`${api}/profissionais/${idProfissional}/conteudos`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok || !Array.isArray(dados?.conteudos)) throw new Error(dados?.error || "Não foi possível carregar seus artigos.");
                setArtigos(dados.conteudos);
            })
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [idProfissional, versao]);

    function limpar() {
        setEditando(null);
        setTitulo("");
        setCorpo("");
    }

    function editar(artigo) {
        setEditando(artigo.conteudo_id);
        setTitulo(artigo.titulo);
        setCorpo(artigo.corpo);
    }

    async function salvar(evento) {
        evento.preventDefault();
        setSalvando(true);
        try {
            const resposta = await fetch(editando ? `${api}/conteudos/${editando}` : `${api}/conteudos/`, {
                method: editando ? "PATCH" : "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titulo, corpo }),
            });
            const dados = await resposta.json().catch(() => null);
            if (resposta.status === 403 && dados?.plano_necessario) {
                setPrecisaPlano(true);
                return;
            }
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível salvar o artigo.");
            setArtigos((atuais) => editando
                ? atuais.map((artigo) => artigo.conteudo_id === editando ? dados.conteudo : artigo)
                : [dados.conteudo, ...atuais]);
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
            const resposta = await fetch(`${api}/conteudos/${id}`, { method: "DELETE", credentials: "include" });
            const dados = await resposta.json().catch(() => null);
            if (resposta.status === 403 && dados?.plano_necessario) {
                setPrecisaPlano(true);
                return;
            }
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível apagar o artigo.");
            setArtigos((atuais) => atuais.filter((artigo) => artigo.conteudo_id !== id));
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
            {artigos.map((artigo) => <li key={artigo.conteudo_id}>
                <span className={css.tituloItem}>{artigo.titulo}</span>
                {apagando === artigo.conteudo_id ? <span className={css.acoes}>
                    Apagar?
                    <button type="button" className={css.link} disabled={salvando} onClick={() => apagar(artigo.conteudo_id)}>Sim</button>
                    <button type="button" className={css.link} disabled={salvando} onClick={() => setApagando(null)}>Não</button>
                </span> : <span className={css.acoes}>
                    <button type="button" className={css.link} onClick={() => editar(artigo)}>Editar</button>
                    <button type="button" className={css.link} onClick={() => setApagando(artigo.conteudo_id)}>Apagar</button>
                </span>}
            </li>)}
        </ul>}

        <form className={css.formulario} onSubmit={salvar}>
            <label>Título
                <input required minLength={3} maxLength={200} value={titulo} onChange={(evento) => setTitulo(evento.target.value)} />
            </label>
            <label>Texto
                <textarea required rows={8} maxLength={20000} value={corpo} onChange={(evento) => setCorpo(evento.target.value)} />
            </label>
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
        fetch(`${api}/conteudos/destaques?limite=6`, { signal: controller.signal })
            .then((resposta) => resposta.ok ? resposta.json() : null)
            .then((dados) => setArtigos(dados?.conteudos || []))
            .catch(() => {});
        return () => controller.abort();
    }, []);

    if (!artigos.length) return null;

    return <section className={className}>
        <div className="container">
            <h2 className={css.tituloDestaques}>Artigos de profissionais</h2>
            <div className={css.grade}>
                {artigos.map((artigo) => <button key={artigo.conteudo_id} type="button" className={css.cartao} onClick={() => setAberto(artigo)}>
                    <strong>{artigo.titulo}</strong>
                    <span className={css.trecho}>{trecho(artigo.corpo)}</span>
                    <span className={css.autor}>
                        <span className={css.foto}><UserAvatar nome={artigo.profissional_nome} src={artigo.profissional_foto_url} /></span>
                        {artigo.profissional_nome}
                    </span>
                </button>)}
            </div>
        </div>

        {/* No diálogo, e não no perfil: o perfil só abre para paciente logado */}
        <Dialog.Root open={Boolean(aberto)} onOpenChange={(abrir) => { if (!abrir) setAberto(null); }}>
            <Dialog.Portal>
                <Dialog.Overlay className={css.fundo}>
                    <Dialog.Content className={css.dialogo} aria-describedby={undefined}>
                        <Dialog.Close className={css.fechar} aria-label="Fechar"><X size={20} aria-hidden="true" /></Dialog.Close>
                        {aberto && <>
                            <Dialog.Title className={css.tituloDialogo}>{aberto.titulo}</Dialog.Title>
                            <p className={css.legenda}>{aberto.profissional_nome} · {dataArtigo(aberto.publicado_em)}</p>
                            <p className={css.corpo}>{aberto.corpo}</p>
                        </>}
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    </section>;
}
