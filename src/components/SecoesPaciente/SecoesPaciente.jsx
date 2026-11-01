import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../config/api.js";
import UserAvatar from "../UserAvatar/UserAvatar.jsx";
import Skeleton from "../Skeleton/Skeleton.jsx";
import { formatarCentavos } from "../../utils/dinheiro.js";
import css from "./SecoesPaciente.module.css";

const dataHora = (valor) => new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const dataCurta = (valor) => new Date(valor).toLocaleDateString("pt-BR");

// Busca uma lista da API para uma seção do painel: { dados, erro, recarregar, setDados }
function useSecao(rota) {
    const [dados, setDados] = useState(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setErro("");
        fetch(`${api}${rota}`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const retorno = await resposta.json().catch(() => null);
                if (!resposta.ok || !retorno) throw new Error(retorno?.error || "Não foi possível carregar.");
                setDados(retorno);
            })
            .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message); });
        return () => controller.abort();
    }, [rota, versao]);

    return { dados, setDados, erro, recarregar: () => setVersao((atual) => atual + 1) };
}

function Estado({ erro, carregando, recarregar }) {
    if (erro) return <p className={css.legenda} role="alert">{erro} <button type="button" className={css.link} onClick={recarregar}>Tentar novamente</button></p>;
    if (carregando) return <Skeleton height="120px" radius="10px" />;
    return null;
}

function Recomendados() {
    const { dados, erro, recarregar } = useSecao("/profissionais/recomendados");
    return <section className={css.card}>
        <h3>Recomendados para você</h3>
        <Estado erro={erro} carregando={!dados} recarregar={recarregar} />
        {dados && !dados.questionario_respondido && <>
            <p className={css.legenda}>Responda ao questionário para receber indicações de profissionais que combinam com você.</p>
            <Link to="/questionarioinicial" className={css.botao}>Responder questionário</Link>
        </>}
        {dados?.questionario_respondido && <>
            {!dados.profissionais.length && <p className={css.legenda}>Ainda não há profissionais para recomendar.</p>}
            <ul className={css.lista}>
                {dados.profissionais.map((profissional) => <li key={profissional.id_usuario}>
                    <Link to={`/profissionais/${profissional.id_usuario}`} className={css.item}>
                        <span className={css.avatar}><UserAvatar nome={profissional.nome} src={profissional.foto_url} /></span>
                        <span className={css.info}>
                            <strong>{profissional.nome}</strong>
                            <small>{[profissional.abordagem, formatarCentavos(profissional.preco_centavos)].filter(Boolean).join(" · ")}</small>
                        </span>
                    </Link>
                </li>)}
            </ul>
            <Link to="/questionarioinicial" className={css.link}>Editar minhas preferências</Link>
        </>}
    </section>;
}

function Favoritos() {
    const { dados, setDados, erro, recarregar } = useSecao("/favoritos/");

    async function remover(id) {
        try {
            const resposta = await fetch(`${api}/favoritos/${id}`, { method: "DELETE", credentials: "include" });
            if (!resposta.ok) throw new Error("Não foi possível remover dos favoritos.");
            setDados((atual) => ({ ...atual, favoritos: atual.favoritos.filter((item) => item.id_profissional !== id) }));
        } catch (falha) {
            toast.error(falha.message);
        }
    }

    return <section className={css.card}>
        <h3>Seus favoritos</h3>
        <Estado erro={erro} carregando={!dados} recarregar={recarregar} />
        {dados && !dados.favoritos.length && <p className={css.legenda}>Toque no coração de um profissional para guardá-lo aqui.</p>}
        {dados && <ul className={css.lista}>
            {dados.favoritos.map((favorito) => <li key={favorito.id_profissional} className={css.linha}>
                <Link to={`/profissionais/${favorito.id_profissional}`} className={css.item}>
                    <span className={css.avatar}><UserAvatar nome={favorito.nome} src={favorito.foto_url} /></span>
                    <span className={css.info}>
                        <strong>{favorito.nome}</strong>
                        <small>{favorito.proximo_horario ? `Próximo horário: ${dataHora(favorito.proximo_horario.inicio)}` : "Sem horário livre em 14 dias"}</small>
                    </span>
                </Link>
                <button type="button" className={css.link} aria-label={`Remover ${favorito.nome} dos favoritos`} onClick={() => remover(favorito.id_profissional)}>Remover</button>
            </li>)}
        </ul>}
    </section>;
}

function ListaEspera() {
    const { dados, setDados, erro, recarregar } = useSecao("/lista-espera/");

    async function sair(id) {
        try {
            const resposta = await fetch(`${api}/lista-espera/${id}`, { method: "DELETE", credentials: "include" });
            if (!resposta.ok) throw new Error("Não foi possível sair da lista de espera.");
            setDados((atual) => ({ ...atual, lista_espera: atual.lista_espera.filter((item) => item.lista_espera_id !== id) }));
        } catch (falha) {
            toast.error(falha.message);
        }
    }

    return <section className={css.card}>
        <h3>Lista de espera</h3>
        <Estado erro={erro} carregando={!dados} recarregar={recarregar} />
        {dados && !dados.lista_espera.length && <p className={css.legenda}>Quando um profissional estiver sem horários, peça para ser avisado no perfil dele.</p>}
        {dados && <ul className={css.lista}>
            {dados.lista_espera.map((entrada) => <li key={entrada.lista_espera_id} className={css.linha}>
                <Link to={`/profissionais/${entrada.profissional_id}`} className={css.item}>
                    <span className={css.info}>
                        <strong>{entrada.profissional_nome}</strong>
                        <small>{entrada.avisado_em
                            ? `Abriu um horário (aviso em ${dataCurta(entrada.avisado_em)}). A vaga não fica reservada.`
                            : `Aguardando vaga até ${dataCurta(entrada.fim)}`}</small>
                    </span>
                </Link>
                <button type="button" className={css.link} aria-label={`Sair da lista de espera de ${entrada.profissional_nome}`} onClick={() => sair(entrada.lista_espera_id)}>Sair</button>
            </li>)}
        </ul>}
    </section>;
}

export default function SecoesPaciente() {
    return <div className={css.secoes}>
        <Recomendados />
        <Favoritos />
        <ListaEspera />
    </div>;
}
