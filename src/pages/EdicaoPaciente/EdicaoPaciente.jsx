import { useEffect, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "../../components/UserAvatar/UserAvatar.jsx";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import api from "../../config/api.js";
import css from "./EdicaoPaciente.module.css";

const campos = [
    { nome: "nome", titulo: "Nome", tipo: "text", maxLength: 150 },
    { nome: "email", titulo: "E-mail", tipo: "email", maxLength: 255 },
    { nome: "telefone", titulo: "Telefone", tipo: "tel", maxLength: 20 },
    { nome: "cpf", titulo: "CPF", tipo: "text", maxLength: 11, inputMode: "numeric" },
];

export default function EdicaoPaciente() {
    const { usuario, carregando, recarregar, recarregarFoto } = useUsuario();
    const [editando, setEditando] = useState(null);
    const [valorEditado, setValorEditado] = useState("");
    const [foto, setFoto] = useState(null);
    const [salvando, setSalvando] = useState(false);

    function iniciarEdicao(campo) {
        setEditando(campo);
        setValorEditado(usuario?.[campo] || "");
    }

    async function salvarCampo(evento, campo) {
        evento.preventDefault();
        const valor = campo === "cpf" ? valorEditado.replace(/\D/g, "") : valorEditado.trim();
        const dadosAtualizados = Object.fromEntries(campos.map(item => [
            item.nome,
            item.nome === campo ? valor : usuario?.[item.nome] || "",
        ]));
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/usuarios/me`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosAtualizados),
            });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error(retorno.error || "Não foi possível salvar a alteração.");
            toast.success(`${campos.find(item => item.nome === campo).titulo} atualizado.`);
            setEditando(null);
            recarregar();
        } catch (erro) {
            toast.error(erro.message || "Não foi possível salvar a alteração.");
        } finally {
            setSalvando(false);
        }
    }

    function cancelarEdicao() {
        setEditando(null);
        setValorEditado("");
    }

    async function salvarFoto() {
        if (!foto) return;
        const formulario = new FormData();
        campos.forEach(campo => formulario.append(campo.nome, usuario?.[campo.nome] || ""));
        formulario.append("imagem", foto);
        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/usuarios/me`, { method: "PUT", credentials: "include", body: formulario });
            const retorno = await resposta.json();
            if (!resposta.ok) throw new Error(retorno.error || "Não foi possível alterar a foto.");
            toast.success("Foto de perfil atualizada.");
            setFoto(null);
            recarregarFoto();
        } catch (erro) {
            toast.error(erro.message || "Não foi possível alterar a foto.");
        } finally {
            setSalvando(false);
        }
    }

    return <div>
        <Header />
        <main className={css.container}>
            <section className={css.formulario}>
                <img src="/logo.png" alt="PSICOdaily" className={css.logo} />
                <div className={css.linha} />
                <h1 className={css.titulo}>Meu perfil</h1>
                {carregando ? <p role="status">Carregando perfil...</p> : <>
                    <div className={css.camposPerfil}>
                        {campos.map(campo => <div className={css.campoPerfil} key={campo.nome}>
                            <label htmlFor={`perfil-${campo.nome}`}>{campo.titulo}</label>
                            {editando === campo.nome ? <form className={css.edicaoCampo} onSubmit={evento => salvarCampo(evento, campo.nome)}>
                                <input
                                    id={`perfil-${campo.nome}`}
                                    type={campo.tipo}
                                    inputMode={campo.inputMode}
                                    maxLength={campo.maxLength}
                                    minLength={campo.nome === "nome" ? 3 : campo.nome === "cpf" ? 11 : undefined}
                                    required
                                    autoFocus
                                    value={valorEditado}
                                    onChange={evento => setValorEditado(campo.nome === "cpf" ? evento.target.value.replace(/\D/g, "").slice(0, 11) : evento.target.value)}
                                />
                                <button type="submit" disabled={salvando} aria-label={`Salvar ${campo.titulo}`} title="Salvar"><Check size={18} /></button>
                                <button type="button" onClick={cancelarEdicao} aria-label="Cancelar edição" title="Cancelar"><X size={18} /></button>
                            </form> : <div className={css.valorCampo}>
                                <span>{usuario?.[campo.nome] || "Não informado"}</span>
                                <button type="button" onClick={() => iniciarEdicao(campo.nome)} aria-label={`Editar ${campo.titulo}`} title={`Editar ${campo.titulo}`}><Pencil size={17} /></button>
                            </div>}
                        </div>)}
                    </div>
                    <div className={css.fotoContainer}>
                        <label htmlFor="foto" className={css.botaoFoto}>Alterar foto de perfil</label>
                        <input id="foto" type="file" accept="image/jpeg,.jpg,.jpeg" className={css.inputFoto} onChange={evento => setFoto(evento.target.files?.[0] || null)} />
                        <div className={css.avatarPreview}><UserAvatar currentUser /></div>
                        {foto && <button type="button" className={css.botaoCadastrar} onClick={salvarFoto} disabled={salvando}>{salvando ? "Salvando..." : "Salvar foto"}</button>}
                    </div>
                </>}
            </section>
        </main>
        <Footer />
    </div>;
}
