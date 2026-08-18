import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./assets/pages/Home.jsx";
import Login from "./assets/pages/Login.jsx";
import Cadastroadmin from "./assets/pages/Cadastroadmin.jsx";
import Cadastropaciente from "./assets/pages/Cadastropaciente.jsx";
import Cadastropsicologo from "./assets/pages/Cadastropsicologo.jsx";
import Dashboardpsicologo from "./assets/pages/Dashboardpsicologo.jsx";
import Dashboardpaciente  from "./assets/pages/Dashboardpaciente.jsx";
import AtivarConta from "./assets/pages/AtivarConta";
import Esquecisenha from "./assets/pages/Esquecisenha.jsx";
import Alterarsenha from "./assets/pages/Alterarsenha.jsx";
import Diariodehumor from "./assets/pages/Diariodehumor.jsx";
import Sessoes from "./assets/pages/Sessoes.jsx"
import Erro404 from "./assets/pages/Erro404.jsx";
import Dashboardadm from "./assets/pages/Dashboardadm.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Cadastroadmin" element={<Cadastroadmin />} />
                <Route path="/Cadastropaciente" element={<Cadastropaciente />} />
                <Route path="/Cadastropsicologo" element={<Cadastropsicologo />} />
                <Route path="/Dashboardpaciente" element={<Dashboardpaciente />} />
                <Route path="/Dashboardpsicologo" element={<Dashboardpsicologo />} />
                <Route path="/AtivarConta" element={<AtivarConta />} />
                <Route path="/Esquecisenha" element={<Esquecisenha />} />
                <Route path="/Alterarsenha" element={<Alterarsenha />} />
                <Route path="/Diariodehumor" element={<Diariodehumor />} />
                <Route path="/Sessoes" element={<Sessoes />} />
                <Route path="/*" element={<Erro404 />} />
                <Route path="/Dashboardadm" element={<Dashboardadm />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;