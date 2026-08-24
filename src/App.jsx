import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./assets/pages/Home/Home.jsx";
import Login from "./assets/pages/Login/Login.jsx";
import CadastroAdmin from "./assets/pages/CadastroAdmin/CadastroAdmin.jsx";
import CadastroPaciente from "./assets/pages/CadastroPaciente/CadastroPaciente.jsx";
import CadastroPsicologo from "./assets/pages/CadastroPsicologo/CadastroPsicologo.jsx";
import DashboardPsicologo from "./assets/pages/DashboardPsicologo/DashboardPsicologo.jsx";
import DashboardPaciente from "./assets/pages/DashboardPaciente/DashboardPaciente.jsx";
import AtivarConta from "./assets/pages/AtivarConta/AtivarConta.jsx";
import EsqueciSenha from "./assets/pages/EsqueciSenha/EsqueciSenha.jsx";
import AlterarSenha from "./assets/pages/AlterarSenha/AlterarSenha.jsx";
import DiarioDeHumor from "./assets/pages/DiarioDeHumor/DiarioDeHumor.jsx";
import Sessoes from "./assets/pages/Sessoes/Sessoes.jsx";
import Erro404 from "./assets/pages/Erro404/Erro404.jsx";
import DashboardAdm from "./assets/pages/DashboardAdm/DashboardAdm.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastroadmin" element={<CadastroAdmin />} />
                <Route path="/cadastropaciente" element={<CadastroPaciente />} />
                <Route path="/cadastropsicologo" element={<CadastroPsicologo />} />
                <Route path="/dashboardpaciente" element={<DashboardPaciente />} />
                <Route path="/dashboardpsicologo" element={<DashboardPsicologo />} />
                <Route path="/ativarconta" element={<AtivarConta />} />
                <Route path="/esquecisenha" element={<EsqueciSenha />} />
                <Route path="/alterarsenha" element={<AlterarSenha />} />
                <Route path="/diariodehumor" element={<DiarioDeHumor />} />
                <Route path="/sessoes" element={<Sessoes />} />
                <Route path="/dashboardadm" element={<DashboardAdm />} />

                <Route path="*" element={<Erro404 />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;