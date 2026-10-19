import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../SelecionarProfissional/SelecionarProfissional.module.css";
import Seletor from "../../components/Seletor/Seletor.jsx";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import api from "../../config/api.js";
import { Heart, Search, Star } from "lucide-react";
import { dataHoraLocal } from "../../utils/agendamento.js";
import { normalizarProfissional, parametrosProfissionais } from "../../utils/profissionais.js";

const filtrosIniciais = {
    especialidade: "",
    abordagem: "",
    preco_max: "",
    data: "",
    horario: "",
    modalidade: "",
    avaliacao_min: ""
};

function obterTexto(...valores) {
    return valores
        .filter((valor) => valor !== null && valor !== undefined)
        .map((valor) => Array.isArray(valor) ? valor.join(" ") : String(valor))
        .join(" ")
        .toLowerCase();
}

export default function SelecionarProfissional() {
    const navigate = useNavigate();

    const [psicologos, setPsicologos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [filtros, setFiltros] = useState({ ...filtrosIniciais });
    const [filtrosAplicados, setFiltrosAplicados] = useState({ ...filtrosIniciais });
    const [erro, setErro] = useState("");

    useEffect(() => {
        buscarPsicologos(filtrosIniciais);
    }, []);

    async function buscarPsicologos(novosFiltros = filtrosAplicados) {
        setCarregando(true);
        setErro("");

        try {
            const parametros = parametrosProfissionais(novosFiltros);
            const resposta = await fetch(`${api}/profissionais/?${parametros}`, {
                credentials: "include"
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.error || "Não foi possível carregar os profissionais."
                );
            }

            setPsicologos((atuais) =>
                (dados.profissionais || []).map((profissional) => ({
                    ...normalizarProfissional(profissional),
                    favorito:
                        atuais.find(
                            (item) => item.id === profissional.id_usuario
                        )?.favorito || false
                }))
            );

            setFiltrosAplicados({ ...novosFiltros });
        } catch (erroBusca) {
            setErro(
                erroBusca.message || "Não foi possível conectar ao servidor."
            );
        } finally {
            setCarregando(false);
        }
    }

    function atualizarFiltro(campo, valor) {
        setFiltros((atuais) => ({
            ...atuais,
            [campo]: valor
        }));
    }

    function limparFiltros() {
        setPesquisa("");
        setFiltros({ ...filtrosIniciais });
        buscarPsicologos({ ...filtrosIniciais });
    }

    function abrirPerfil(id) {
        const dataAgendamento =
            filtrosAplicados.data && filtrosAplicados.horario
                ? `${filtrosAplicados.data}T${filtrosAplicados.horario}`
                : "";

        navigate(`/profissionais/${id}`, {
            state: { dataAgendamento }
        });
    }

    function favoritar(evento, id) {
        evento.stopPropagation();

        setPsicologos((atuais) =>
            atuais.map((psicologo) =>
                psicologo.id === id
                    ? { ...psicologo, favorito: !psicologo.favorito }
                    : psicologo
            )
        );
    }

    // Os filtros do formulário são aplicados pela API; aqui só a pesquisa livre
    const termo = pesquisa.trim().toLowerCase();
    const psicologosFiltrados = psicologos.filter((psicologo) =>
        obterTexto(psicologo.nome, psicologo.especialidade, psicologo.abordagem, psicologo.descricao)
            .includes(termo)
    );

    // Abordagem, modalidade e avaliação só aparecem quando a API passar a enviar esses campos
    const temAbordagem = psicologos.some((psicologo) => psicologo.abordagem);
    const temModalidade = psicologos.some((psicologo) => psicologo.modalidade);
    const temAvaliacao = psicologos.some((psicologo) => psicologo.avaliacao != null);

    return (
        <div className={css.pagina}>
            <main className={css.areaMarketplace}>
                <div className={css.container}>
                    <div className={css.areaPesquisa}>
                        <div className={css.pesquisa}>
                            <input
                                type="text"
                                placeholder="Pesquisar profissional..."
                                aria-label="Pesquisar por nome, especialidade ou abordagem"
                                value={pesquisa}
                                onChange={(evento) => setPesquisa(evento.target.value)}
                            />
                            <Search size={19} strokeWidth={1.8} aria-hidden="true" />
                        </div>
                    </div>

                    <form
                        className={css.filtros}
                        onSubmit={(evento) => {
                            evento.preventDefault();
                            buscarPsicologos({ ...filtros });
                        }}
                    >
                        <label>
                            Especialidade
                            <Seletor
                                className={css.seletor}
                                value={filtros.especialidade}
                                onChange={(valor) => atualizarFiltro("especialidade", valor)}
                                opcoes={[
                                    { valor: "", rotulo: "Todas" },
                                    { valor: "Psicologia", rotulo: "Psicologia" },
                                    { valor: "Psiquiatria", rotulo: "Psiquiatria" }
                                ]}
                            />
                        </label>

                        {temAbordagem && (
                            <label>
                                Abordagem terapêutica
                                <Seletor
                                    className={css.seletor}
                                    value={filtros.abordagem}
                                    onChange={(valor) => atualizarFiltro("abordagem", valor)}
                                    opcoes={[
                                        { valor: "", rotulo: "Todas" },
                                        { valor: "TCC", rotulo: "Terapia Cognitivo-Comportamental (TCC)" },
                                        { valor: "Psicanálise", rotulo: "Psicanálise" },
                                        { valor: "Humanista", rotulo: "Humanista" },
                                        { valor: "Gestalt", rotulo: "Gestalt-terapia" },
                                        { valor: "Comportamental", rotulo: "Comportamental" }
                                    ]}
                                />
                            </label>
                        )}

                        <label>
                            Valor máximo (R$)
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Ex.: 150,00"
                                value={filtros.preco_max}
                                onChange={(evento) => atualizarFiltro("preco_max", evento.target.value)}
                            />
                        </label>

                        <label>
                            Data desejada
                            <input
                                type="date"
                                min={dataHoraLocal().slice(0, 10)}
                                value={filtros.data}
                                onChange={(evento) => atualizarFiltro("data", evento.target.value)}
                            />
                        </label>

                        <label>
                            Horário desejado
                            <input
                                type="time"
                                value={filtros.horario}
                                onChange={(evento) => atualizarFiltro("horario", evento.target.value)}
                            />
                        </label>

                        {temModalidade && (
                            <label>
                                Modalidade
                                <Seletor
                                    className={css.seletor}
                                    value={filtros.modalidade}
                                    onChange={(valor) => atualizarFiltro("modalidade", valor)}
                                    opcoes={[
                                        { valor: "", rotulo: "Todas" },
                                        { valor: "Online", rotulo: "Online" },
                                        { valor: "Presencial", rotulo: "Presencial" }
                                    ]}
                                />
                            </label>
                        )}

                        {temAvaliacao && (
                            <label>
                                Avaliação mínima
                                <Seletor
                                    className={css.seletor}
                                    value={filtros.avaliacao_min}
                                    onChange={(valor) => atualizarFiltro("avaliacao_min", valor)}
                                    opcoes={[
                                        { valor: "", rotulo: "Todas as avaliações" },
                                        { valor: "3", rotulo: "3 estrelas ou mais" },
                                        { valor: "4", rotulo: "4 estrelas ou mais" },
                                        { valor: "4.5", rotulo: "4,5 estrelas ou mais" },
                                        { valor: "5", rotulo: "5 estrelas" }
                                    ]}
                                />
                            </label>
                        )}

                        <button type="submit" disabled={carregando}>
                            Aplicar filtros
                        </button>

                        <button
                            type="button"
                            className={css.limpar}
                            onClick={limparFiltros}
                            disabled={carregando}
                        >
                            Limpar
                        </button>
                    </form>

                    {erro && (
                        <div className={css.mensagem} role="alert">
                            {erro}
                        </div>
                    )}

                    {carregando && (
                        <Carregando
                            texto="Carregando profissionais..."
                            className={css.gridPsicologos}
                        >
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <article key={item} className={css.card}>
                                    <Skeleton height="280px" radius="9px" />
                                    <div className={css.nomeLinha}>
                                        <Skeleton width="55%" height="20px" />
                                        <Skeleton width="36px" height="16px" />
                                    </div>
                                    <Skeleton width="35%" height="12px" className={css.skeletonLinha} />
                                    <Skeleton width="70%" height="12px" className={css.skeletonLinha} />
                                    <Skeleton height="12px" className={css.skeletonLinha} />
                                    <Skeleton width="80%" height="12px" className={css.skeletonLinha} />
                                    <div className={css.preco}>
                                        <Skeleton width="90px" height="12px" />
                                        <Skeleton width="100px" height="16px" />
                                    </div>
                                </article>
                            ))}
                        </Carregando>
                    )}

                    {!carregando && (
                        <div className={css.gridPsicologos}>
                            {psicologosFiltrados.map((psicologo) => (
                                <article
                                    tabIndex={0}
                                    aria-label={`Ver perfil de ${psicologo.nome}`}
                                    onKeyDown={(evento) => {
                                        if (
                                            evento.target === evento.currentTarget &&
                                            (evento.key === "Enter" || evento.key === " ")
                                        ) {
                                            evento.preventDefault();
                                            abrirPerfil(psicologo.id);
                                        }
                                    }}
                                    key={psicologo.id}
                                    className={css.card}
                                    onClick={() => abrirPerfil(psicologo.id)}
                                >
                                    <div className={css.areaImagem}>
                                        <UserAvatar
                                            nome={psicologo.nome}
                                            src={psicologo.foto_url}
                                            className={css.imagem}
                                            fallbackClassName={css.semFoto}
                                        />

                                        <button
                                            type="button"
                                            className={
                                                psicologo.favorito
                                                    ? `${css.favorito} ${css.favoritoAtivo}`
                                                    : css.favorito
                                            }
                                            onClick={(evento) => favoritar(evento, psicologo.id)}
                                            title={
                                                psicologo.favorito
                                                    ? "Remover dos favoritos"
                                                    : "Favoritar"
                                            }
                                            aria-pressed={Boolean(psicologo.favorito)}
                                        >
                                            <Heart
                                                size={19}
                                                fill={psicologo.favorito ? "currentColor" : "none"}
                                                strokeWidth={1.8}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>

                                    <div className={css.nomeLinha}>
                                        <h2>{psicologo.nome}</h2>
                                        <div className={css.avaliacao}>
                                            <Star size={16} strokeWidth={1.8} aria-hidden="true" />
                                            <strong>{psicologo.avaliacao ?? "Sem avaliações"}</strong>
                                        </div>
                                    </div>

                                    <p className={css.tituloInfo}>Especialidade:</p>
                                    <p className={css.especialidade}>
                                        {psicologo.especialidade || "Não informado"}
                                    </p>

                                    {psicologo.abordagem && (
                                        <>
                                            <p className={css.tituloInfo}>Abordagem terapêutica:</p>
                                            <p className={css.especialidade}>{psicologo.abordagem}</p>
                                        </>
                                    )}

                                    {psicologo.modalidade && (
                                        <>
                                            <p className={css.tituloInfo}>Modalidade:</p>
                                            <p className={css.especialidade}>{psicologo.modalidade}</p>
                                        </>
                                    )}

                                    <p className={css.descricao}>
                                        {psicologo.descricao ||
                                            "Conheça mais sobre este profissional acessando o perfil."}
                                    </p>

                                    {psicologo.crp && (
                                        <p className={css.crp}>
                                            Registro: {psicologo.crp}
                                        </p>
                                    )}

                                    <div className={css.preco}>
                                        <span>Valor da sessão:</span>
                                        <strong>
                                            {Number(psicologo.valor_sessao || 0).toLocaleString(
                                                "pt-BR",
                                                {
                                                    style: "currency",
                                                    currency: "BRL"
                                                }
                                            )}
                                        </strong>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {!carregando && !erro && psicologosFiltrados.length === 0 && (
                        <div className={css.mensagem}>
                            Nenhum profissional encontrado com esses filtros.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
