import { Navigate, Outlet } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext.jsx";

export default function ProtectedRoute({ roles }) {
    const { usuario, carregando, erro, recarregar } = useUsuario();
    const autenticado = Boolean(usuario);
    const tipoUsuario = usuario?.tipo_usuario;

    if (carregando) return <p role="status">Carregando perfil...</p>;
    if (erro) return <div role="alert">{erro} <button onClick={recarregar}>Tentar novamente</button></div>;

    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(tipoUsuario)) {
        return <Navigate to="/nao-autorizado" replace />;
    }

    return <Outlet />;
}
