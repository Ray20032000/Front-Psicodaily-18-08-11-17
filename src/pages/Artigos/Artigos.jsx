import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";
import api from "../../config/api.js";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { Markdown, dataArtigo } from "../../components/Artigos/Artigos.jsx";
import css from "./Artigos.module.css";

const POR_PAGINA = 10;
const hojePorExtenso = () => new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

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

function Assinatura({ artigo }) {
    return <p className={css.assinatura}>
        Por <strong>{artigo.autor.nome}</strong> · {dataArtigo(artigo.publicado_em)}
        {artigo.curtidas > 0 && <> · <Heart size={13} aria-label="curtidas" /> {artigo.curtidas}</>}
    </p>;
}

// Lista no estilo de jornal: a matéria mais recente vira manchete na primeira página
export default function Artigos() {
    const [parametros, setParametros] = useSearchParams();
    const pagina = Math.max(Number(parametros.get("pagina")) || 1, 1);
    const { dados, erro, recarregar } = useBusca(`/artigos/?page=${pagina}&page_size=${POR_PAGINA}`);
    const artigos = dados?.artigos || [];
    const [manchete, ...demais] = pagina === 1 ? artigos : [null, ...artigos];

    return <main className={css.pagina}>
        <header className={css.cabecalho}>
            <p className={css.data}>{hojePorExtenso()}</p>
            <h1>Artigos PsicoDaily</h1>
            <p className={css.lema}>Textos de psicólogos e psiquiatras da plataforma</p>
        </header>

        {erro ? <p role="alert" className={css.aviso}>{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></p>
            : !dados ? <Carregando texto="Carregando artigos..." className={css.carregando}>
                <Skeleton height="140px" radius="8px" />
                <div className={css.colunas}>{[1, 2, 3].map((item) => <Skeleton key={item} height="120px" radius="8px" />)}</div>
            </Carregando>
            : !artigos.length ? <p className={css.aviso}>Nenhum artigo publicado ainda.</p>
            : <>
                {manchete && <Link to={`/artigos/${manchete.artigo_id}`} className={css.manchete}>
                    <h2>{manchete.titulo}</h2>
                    {manchete.subtitulo && <p className={css.subtitulo}>{manchete.subtitulo}</p>}
                    <Assinatura artigo={manchete} />
                </Link>}

                <div className={css.colunas}>
                    {demais.map((artigo) => <Link key={artigo.artigo_id} to={`/artigos/${artigo.artigo_id}`} className={css.materia}>
                        <h3>{artigo.titulo}</h3>
                        {artigo.subtitulo && <p className={css.subtitulo}>{artigo.subtitulo}</p>}
                        <Assinatura artigo={artigo} />
                    </Link>)}
                </div>

                {dados.total_pages > 1 && <nav className={css.paginacao} aria-label="Páginas de artigos">
                    <button type="button" disabled={pagina <= 1} onClick={() => setParametros({ pagina: pagina - 1 })}>Mais recentes</button>
                    <span>Página {pagina} de {dados.total_pages}</span>
                    <button type="button" disabled={pagina >= dados.total_pages} onClick={() => setParametros({ pagina: pagina + 1 })}>Anteriores</button>
                </nav>}
            </>}
    </main>;
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

    return <main className={`${css.pagina} ${css.leitura}`}>
        <Link to="/artigos" className={css.voltar}><ArrowLeft size={16} aria-hidden="true" /> Todos os artigos</Link>

        {erro ? <p role="alert" className={css.aviso}>{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></p>
            : !artigo ? <Carregando texto="Carregando artigo..." className={css.carregando}>
                <Skeleton width="80%" height="40px" />
                <Skeleton width="60%" height="20px" />
                <Skeleton height="240px" radius="8px" />
            </Carregando>
            : <article>
                <header className={css.cabecalhoArtigo}>
                    <h1>{artigo.titulo}</h1>
                    {artigo.subtitulo && <p className={css.subtitulo}>{artigo.subtitulo}</p>}
                    <div className={css.autor}>
                        <span className={css.foto}><UserAvatar nome={artigo.autor.nome} src={artigo.autor.foto_url} /></span>
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
    </main>;
}
