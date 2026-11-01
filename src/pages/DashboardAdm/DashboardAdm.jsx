import api from "../../config/api.js";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import css from "./DashboardAdm.module.css";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { Tabs } from "radix-ui";
import { Plus, Search } from "lucide-react";
import { AuditoriaAdmin, FinanceiroAdmin, MetricasAdmin } from "../../components/PainelAdmin/PainelAdmin.jsx";

const abas = [
    { valor: "usuarios", rotulo: "Usuários" },
    { valor: "metricas", rotulo: "Métricas" },
    { valor: "financeiro", rotulo: "Reembolsos e repasses" },
    { valor: "auditoria", rotulo: "Auditoria" },
];

export default function DashboardAdm() {
    const [aba, setAba] = useState("usuarios");
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
        <div className={css.pagina}>
            <main className={css.main}>
                <Tabs.Root value={aba} onValueChange={setAba}>
                <div className={css.menu}>
                    <Link to="/cadastroadmin" className={css.botaoMenu}>
                        Cadastrar
                        <span>ADM</span>
                    </Link>

                    <Tabs.List className={css.abas} aria-label="Seções do painel">
                        {abas.map(({ valor, rotulo }) => (
                            <Tabs.Trigger key={valor} value={valor} className={`${css.botaoMenu} ${aba === valor ? css.ativo : ""}`}>
                                {rotulo}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>
                </div>

                <Tabs.Content value="metricas"><MetricasAdmin /></Tabs.Content>
                <Tabs.Content value="financeiro"><FinanceiroAdmin /></Tabs.Content>
                <Tabs.Content value="auditoria"><AuditoriaAdmin /></Tabs.Content>

                <Tabs.Content value="usuarios">
                {carregando && <Carregando texto="Carregando usuários..." />}
                {erro && <p role="alert">{erro}</p>}
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
                                {carregando && [1, 2, 3, 4, 5].map((linha) => (
                                    <tr key={linha} aria-hidden="true">
                                        <td><Skeleton width="24px" height="14px" /></td>
                                        <td>
                                            <div className={css.nomeUsuario}>
                                                <Skeleton width="32px" height="32px" radius="50%" />
                                                <Skeleton width="120px" height="14px" />
                                            </div>
                                        </td>
                                        <td><Skeleton width="160px" height="14px" /></td>
                                        <td><Skeleton width="70px" height="14px" /></td>
                                        <td>
                                            <div className={css.acoesUsuario}>
                                                <Skeleton width="56px" height="28px" />
                                                <Skeleton width="72px" height="28px" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.id}</td>

                                        <td>
                                            <div className={css.nomeUsuario}>
                                                <UserAvatar src={usuario.foto_url} nome={usuario.nome} className={css.avatar} />
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
                </Tabs.Content>
                </Tabs.Root>
            </main>
        </div>
    );
}