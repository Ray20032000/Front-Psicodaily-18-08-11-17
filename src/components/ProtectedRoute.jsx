import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ roles }) {
    const autenticado = Boolean(localStorage.getItem("id_usuario"));
    const tipoUsuario = localStorage.getItem("tipo_usuario");

    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(tipoUsuario)) {
        return <Navigate to="/nao-autorizado" replace />;
    }

    return <Outlet />;
}