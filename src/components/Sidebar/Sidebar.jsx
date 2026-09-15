import { toast } from "sonner";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import styles from "./Sidebar.module.css";
import api from "../../config/api.js";
import { BookOpen, CalendarDays, CircleHelp, LayoutDashboard, LogOut, Menu, UsersRound, X } from "lucide-react";

const itens = [
    { to: "/dashboardpaciente", label: "Dashboard", icon: LayoutDashboard },
    { to: "/diario", aliases: ["/diariodehumor"], label: "Diário", icon: BookOpen },
    { to: "/sessoes", label: "Sessões", icon: CalendarDays },
    { to: "/profissionais", aliases: ["/marketplace", "/selecionarprofissional", "/descricaopsicologo", "/agendamento", "/pagamento"], label: "Profissionais", icon: UsersRound },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const { sair: encerrarSessao } = useUsuario();
    const { pathname } = useLocation();
    const [aberta, setAberta] = useState(false);
    const botaoMenu = useRef(null);

    useEffect(() => {
        if (!aberta) return;
        function fecharComEscape(event) {
            if (event.key === "Escape") {
                setAberta(false);
                botaoMenu.current?.focus();
            }
        }
        window.addEventListener("keydown", fecharComEscape);
        return () => window.removeEventListener("keydown", fecharComEscape);
    }, [aberta]);

    async function sair() {
        try {
            await encerrarSessao();
            navigate("/login");
        } catch {
            toast.error("Falha ao sair. Tente novamente.");
        }
    }

    return (
        <>
            <button
                type="button"
                ref={botaoMenu}
                className={styles.abrir}
                onClick={() => setAberta(true)}
                aria-label="Abrir menu"
                aria-expanded={aberta}
                aria-controls="menu-principal"
            >
                <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
            {aberta && <button className={styles.fundo} onClick={() => setAberta(false)} aria-label="Fechar menu"><X size={20} strokeWidth={1.8} aria-hidden="true" /></button>}
            <aside id="menu-principal" className={`${styles.sidebar} ${aberta ? styles.aberta : ""}`}>
                <nav className={styles.menu} aria-label="Navegação principal">
                    {itens.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setAberta(false)}
                            className={({ isActive }) => `${styles.item} ${isActive || item.aliases?.some((alias) => pathname === alias || pathname.startsWith(`${alias}/`)) ? styles.ativo : ""}`}
                        >
                            <item.icon className={styles.icone} size={19} strokeWidth={1.8} aria-hidden="true" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className={styles.rodape}>
                    <NavLink to="/suporte" className={styles.item} onClick={() => setAberta(false)}>
                        <CircleHelp className={styles.icone} size={19} strokeWidth={1.8} aria-hidden="true" />
                        <span>Suporte</span>
                    </NavLink>
                    <button type="button" className={`${styles.item} ${styles.sair}`} onClick={sair}>
                        <LogOut className={styles.icone} size={19} strokeWidth={1.8} aria-hidden="true" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
