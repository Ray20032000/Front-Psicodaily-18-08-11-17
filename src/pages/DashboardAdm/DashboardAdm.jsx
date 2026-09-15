import api from "../../config/api.js";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import css from "./DashboardAdm.module.css";
import { Plus, Search } from "lucide-react";

export default function DashboardAdm() {
    const [pesquisa, setPesquisa] = useState("");

    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    useEffect(() => {
        const controller = new AbortController();
        async function carregarUsuarios() {
            try {
                const resposta = await fetch(`${api}/usuarios/`, { credentials: "include", signal: controller.signal });
                const dados = await resposta.json();
                if (!resposta.ok) throw new Error(dados.error || "Erro ao carregar os usu\u00e1rios.");
                const tipos = { ADMIN: "Admin", PACIENTE: "Paciente", PSICOLOGO: "Psic\u00f3logo", PSIQUIATRA: "Psiquiatra" };
                setUsuarios((dados.usuarios || []).map((usuario) => ({ ...usuario, id: usuario.id_usuario, tipo: tipos[usuario.tipo] || usuario.tipo })));
            } catch (erro) {
                if (!controller.signal.aborted) setErro(erro.message);
            } finally {
                if (!controller.signal.aborted) setCarregando(false);
            }
        }
        carregarUsuarios();
        return () => controller.abort();
    }, []);

    const usuariosFiltrados = usuarios.filter((usuario) =>
        usuario.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        usuario.email.toLowerCase().includes(pesquisa.toLowerCase())
    );

    return (
        <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>
            <Header />

            <main className={css.main}>
                {carregando && <p role="status">Carregando usuários...</p>}
                {erro && <p role="alert">{erro}</p>}
                <div className={css.menu}>
                    <Link to="/cadastroadmin" className={css.botaoMenu}>
                        Cadastrar
                        <span>ADM</span>
                    </Link>

                    <Link
                        to="/dashboardadm"
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

                                <Search size={18} strokeWidth={1.8} aria-hidden="true" />
                            </div>

                            <div className={css.botoes}>
                                <Link
                                    to="/cadastropsicologo"
                                    className={css.botaoAdicionar}
                                >
                                    <Plus size={16} strokeWidth={1.8} aria-hidden="true" /> Add Profissional
                                </Link>

                                <Link
                                    to="/cadastroadmin"
                                    className={css.botaoAdicionar}
                                >
                                    <Plus size={16} strokeWidth={1.8} aria-hidden="true" /> Add ADM
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
                                                <UserAvatar userId={usuario.id_usuario} nome={usuario.nome} className={css.avatar} />
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