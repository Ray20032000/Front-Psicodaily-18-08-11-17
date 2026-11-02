import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { Markdown, dataArtigo } from "../../components/Artigos/Artigos.jsx";
import css from "./Artigos.module.css";

// 9 fecha as linhas da grade: na 1ª página, destaque + 2 ao lado + 6 abaixo; nas outras, 3 linhas de 3
const POR_PAGINA = 9;

function useBusca(caminho) {
    const [estado, setEstado] = useState({ dados: null, erro: "" });
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setEstado({ dados: null, erro: "" });
        fetch(`${api}${caminho}`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok) throw new Error(dados?.error || "Não foi possível carregar.");
                setEstado({ dados, erro: "" });
            })
            .catch((falha) => { if (!controller.signal.aborted) setEstado({ dados: null, erro: falha.message }); });
        return () => controller.abort();
    }, [caminho, tentativa]);

    return { ...estado, setDados: (dados) => setEstado({ dados, erro: "" }), recarregar: () => setTentativa((atual) => atual + 1) };
}

function Autor({ artigo }) {
    return <span className={css.autor}>
        <span className={css.foto}><UserAvatar nome={artigo.autor.nome} src={artigo.autor.foto_url} /></span>
        {artigo.autor.nome}
    </span>;
}

function Cartao({ artigo, destaque = false }) {
    const Titulo = destaque ? "h2" : "h3";
    return <Link to={`/artigos/${artigo.artigo_id}`} className={`${css.cartao} ${destaque ? css.destaque : ""}`}>
        {destaque && <span className={css.selo}>Destaque</span>}
        <Titulo>{artigo.titulo}</Titulo>
        {artigo.subtitulo && <p className={css.subtitulo}>{artigo.subtitulo}</p>}
        <span className={css.rodapeCartao}>
            <Autor artigo={artigo} />
            <span className={css.meta}>
                {dataArtigo(artigo.publicado_em)}
                {artigo.curtidas > 0 && <><Heart size={13} aria-hidden="true" /> {artigo.curtidas}</>}
            </span>
        </span>
    </Link>;
}

// Estrutura de portal de notícias: destaque grande com duas matérias ao lado e a grade das demais
export default function Artigos() {
    const [parametros, setParametros] = useSearchParams();
    const pagina = Math.max(Number(parametros.get("pagina")) || 1, 1);
    const { dados, erro, recarregar } = useBusca(`/artigos/?page=${pagina}&page_size=${POR_PAGINA}`);
    const artigos = dados?.artigos || [];
    const capa = pagina === 1 ? artigos.slice(0, 3) : [];
    const grade = artigos.slice(capa.length);

    return <div className={css.fundo}>
        <main className={css.container}>
            <header className={css.topo}>
                <h1>Artigos</h1>
                <p>Textos de psicólogos e psiquiatras da plataforma, dos mais recentes aos mais antigos</p>
            </header>

            {erro ? <p role="alert" className={css.aviso}>{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></p>
                : !dados ? <Carregando texto="Carregando artigos..." className={css.capa}>
                    <Skeleton height="260px" radius="16px" />
                    <Skeleton height="122px" radius="16px" />
                    <Skeleton height="122px" radius="16px" />
                </Carregando>
                : !artigos.length ? <p className={css.aviso}>Nenhum artigo publicado ainda.</p>
                : <>
                    {capa.length > 0 && <section className={css.capa} aria-label="Destaques">
                        <Cartao artigo={capa[0]} destaque />
                        {capa.slice(1).map((artigo) => <Cartao key={artigo.artigo_id} artigo={artigo} />)}
                    </section>}

                    {grade.length > 0 && <section aria-labelledby="mais-artigos">
                        {pagina === 1 && <h2 id="mais-artigos" className={css.tituloSecao}>Mais artigos</h2>}
                        <div className={css.grade}>
                            {grade.map((artigo) => <Cartao key={artigo.artigo_id} artigo={artigo} />)}
                        </div>
                    </section>}

                    {dados.total_pages > 1 && <nav className={css.paginacao} aria-label="Páginas de artigos">
                        <button type="button" disabled={pagina <= 1} onClick={() => setParametros({ pagina: pagina - 1 })}>Mais recentes</button>
                        <span>Página {pagina} de {dados.total_pages}</span>
                        <button type="button" disabled={pagina >= dados.total_pages} onClick={() => setParametros({ pagina: pagina + 1 })}>Anteriores</button>
                    </nav>}
                </>}
        </main>
    </div>;
}

export function Artigo() {
    const { idArtigo } = useParams();
    const { dados, erro, setDados, recarregar } = useBusca(`/artigos/${idArtigo}`);
    const [curtindo, setCurtindo] = useState(false);
    const artigo = dados?.artigo;

    async function curtir() {
        setCurtindo(true);
        try {
            // POST curte e DELETE descurte; repetir não conta duas vezes
            const resposta = await fetch(`${api}/artigos/${idArtigo}/curtida`, { method: artigo.curtido ? "DELETE" : "POST", credentials: "include" });
            const retorno = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(retorno?.error || "Não foi possível registrar a curtida.");
            setDados({ artigo: { ...artigo, ...retorno } });
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setCurtindo(false);
        }
    }

    return <div className={css.fundo}>
        <main className={`${css.container} ${css.leitura}`}>
            <Link to="/artigos" className={css.voltar}><ArrowLeft size={16} aria-hidden="true" /> Todos os artigos</Link>

            {erro ? <p role="alert" className={css.aviso}>{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></p>
                : !artigo ? <Carregando texto="Carregando artigo..." className={css.texto}>
                    <Skeleton width="80%" height="36px" />
                    <Skeleton width="60%" height="20px" />
                    <Skeleton height="240px" radius="8px" />
                </Carregando>
                : <article className={css.texto}>
                    <header className={css.cabecalhoArtigo}>
                        <h1>{artigo.titulo}</h1>
                        {artigo.subtitulo && <p className={css.subtitulo}>{artigo.subtitulo}</p>}
                        <div className={css.assinatura}>
                            <span className={css.fotoGrande}><UserAvatar nome={artigo.autor.nome} src={artigo.autor.foto_url} /></span>
                            <div>
                                <strong>{artigo.autor.nome}</strong>
                                <p>
                                    Publicado em {dataArtigo(artigo.publicado_em)}
                                    {artigo.atualizado_em && <> · Editado em {dataArtigo(artigo.atualizado_em)}</>}
                                </p>
                            </div>
                        </div>
                    </header>

                    <Markdown texto={artigo.corpo} />

                    <footer className={css.rodape}>
                        <button type="button" className={`${css.curtir} ${artigo.curtido ? css.curtido : ""}`} onClick={curtir}
                            disabled={curtindo} aria-pressed={artigo.curtido}>
                            <Heart size={18} fill={artigo.curtido ? "currentColor" : "none"} aria-hidden="true" />
                            {artigo.curtido ? "Curtido" : "Curtir"}
                        </button>
                        <span>{artigo.curtidas} {artigo.curtidas === 1 ? "curtida" : "curtidas"}</span>
                    </footer>
                </article>}
        </main>
    </div>;
}
