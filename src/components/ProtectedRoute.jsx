import { Navigate, Outlet } from "react-router-dom";
import { useUsuario } from "../contexts/UsuarioContext.jsx";
import Skeleton, { Carregando } from "./Skeleton/Skeleton.jsx";

export default function ProtectedRoute({ roles }) {
    const { usuario, carregando, erro, recarregar } = useUsuario();
    const autenticado = Boolean(usuario);
    const tipoUsuario = usuario?.tipo_usuario;

    // Esqueleto do shell (menu lateral + cabeçalho + conteúdo) enquanto o perfil carrega
    if (carregando) return (
        <Carregando texto="Carregando perfil..." className="d-flex vh-100">
            <div className="d-none d-lg-flex flex-column gap-3 p-3 bg-white" style={{ width: "16rem" }}>
                <Skeleton width="140px" height="28px" />
                {[1, 2, 3, 4].map((item) => <Skeleton key={item} height="36px" radius="8px" />)}
            </div>
            <div className="flex-grow-1 d-flex flex-column gap-3 p-4">
                <div className="d-flex justify-content-end gap-2">
                    <Skeleton width="44px" height="44px" radius="10px" />
                    <Skeleton width="220px" height="44px" radius="10px" />
                </div>
                <Skeleton height="35%" radius="16px" />
                <Skeleton height="45%" radius="16px" />
            </div>
        </Carregando>
    );
    if (erro) return <div role="alert">{erro} <button onClick={recarregar}>Tentar novamente</button></div>;

    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(tipoUsuario)) {
        return <Navigate to="/nao-autorizado" replace />;
    }

    return <Outlet />;
}
