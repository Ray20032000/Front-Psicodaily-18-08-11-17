import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUsuario } from "./contexts/UsuarioContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import CadastroAdmin from "./pages/CadastroAdmin/CadastroAdmin.jsx";
import CadastroPaciente from "./pages/CadastroPaciente/CadastroPaciente.jsx";
import CadastroPsicologo from "./pages/CadastroPsicologo/CadastroPsicologo.jsx";
import DashboardPsicologo from "./pages/DashboardPsicologo/DashboardPsicologo.jsx";
import DashboardPaciente from "./pages/DashboardPaciente/DashboardPaciente.jsx";
import AtivarConta from "./pages/AtivarConta/AtivarConta.jsx";
import EsqueciSenha from "./pages/EsqueciSenha/EsqueciSenha.jsx";
import AlterarSenha from "./pages/AlterarSenha/AlterarSenha.jsx";
import DiarioDeHumor from "./pages/DiarioDeHumor/DiarioDeHumor.jsx";
import Sessoes from "./pages/Sessoes/Sessoes.jsx";
import Marketplace from "./pages/Marketplace/Marketplace.jsx";
import Erro404 from "./pages/Erro404/Erro404.jsx";
import DashboardAdm from "./pages/DashboardAdm/DashboardAdm.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EdicaoPaciente from "./pages/EdicaoPaciente/EdicaoPaciente.jsx";
import EdicaoAdm from "./pages/EdicaoAdm/EdicaoAdm.jsx";
import AgendaProfissional from "./pages/AgendaProfissional/AgendaProfissional";
import Prontuario from "./pages/Prontuario/Prontuario.jsx";
import SelecionarProfissional from "./pages/SelecionarProfissional/SelecionarProfissional.jsx"
import DescricaoPsicologo from "./pages/DescricaoPsicologo/DescricaoPsicologo.jsx";
import Pagamento from "./pages/Pagamento/Pagamento.jsx";
import TesteVideo from "./pages/TesteVideo/TesteVideo.jsx";

const dashboards = {
    PACIENTE: DashboardPaciente,
    PSICOLOGO: DashboardPsicologo,
    PSIQUIATRA: DashboardPsicologo,
    ADMIN: DashboardAdm,
};

// /app renderiza a dashboard do papel do usuário (ProtectedRoute já garante o login)
function Dashboard() {
    const { usuario } = useUsuario();
    const Pagina = dashboards[usuario.tipo_usuario];
    return Pagina ? <Pagina /> : <Navigate to="/login" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastroadmin" element={<CadastroAdmin />} />
                <Route path="/cadastropaciente" element={<CadastroPaciente />} />
                <Route path="/cadastropsicologo" element={<CadastroPsicologo />} />
                <Route path="/ativarconta" element={<AtivarConta />} />
                <Route path="/esquecisenha" element={<EsqueciSenha />} />
                <Route path="/alterarsenha" element={<AlterarSenha />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/app" element={<Dashboard />} />
                        <Route path="/perfil" element={<EdicaoPaciente />} />
                        <Route path="/edicaopaciente" element={<EdicaoPaciente />} />
                        <Route path="/edicaoadm" element={<EdicaoAdm />} />
                        <Route path="/videochamada/:sessaoId" element={<TesteVideo />} />
                        <Route path="/chamada/:id" element={<TesteVideo />} />

                        <Route element={<ProtectedRoute roles={["PACIENTE"]} />}>
                            <Route path="/diario" element={<DiarioDeHumor />} />
                            <Route path="/diariodehumor" element={<DiarioDeHumor />} />
                            <Route path="/sessoes" element={<Sessoes />} />
                            <Route path="/marketplace" element={<SelecionarProfissional />} />
                            <Route path="/profissionais" element={<SelecionarProfissional />} />
                            <Route path="/selecionarprofissional" element={<SelecionarProfissional />} />
                            <Route path="/profissionais/:idPsicologo" element={<DescricaoPsicologo />} />
                            <Route path="/descricaopsicologo/:idPsicologo" element={<DescricaoPsicologo />} />
                            <Route path="/agendamento/:idPsicologo" element={<DescricaoPsicologo />} />
                            <Route path="/pagamento/:idCobranca" element={<Pagamento />} />
                        </Route>

                        <Route element={<ProtectedRoute roles={["PSICOLOGO", "PSIQUIATRA"]} />}>
                            <Route path="/agendaprofissional" element={<AgendaProfissional />} />
                            <Route path="/prontuario" element={<Prontuario />} />
                            <Route path="/prontuario/:idPaciente" element={<Prontuario />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<Erro404 />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
