import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Alerts from "../../components/Alerts/Alerts.jsx";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import css from "./AlterarSenha.module.css";
import api from "../../config/api.js";

export default function AlterarSenha() {
    const { usuario, carregando } = useUsuario();
    const [email, setEmail] = useState(() => localStorage.getItem("recuperacao_email") || "");
    const [codigo, setCodigo] = useState("");
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mensagem, setMensagem] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!mensagem) return;
        const timer = setTimeout(() => setMensagem(null), 10000);
        return () => clearTimeout(timer);
    }, [mensagem]);

    async function alterarSenha(evento) {
        evento.preventDefault();
        if ((!usuario && (!email || codigo.length !== 6)) || (usuario && !senhaAtual) || !novaSenha || !confirmarSenha) {
            setMensagem({ id: Date.now(), texto: "Preencha todos os campos", tipo: "erro" });
            return;
        }
        if (novaSenha !== confirmarSenha) {
            setMensagem({ id: Date.now(), texto: "As senhas não são iguais", tipo: "erro" });
            return;
        }
        try {
            const resposta = await fetch(`${api}/auth/${usuario ? "alterar_senha_logado" : "alterar_senha"}`, {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ ...(usuario ? { senha_atual: senhaAtual } : { email, codigo }), senha: novaSenha, nova_senha: novaSenha })
            });
            const retorno = await resposta.json();
            setMensagem({ id: Date.now(), texto: resposta.ok ? retorno.message : retorno.error, tipo: resposta.ok ? "sucesso" : "erro" });
            if (resposta.ok) {
                if (!usuario) localStorage.removeItem("recuperacao_email");
                setTimeout(() => navigate(usuario ? -1 : "/login"), 1000);
            }
        } catch {
            setMensagem({ id: Date.now(), texto: "Erro ao alterar a senha", tipo: "erro" });
        }
    }

    if (carregando) return <p role="status">Carregando...</p>;

    return <div className={`${css.pagina} min-vh-100 d-flex flex-column`}>
        <Header />
        <main className={css.fundo}>
            {mensagem && <Alerts key={mensagem.id} tipo={mensagem.tipo} descricao={mensagem.texto} />}
            <div className={css.card}><div className={css.bordaInterna}>
                <img src="/logo.png" alt="PSICOdaily" className={css.logo} />
                <div className={css.linha} />
                <h1 className={css.titulo}>{usuario ? "Alterar senha" : "Redefinir senha"}</h1>
                <form className={css.formulario} onSubmit={alterarSenha}>
                    {usuario ? <div className={css.campo}>
                        <label htmlFor="senhaAtual">Senha atual:</label>
                        <input id="senhaAtual" type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} autoComplete="current-password" required />
                    </div> : <>
                        <div className={css.campo}><label htmlFor="email">E-mail cadastrado:</label><input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></div>
                        <div className={css.campo}><label htmlFor="codigo">Código recebido por e-mail:</label><input id="codigo" type="text" inputMode="numeric" maxLength={6} value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))} required /></div>
                    </>}
                    <div className={css.campo}><label htmlFor="novaSenha">Nova senha:</label><input id="novaSenha" type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} minLength={8} maxLength={12} autoComplete="new-password" required /></div>
                    <div className={css.campo}><label htmlFor="confirmarSenha">Confirmar nova senha:</label><input id="confirmarSenha" type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} minLength={8} maxLength={12} autoComplete="new-password" required /></div>
                    <button type="submit" className={css.botao}>Alterar senha</button>
                </form>
            </div></div>
        </main>
        <Footer />
    </div>;
}
