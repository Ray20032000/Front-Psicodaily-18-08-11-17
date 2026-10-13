import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, CircleHelp, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import psicodaily from "../../assets/psicodaily.svg";
import styles from "./Sidebar.module.css";

const iconProps = { size: 18, strokeWidth: 1.5, "aria-hidden": true };

const dashboard = { to: "/app", end: true, label: "Dashboard", icon: LayoutDashboard };
const itensProfissional = [
    dashboard,
    { to: "/agendaprofissional", aliases: ["/prontuario"], label: "Agenda", icon: CalendarDays },
];

const itensPorTipo = {
    PACIENTE: [
        dashboard,
        { to: "/diario", aliases: ["/diariodehumor"], label: "Diário", icon: BookOpen },
        { to: "/sessoes", label: "Sessões", icon: CalendarDays },
        { to: "/profissionais", aliases: ["/marketplace", "/selecionarprofissional", "/descricaopsicologo", "/agendamento", "/pagamento"], label: "Profissionais", icon: UsersRound },
    ],
    PSICOLOGO: itensProfissional,
    PSIQUIATRA: itensProfissional,
    ADMIN: [dashboard],
};

function Sidebar() {
    const navigate = useNavigate();
    const { usuario, sair: encerrarSessao } = useUsuario();
    const { pathname } = useLocation();
    const itens = itensPorTipo[usuario?.tipo_usuario] ?? [dashboard];

    async function sair() {
        try {
            await encerrarSessao();
            navigate("/login");
        } catch {
            toast.error("Falha ao sair. Tente novamente.");
        }
    }

    const classeItem = (ativo) => `${styles.navLink} d-flex align-items-center gap-3 fw-medium ${ativo ? styles.active : ""}`;

    return (
        <aside
            id="sidebar"
            tabIndex="-1"
            aria-label="Menu principal"
            className={`offcanvas-lg offcanvas-start geist ${styles.sidebar}`}
        >
            <div className="d-flex align-items-center justify-content-between px-2 py-3 mb-2">
                <img className="logo" src={psicodaily} data-logo alt="Psicodaily" style={{ width: "7em" }} />
                <span className="text-secondary d-none d-lg-inline">v0.1</span>
                <button
                    type="button"
                    className="btn-close d-lg-none"
                    data-bs-dismiss="offcanvas"
                    data-bs-target="#sidebar"
                    aria-label="Fechar menu"
                />
            </div>

            {/* dismiss no div, não no <a>: o Bootstrap dá preventDefault em âncoras e quebraria o NavLink */}
            <nav className="d-flex flex-column gap-1" data-bs-dismiss="offcanvas" data-bs-target="#sidebar">
                {itens.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => classeItem(isActive || item.aliases?.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`)))}
                    >
                        <item.icon {...iconProps} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="d-flex flex-column gap-1 mt-auto pt-3">
                <div data-bs-dismiss="offcanvas" data-bs-target="#sidebar">
                    <NavLink to="/suporte" className={({ isActive }) => classeItem(isActive)}>
                        <CircleHelp {...iconProps} />
                        Suporte
                    </NavLink>
                </div>
                <button type="button" className={`${classeItem(false)} ${styles.sair} border-0 bg-transparent w-100 text-start`} onClick={sair}>
                    <LogOut {...iconProps} />
                    Sair
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
