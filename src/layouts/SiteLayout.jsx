import { Fragment, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { DropdownMenu } from "radix-ui";
import { ChevronDown, Menu } from "lucide-react";
import { useUsuario } from "../contexts/UsuarioContext.jsx";
import psicodaily from "../assets/psicodaily.svg";
import styles from "./SiteLayout.module.css";

const grupos = [
    {
        titulo: "Plataforma",
        links: [
            ["/#pacientes", "Para pacientes", "Diário de humor, sessões e agendamento"],
            ["/#profissionais", "Para profissionais", "Agenda e prontuário dos pacientes"],
            ["/#demonstracao", "Demonstração", "As telas do Psicodaily"],
        ],
    },
    {
        titulo: "Sobre",
        links: [
            ["/quemsomos", "Quem somos", "O Psicodaily e o Grupo Verk"],
            ["/contato", "Contato", "Fale com a equipe"],
        ],
    },
];

function Itens({ links }) {
    return links.map(([to, titulo, descricao]) => (
        <DropdownMenu.Item key={to} asChild className={styles.item}>
            <Link to={to}>
                <span className={styles.itemTitulo}>{titulo}</span>
                <span className={styles.itemDescricao}>{descricao}</span>
            </Link>
        </DropdownMenu.Item>
    ));
}

function Dropdown({ gatilho, rotulo, className = "", children }) {
    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger className={`${styles.gatilho} ${className}`} aria-label={rotulo}>
                {gatilho}
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content align="start" sideOffset={10} className={styles.menu}>
                    {children}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

// Shell das páginas públicas (home e institucionais): header com dropdowns + rodapé
function SiteLayout() {
    const { usuario, carregando } = useUsuario();
    const { pathname, hash, key } = useLocation();

    // Links "/#secao" vindos de outra página ou do dropdown: rola até a seção; troca de página: volta ao topo
    useEffect(() => {
        const alvo = hash && document.getElementById(hash.slice(1));
        if (alvo) alvo.scrollIntoView();
        else window.scrollTo(0, 0);
    }, [pathname, hash, key]);

    return (
        <div className={styles.site}>
            <a href="#conteudo" className={styles.pular}>Pular para o conteúdo</a>

            <header className={styles.header}>
                <nav className={`${styles.nav} container`} aria-label="Principal">
                    <Link to="/" aria-label="PSICOdaily, início">
                        <img className={styles.logo} src={psicodaily} data-logo alt="" />
                    </Link>

                    <div className={styles.navGrupos}>
                        {grupos.map(({ titulo, links }) => (
                            <Dropdown key={titulo} gatilho={<>{titulo} <ChevronDown size={14} aria-hidden="true" /></>}>
                                <Itens links={links} />
                            </Dropdown>
                        ))}
                    </div>

                    {!carregando && (
                        <div className={styles.navAcoes}>
                            {!usuario && <Link to="/cadastropaciente" className={styles.linkDiscreto}>Criar conta</Link>}
                            <Link to={usuario ? "/app" : "/login"} className={styles.botaoPequeno}>
                                {usuario ? "Ir para o painel" : "Entrar"}
                            </Link>
                        </div>
                    )}

                    <Dropdown rotulo="Abrir menu" className={styles.gatilhoMobile} gatilho={<Menu size={20} aria-hidden="true" />}>
                        {grupos.map(({ titulo, links }, i) => (
                            <Fragment key={titulo}>
                                {i > 0 && <DropdownMenu.Separator className={styles.separador} />}
                                <DropdownMenu.Label className={styles.rotuloMenu}>{titulo}</DropdownMenu.Label>
                                <Itens links={links} />
                            </Fragment>
                        ))}
                    </Dropdown>
                </nav>
            </header>

            <main id="conteudo">
                <Outlet />
            </main>

            <footer className={styles.rodape}>
                <div className={`${styles.rodapeConteudo} container`}>
                    <div>
                        <img className={styles.logo} src={psicodaily} data-logo alt="PSICOdaily" />
                        <p>Plataforma de acompanhamento psicológico que conecta pacientes e profissionais.</p>
                    </div>
                    <nav className={styles.rodapeLinks} aria-label="Institucional">
                        <Link to="/quemsomos">Quem somos</Link>
                        <Link to="/contato">Contato</Link>
                        <span>©2026 PSICOdaily</span>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

export default SiteLayout;
