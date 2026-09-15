import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../SelecionarProfissional/SelecionarProfissional.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import api from "../../config/api.js";
import { Heart, Search, Star } from "lucide-react";
import { dataHoraLocal } from "../../utils/agendamento.js";
import { normalizarProfissional, parametrosProfissionais } from "../../utils/profissionais.js";

const filtrosIniciais = { especialidade: "", preco_max: "", data: "", horario: "" };

export default function SelecionarProfissional() {

    const navigate = useNavigate();

    const [psicologos, setPsicologos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [filtros, setFiltros] = useState(filtrosIniciais);
    const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciais);
    const [erro, setErro] = useState("");

    useEffect(() => {
        buscarPsicologos();
    }, []);


    async function buscarPsicologos(novosFiltros = filtros) {
        setCarregando(true);
        setErro("");
        try {
            const parametros = parametrosProfissionais(novosFiltros);
            const resposta = await fetch(`${api}/profissionais/?${parametros}`, { credentials: "include" });
            const dados = await resposta.json();
            if (!resposta.ok) throw new Error(dados.error || "Não foi possível carregar os profissionais.");
            setPsicologos((atuais) => (dados.profissionais || []).map((profissional) => ({
                ...normalizarProfissional(profissional),
                favorito: atuais.find((item) => item.id === profissional.id_usuario)?.favorito || false
            })));
            setFiltrosAplicados({ ...novosFiltros });
        } catch (erro) {
            setErro(erro.message || "Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    }

    function limparFiltros() {
        setPesquisa("");
        setFiltros(filtrosIniciais);
        buscarPsicologos(filtrosIniciais);
    }

    function abrirPerfil(id) {
        const dataAgendamento = filtrosAplicados.data && filtrosAplicados.horario
            ? `${filtrosAplicados.data}T${filtrosAplicados.horario}`
            : "";
        navigate(`/profissionais/${id}`, { state: { dataAgendamento } });
    }


    function favoritar(e, id) {

        e.stopPropagation();

        setPsicologos((profissionaisAtuais) => profissionaisAtuais.map((psicologo) => (
            psicologo.id === id
                ? { ...psicologo, favorito: !psicologo.favorito }
                : psicologo
        )));

    }


    const psicologosFiltrados = psicologos.filter(
        (psicologo) => {

            const texto =
                `${psicologo.nome || ""} ${psicologo.especialidade || ""}`
                    .toLowerCase();


            return texto.includes(
                pesquisa.toLowerCase()
            );

        }
    );


    return (

        <div className={css.pagina}>


            <Header />



            {/* CONTEÚDO PRINCIPAL */}

            <main className={css.areaMarketplace}>


                <Sidebar />
                <div className={css.container}>


                    {/* PESQUISA */}

                    <div className={css.areaPesquisa}>

                        <div className={css.pesquisa}>

                            <input
                                type="text"
                                placeholder="Pesquisar profissional..."
                                aria-label="Pesquisar por nome ou especialidade"
                                value={pesquisa}
                                onChange={(e) =>
                                    setPesquisa(e.target.value)
                                }
                            />


                            <Search size={19} strokeWidth={1.8} aria-hidden="true" />

                        </div>

                    </div>



                    <form className={css.filtros} onSubmit={(event) => { event.preventDefault(); buscarPsicologos(); }}>
                        <label>Especialidade
                            <select value={filtros.especialidade} onChange={(event) => setFiltros({ ...filtros, especialidade: event.target.value })}>
                                <option value="">Todas</option>
                                <option value="Psicologia">Psicologia</option>
                                <option value="Psiquiatria">Psiquiatria</option>
                            </select>
                        </label>
                        <label>Valor máximo (R$)
                            <input type="number" min="0.01" step="0.01" value={filtros.preco_max} onChange={(event) => setFiltros({ ...filtros, preco_max: event.target.value })} />
                        </label>
                        <label>Data
                            <input type="date" min={dataHoraLocal().slice(0, 10)} value={filtros.data} onChange={(event) => setFiltros({ ...filtros, data: event.target.value })} />
                        </label>
                        <label>Horário
                            <input type="time" value={filtros.horario} onChange={(event) => setFiltros({ ...filtros, horario: event.target.value })} />
                        </label>
                        <button type="submit" disabled={carregando}>Aplicar filtros</button>
                        <button type="button" className={css.limpar} onClick={limparFiltros} disabled={carregando}>Limpar</button>
                    </form>
                    {erro && <div className={css.mensagem} role="alert">{erro}</div>}

                    {/* CARREGANDO */}

                    {carregando && (

                        <div className={css.mensagem}>

                            Carregando profissionais...

                        </div>

                    )}



                    {/* LISTA DE PSICÓLOGOS */}

                    {!carregando && (

                        <div className={css.gridPsicologos}>


                            {psicologosFiltrados.map(
                                (psicologo) => (

                                    <article
                                        tabIndex={0}
                                        aria-label={`Ver perfil de ${psicologo.nome}`}
                                        onKeyDown={(event) => {
                                            if (event.target === event.currentTarget && event.key === "Enter") abrirPerfil(psicologo.id);
                                        }}
                                        key={psicologo.id}
                                        className={css.card}
                                        onClick={() =>
                                            abrirPerfil(
                                                psicologo.id
                                            )
                                        }
                                    >


                                        {/* FOTO */}

                                        <div className={css.areaImagem}>


                                            <UserAvatar userId={psicologo.id} nome={psicologo?.nome} src={psicologo?.foto} className={css.imagem} fallbackClassName={css.semFoto} />



                                            {/* FAVORITO */}

                                            <button
                                                className={
                                                    psicologo.favorito
                                                        ? `${css.favorito} ${css.favoritoAtivo}`
                                                        : css.favorito
                                                }
                                                onClick={(e) =>
                                                    favoritar(
                                                        e,
                                                        psicologo.id
                                                    )
                                                }
                                                title={psicologo.favorito ? "Remover dos favoritos" : "Favoritar"}
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



                                        {/* NOME E AVALIAÇÃO */}

                                        <div className={css.nomeLinha}>


                                            <h2>

                                                {psicologo.nome}

                                            </h2>


                                            <div className={css.avaliacao}>

                                                <Star size={16} strokeWidth={1.8} aria-hidden="true" />


                                                <strong>

                                                    {psicologo.avaliacao || "0"}

                                                </strong>

                                            </div>

                                        </div>



                                        {/* ESPECIALIDADES */}

                                        <p className={css.tituloInfo}>

                                            Especialidades:

                                        </p>


                                        <p className={css.especialidade}>

                                            {psicologo.especialidade ||
                                                "Não informado"}

                                        </p>



                                        {/* DESCRIÇÃO */}

                                        <p className={css.descricao}>

                                            {psicologo.descricao ||
                                                "Conheça mais sobre este profissional acessando o perfil."}

                                        </p>



                                        {/* CRP */}

                                        {psicologo.crp && (

                                            <p className={css.crp}>

                                                Registro: {psicologo.crp}

                                            </p>

                                        )}



                                        {/* VALOR */}

                                        <div className={css.preco}>

                                            <span>

                                                Valor da sessão:

                                            </span>


                                            <strong>

                                                {Number(
                                                    psicologo.valor_sessao || 0
                                                ).toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        style: "currency",
                                                        currency: "BRL"
                                                    }
                                                )}

                                                /hora

                                            </strong>

                                        </div>

                                    </article>

                                )
                            )}

                        </div>

                    )}



                    {/* NENHUM RESULTADO */}

                    {!carregando && !erro &&
                        psicologosFiltrados.length === 0 && (

                            <div className={css.mensagem}>

                                Nenhum profissional encontrado com esses filtros.

                            </div>

                        )}

                </div>

            </main>



            {/* FOOTER */}

            <Footer />


        </div>

    );
}
