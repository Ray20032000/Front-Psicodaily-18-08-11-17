import AvatarPlaceholder from "../../components/AvatarPlaceholder/AvatarPlaceholder.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alerts from "../../components/Alerts/Alerts.jsx";
import AuthLayout, { InputSenha } from "../../components/AuthLayout/AuthLayout.jsx";
import css from "../../components/AuthLayout/AuthLayout.module.css";
import api from "../../config/api.js";
import { abordagens, nomesModalidade } from "../../utils/profissionais.js";
import { mascaraReais } from "../../utils/dinheiro.js";

export default function CadastroPsicologo() {

    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [crp, setCrp] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");

    const [especialidade, setEspecialidade] = useState("Psicologia");
    const [abordagem, setAbordagem] = useState("");
    const [modalidade, setModalidade] = useState("");

    const [dias, setDias] = useState([]);

    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mensagem, setMensagem] = useState(null);
    const [enviando, setEnviando] = useState(false);

    function mostrarMensagem(texto, tipo = "erro", titulo) {
        setMensagem({
            id: Date.now(),
            texto,
            tipo,
            titulo
        });
    }


    const listaDias = [
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
        "Domingo"
    ];


    // MÁSCARA TELEFONE
    function mascaraTelefone(valor) {

        valor = valor.replace(/\D/g, "");

        valor = valor.replace(
            /(\d{2})(\d)/,
            "($1) $2"
        );

        valor = valor.replace(
            /(\d{5})(\d)/,
            "$1-$2"
        );

        return valor.slice(0, 15);
    }


    // MÁSCARA CPF
    function mascaraCpf(valor) {

        valor = valor.replace(/\D/g, "");

        valor = valor.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        valor = valor.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        valor = valor.replace(
            /(\d{3})(\d{1,2})$/,
            "$1-$2"
        );

        return valor.slice(0, 14);
    }


    // MÁSCARA CRP
    function mascaraCrp(valor) {

        valor = valor.replace(/\D/g, "");

        valor = valor.replace(
            /(\d{2})(\d)/,
            "$1/$2"
        );

        return valor.slice(0, 9);
    }


    // MÁSCARA CRM: "CRM/SP 123456". O prefixo é da máscara: apagar até ele limpa o campo,
    // em vez de sobrar "CRM" e as letras dele virarem a UF
    function mascaraCrm(valor) {
        const texto = valor.toUpperCase().replace(/^CRM\/?/, "").replace(/[^A-Z0-9]/g, "");
        const estado = texto.replace(/[^A-Z]/g, "").slice(0, 2);
        const numero = texto.replace(/\D/g, "").slice(0, 6);
        if (!estado && !numero) return "";
        return `CRM/${estado}${numero ? ` ${numero}` : ""}`;
    }


    function escolherDia(dia) {

        if (dias.includes(dia)) {

            setDias(
                dias.filter((item) => item !== dia)
            );

        } else {

            setDias([
                ...dias,
                dia
            ]);

        }
    }


    function escolherFoto(e) {

        const arquivo = e.target.files[0];

        if (arquivo) {

            setFoto(arquivo);

            setPreview(
                URL.createObjectURL(arquivo)
            );
        }
    }


    async function cadastrar(e) {

        e.preventDefault();

        if (senha !== confirmarSenha) {
            mostrarMensagem("As senhas nao sao iguais", "erro", "Senha invalida");
            return;
        }

        const dados = new FormData();

        dados.append("nome", nome);
        dados.append("email", email);
        dados.append("telefone", telefone);
        dados.append("cpf", cpf);
        dados.append("senha", senha);
        dados.append("confirmarSenha", confirmarSenha);
        dados.append("crp_crm", crp);
        dados.append("especialidade", especialidade);
        dados.append("descricao", descricao);
        dados.append("valor", valor);
        if (abordagem) dados.append("abordagem", abordagem);
        if (modalidade) dados.append("modalidade", modalidade);

        if (foto) {
            dados.append("imagem", foto);
        }

        dias.forEach((dia) => {
            dados.append("dias[]", dia);
        });

        setEnviando(true);

        try {
            const resposta = await fetch(`${api}/profissionais/`, {
                method: "POST",
                body: dados
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                mostrarMensagem(
                    resultado.error || "Nao foi possivel realizar o cadastro profissional",
                    "erro",
                    "Cadastro nao realizado"
                );
                return;
            }

            localStorage.setItem("cadastro_email", email);
            mostrarMensagem(
                resultado.message || "Profissional cadastrado com sucesso",
                "sucesso",
                "Cadastro realizado"
            );

            setTimeout(() => {
                navigate("/ativarconta");
            }, 1200);
        } catch {
            mostrarMensagem(
                "Nao foi possivel conectar a API. Verifique se o backend esta ativo.",
                "erro",
                "Conexao indisponivel"
            );
        } finally {
            setEnviando(false);
        }
    }


    function escolherEspecialidade(nova) {
        setEspecialidade(nova);
        setCrp("");
    }


    return (
        <AuthLayout>
            {mensagem && (
                <Alerts
                    key={mensagem.id}
                    tipo={mensagem.tipo}
                    titulo={mensagem.titulo}
                    descricao={mensagem.texto}
                    onClose={() => setMensagem(null)}
                />
            )}

            <h1 className={css.titulo}>Seja um profissional parceiro</h1>
            <p className={css.subtitulo}>Crie sua conta profissional no PsicoDaily.</p>

            <nav className={css.abas}>
                <Link to="/cadastropaciente">Sou paciente</Link>
                <span className={css.ativo}>Sou profissional</span>
            </nav>

            <form className={css.form} onSubmit={cadastrar}>
                <div className={css.campo}>
                    <label htmlFor="nome">Nome</label>
                    <input
                        id="nome"
                        name="nome"
                        type="text"
                        placeholder="Seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div className={css.campo}>
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seuemail@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className={css.campo}>
                    <span className={css.rotulo}>Especialidade</span>
                    <div className={css.chips}>
                        {["Psicologia", "Psiquiatria"].map((item) => (
                            <button
                                key={item}
                                type="button"
                                className={`${css.chip} ${especialidade === item ? css.ativo : ""}`}
                                onClick={() => escolherEspecialidade(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={css.dupla}>
                    <div className={css.campo}>
                        <label htmlFor="crp_crm">{especialidade === "Psicologia" ? "CRP" : "CRM"}</label>
                        <input
                            id="crp_crm"
                            name="crp_crm"
                            type="text"
                            placeholder={especialidade === "Psicologia" ? "06/123456" : "CRM/SP 123456"}
                            pattern={especialidade === "Psicologia" ? "\\d{2}/\\d{4,6}" : "CRM/[A-Z]{2} \\d{4,6}"}
                            title={especialidade === "Psicologia" ? "Região e número, ex.: 06/123456" : "UF e número, ex.: CRM/SP 123456"}
                            value={crp}
                            onChange={(e) =>
                                setCrp(
                                    especialidade === "Psicologia"
                                        ? mascaraCrp(e.target.value)
                                        : mascaraCrm(e.target.value)
                                )
                            }
                        />
                    </div>

                    <div className={css.campo}>
                        <label htmlFor="cpf">CPF</label>
                        <input
                            id="cpf"
                            name="cpf"
                            type="text"
                            placeholder="123.456.789-00"
                            maxLength={14}
                            value={cpf}
                            onChange={(e) => setCpf(mascaraCpf(e.target.value))}
                        />
                    </div>
                </div>

                <div className={css.dupla}>
                    <div className={css.campo}>
                        <label htmlFor="telefone">Telefone</label>
                        <input
                            id="telefone"
                            name="telefone"
                            type="text"
                            placeholder="(18) 99999-9999"
                            maxLength={15}
                            value={telefone}
                            onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                        />
                    </div>

                    <div className={css.campo}>
                        <label htmlFor="valor">Valor por hora (R$)</label>
                        <input
                            id="valor"
                            name="valor"
                            type="text"
                            inputMode="numeric"
                            placeholder="150,00"
                            value={valor}
                            onChange={(e) => setValor(mascaraReais(e.target.value))}
                        />
                    </div>
                </div>

                <div className={css.campo}>
                    <label htmlFor="descricao">Descrição</label>
                    <input
                        id="descricao"
                        name="descricao"
                        type="text"
                        placeholder="Conte um pouco sobre você"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </div>

                {/* Opcionais: clicar de novo na opção escolhida desmarca */}
                <div className={css.campo}>
                    <span className={css.rotulo}>Abordagem terapêutica (opcional)</span>
                    <div className={css.chips}>
                        {abordagens.map((item) => (
                            <button
                                key={item}
                                type="button"
                                aria-pressed={abordagem === item}
                                className={`${css.chip} ${abordagem === item ? css.ativo : ""}`}
                                onClick={() => setAbordagem(abordagem === item ? "" : item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={css.campo}>
                    <span className={css.rotulo}>Modalidade (opcional)</span>
                    <div className={css.chips}>
                        {Object.entries(nomesModalidade).map(([valorModalidade, rotulo]) => (
                            <button
                                key={valorModalidade}
                                type="button"
                                aria-pressed={modalidade === valorModalidade}
                                className={`${css.chip} ${modalidade === valorModalidade ? css.ativo : ""}`}
                                onClick={() => setModalidade(modalidade === valorModalidade ? "" : valorModalidade)}
                            >
                                {rotulo}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={css.campo}>
                    <span className={css.rotulo}>Dias de atendimento</span>
                    <div className={css.chips}>
                        {listaDias.map((dia) => (
                            <button
                                key={dia}
                                type="button"
                                className={`${css.chip} ${dias.includes(dia) ? css.ativo : ""}`}
                                onClick={() => escolherDia(dia)}
                            >
                                {dia}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={css.dupla}>
                    <div className={css.campo}>
                        <label htmlFor="senha">Senha</label>
                        <InputSenha
                            id="senha"
                            name="senha"
                            placeholder="Sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    <div className={css.campo}>
                        <label htmlFor="confirmarSenha">Confirmar senha</label>
                        <InputSenha
                            id="confirmarSenha"
                            name="confirmarSenha"
                            placeholder="Repita a senha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                        />
                    </div>
                </div>

                <div className={css.foto}>
                    <div className={css.preview}>
                        {preview ? <img src={preview} alt="Foto de perfil" /> : <AvatarPlaceholder />}
                    </div>
                    <label htmlFor="foto" className={css.botaoSecundario}>
                        Enviar foto de perfil
                    </label>
                    <input id="foto" type="file" accept="image/*" onChange={escolherFoto} />
                </div>

                <button type="submit" className={css.botao} disabled={enviando}>
                    {enviando ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>

            <p className={css.rodape}>
                Já possui uma conta? <Link to="/login">Entrar</Link>
            </p>
        </AuthLayout>
    );
}
