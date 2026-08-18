import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import css from "./../styles/Dashboardadm.module.css";

export default function Dashboardadm() {
    const [pesquisa, setPesquisa] = useState("");

    const usuarios = [
        {
            id: "001",
            nome: "Maria Eduarda Muniz",
            email: "MariaEduardams@gmail.com",
            tipo: "Admin"
        },
        {
            id: "002",
            nome: "Rayssa Andrade da Silva",
            email: "rayssa.silva@gmail.com",
            tipo: "Psicólogo"
        },
        {
            id: "003",
            nome: "Paulo Henrique Souza",
            email: "paulohs@gmail.com",
            tipo: "Psicólogo"
        },
        {
            id: "004",
            nome: "Igor Cacerez",
            email: "igooor@gmail.com",
            tipo: "Paciente"
        },
        {
            id: "005",
            nome: "Lais Ribeiro Sinatra",
            email: "lais@gmail.com",
            tipo: "Paciente"
        },
        {
            id: "006",
            nome: "Bianca Andrade",
            email: "bibia@gmail.com",
            tipo: "Psiquiatra"
        }
    ];

    const usuariosFiltrados = usuarios.filter((usuario) =>
        usuario.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        usuario.email.toLowerCase().includes(pesquisa.toLowerCase())
    );

    return (
        <div className={css.pagina}>
            <Header />

            <main className={css.main}>
                <div className={css.menu}>
                    <Link to="/cadastroadmin" className={css.botaoMenu}>
                        Cadastrar
                        <span>ADM</span>
                    </Link>

                    <Link
                        to="/Dashboardadm"
                        className={`${css.botaoMenu} ${css.ativo}`}
                    >
                        Usuários
                    </Link>
                </div>

                <section className={css.card}>
                    <div className={css.titulo}>
                        <h1>Usuários</h1>
                        <p>Gerencie os usuários cadastrados no sistema</p>
                    </div>

                    <div className={css.conteudo}>
                        <div className={css.acoes}>
                            <div className={css.pesquisa}>
                                <input
                                    type="text"
                                    placeholder=""
                                    value={pesquisa}
                                    onChange={(e) => setPesquisa(e.target.value)}
                                />

                                <span>⌕</span>
                            </div>

                            <div className={css.botoes}>
                                <Link
                                    to="/cadastropsicologo"
                                    className={css.botaoAdicionar}
                                >
                                    + Add Profissional
                                </Link>

                                <Link
                                    to="/cadastroadmin"
                                    className={css.botaoAdicionar}
                                >
                                    + Add ADM
                                </Link>

                                <Link
                                    to="/cadastropaciente"
                                    className={css.botaoAdicionar}
                                >
                                    + Add Paciente
                                </Link>
                            </div>
                        </div>

                        <div className={css.tabelaContainer}>
                            <table className={css.tabela}>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Ações</th>
                                </tr>
                                </thead>

                                <tbody>
                                {usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.id}</td>

                                        <td>
                                            <div className={css.nomeUsuario}>
                                                <span className={css.avatar}></span>
                                                {usuario.nome}
                                            </div>
                                        </td>

                                        <td>{usuario.email}</td>

                                        <td>{usuario.tipo}</td>

                                        <td>
                                            <div className={css.acoesUsuario}>
                                                <Link
                                                    to={`/editar-usuario/${usuario.id}`}
                                                    className={css.editar}
                                                >
                                                    Editar
                                                </Link>

                                                <button className={css.desativar}>
                                                    Desativar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}