import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Erro404 from "./pages/Erro404/Erro404.jsx";
import DashboardAdm from "./pages/DashboardAdm/DashboardAdm.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastroadmin" element={<CadastroAdmin />} />
                <Route path="/cadastropaciente" element={<CadastroPaciente />} />
                <Route path="/cadastropsicologo" element={<CadastroPsicologo />} />
                <Route element={<ProtectedRoute roles={["PACIENTE"]} />}>
                    <Route path="/dashboardpaciente" element={<DashboardPaciente />} />
                    <Route path="/diariodehumor" element={<DiarioDeHumor />} />
                    <Route path="/sessoes" element={<Sessoes />} />
                </Route>
                <Route element={<ProtectedRoute roles={["PSICOLOGO", "PSIQUIATRA"]} />}>
                    <Route path="/dashboardpsicologo" element={<DashboardPsicologo />} />
                </Route>
                <Route path="/ativarconta" element={<AtivarConta />} />
                <Route path="/esquecisenha" element={<EsqueciSenha />} />
                <Route path="/alterarsenha" element={<AlterarSenha />} />
                <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
                    <Route path="/dashboardadm" element={<DashboardAdm />} />
                </Route>

                <Route path="*" element={<Erro404 />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;