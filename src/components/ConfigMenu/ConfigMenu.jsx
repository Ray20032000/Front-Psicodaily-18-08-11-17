import css from "./ConfigMenu.module.css";
import styles from "../Header/Header.module.css";
import { LogOut } from "lucide-react";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ConfigMenu() {
    const { usuario, sair: encerrarSessao } = useUsuario();
    const navigate = useNavigate();

    const rotasEdicao = {
        ADMIN: "/edicaoadm",
        PACIENTE: "/edicaopaciente",
        PROFISSIONAL: "/edicaopsicologo",
    };
    const rotaEdicao = rotasEdicao[usuario?.tipo_usuario];

    async function sair() {
        try {
            await encerrarSessao();
            navigate("/login");
        } catch {
            toast.error("Falha ao sair. Tente novamente.");
        }
    }

    return (
        <div className={css.menu}>
            {rotaEdicao && (
                <a href={rotaEdicao} className={css.botao}>Edição</a>
            )}

            <button type="button" className={css.sair} onClick={sair} title="Sair">
                <LogOut strokeWidth={1.0} aria-hidden="true" />
                <span>Sair</span>
            </button>
        </div>
    );
}