import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "../SelecionarProfissional/SelecionarProfissional.module.css";
import Footer from "../../components/Footer/Footer.jsx";
import Menu from "../../components/Menu/Menu.jsx";

export default function selecionarProfissional({ api }) {

    const navigate = useNavigate();

    const [psicologos, setPsicologos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);

    const [menuAberto, setMenuAberto] = useState(false);
    useEffect(() => {
        buscarPsicologos();
    }, []);


    async function buscarPsicologos() {

        try {

            setCarregando(true);

            const resposta = await fetch(
                `${api}/psicologos`,
                {
                    credentials: "include"
                }
            );


            if (!resposta.ok) {

                console.log("Erro ao buscar psicólogos");

                return;
            }


            const dados = await resposta.json();

            setPsicologos(dados);

        } catch (erro) {

            console.log(
                "Erro ao buscar psicólogos:",
                erro
            );

        } finally {

            setCarregando(false);

        }

    }


    function abrirPerfil(id) {

        navigate(`/PerfilPsicologo/${id}`);

    }


    async function favoritar(e, id) {

        e.stopPropagation();


        try {

            const resposta = await fetch(
                `${api}/favoritar_psicologo/${id}`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );


            if (resposta.ok) {

                setPsicologos(

                    psicologos.map((psicologo) => {

                        if (psicologo.id === id) {

                            return {
                                ...psicologo,
                                favorito: !psicologo.favorito
                            };

                        }

                        return psicologo;

                    })

                );

            }

        } catch (erro) {

            console.log(
                "Erro ao favoritar psicólogo:",
                erro
            );

        }

    }


    function sair() {

        localStorage.clear();

        navigate("/login");

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


            {/* HEADER */}

            <header className={css.header}>

                <img
                    src="/logo.png"
                    alt="PSICOdaily"
                    className={css.logo}
                />


                <div className={css.usuarioTopo}>

                    <Link
                        to="/perfilpaciente"
                        className={css.perfilTopo}
                    >

                        <div className={css.avatarTopo}>

                            <div className={css.cabeca}></div>

                            <div className={css.corpo}></div>

                        </div>

                    </Link>


                    <button
                        className={css.botaoSair}
                        onClick={sair}
                        title="Sair"
                    >
                        ↪
                    </button>

                </div>

            </header>



            {/* CONTEÚDO PRINCIPAL */}

            <main className={css.areaMarketplace}>


                {/* BOTÃO MENU */}

                <button
                    className={css.menu}
                    onClick={() => setMenuAberto(!menuAberto)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {menuAberto && (
                    <div className={css.menuAberto}>
                        <Menu />
                    </div>
                )}




                <div className={css.container}>


                    {/* PESQUISA */}

                    <div className={css.areaPesquisa}>

                        <div className={css.pesquisa}>

                            <input
                                type="text"
                                placeholder="Pesquisar psicólogo..."
                                value={pesquisa}
                                onChange={(e) =>
                                    setPesquisa(e.target.value)
                                }
                            />


                            <span>
                                ⌕
                            </span>

                        </div>

                    </div>



                    {/* CARREGANDO */}

                    {carregando && (

                        <div className={css.mensagem}>

                            Carregando psicólogos...

                        </div>

                    )}



                    {/* LISTA DE PSICÓLOGOS */}

                    {!carregando && (

                        <div className={css.gridPsicologos}>


                            {psicologosFiltrados.map(
                                (psicologo) => (

                                    <article
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


                                            {psicologo.foto ? (

                                                <img
                                                    src={psicologo.foto}
                                                    alt={psicologo.nome}
                                                    className={css.imagem}
                                                />

                                            ) : (

                                                <div
                                                    className={css.semFoto}
                                                >

                                                    {psicologo.nome
                                                        ?.charAt(0)
                                                        .toUpperCase()}

                                                </div>

                                            )}



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
                                                title="Favoritar"
                                            >

                                                {psicologo.favorito
                                                    ? "♥"
                                                    : "♡"}

                                            </button>

                                        </div>



                                        {/* NOME E AVALIAÇÃO */}

                                        <div className={css.nomeLinha}>


                                            <h2>

                                                {psicologo.nome}

                                            </h2>


                                            <div className={css.avaliacao}>

                                                <span>
                                                    ☆
                                                </span>


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

                                                CRP: {psicologo.crp}

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

                    {!carregando &&
                        psicologosFiltrados.length === 0 && (

                            <div className={css.mensagem}>

                                Nenhum psicólogo encontrado.

                            </div>

                        )}

                </div>

            </main>



            {/* FOOTER */}

            <Footer />


        </div>

    );
}