import { useState } from "react"
import { useNavigate } from "react-router-dom"
import css from "./EdicaoPsicologo.module.css"
import Header from "./../../components/Header/Header.jsx"
import Footer from "./../../components/Footer/Footer.jsx"

const listaDias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

function mascaraCrp(valor) {
    // formato: 06/123456
    return valor
        .replace(/\D/g, "")
        .slice(0, 8)
        .replace(/^(\d{2})(\d)/, "$1/$2")
}

function mascaraCrm(valor) {
    // formato: CRM/SP 123456
    return valor
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10)
}

function mascaraTelefone(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
}

function mascaraCpf(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function EdicaoPsicologo() {
    const navigate = useNavigate()

    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [crp, setCrp] = useState("")
    const [telefone, setTelefone] = useState("")
    const [cpf, setCpf] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [descricao, setDescricao] = useState("")
    const [valor, setValor] = useState("")
    const [especialidade, setEspecialidade] = useState("Psicologia")
    const [dias, setDias] = useState([])
    const [preview, setPreview] = useState(null)
    const [foto, setFoto] = useState(null)
    const [salvando, setSalvando] = useState(false)

    function escolherDia(dia) {
        setDias((atual) =>
            atual.includes(dia)
                ? atual.filter((d) => d !== dia)
                : [...atual, dia]
        )
    }

    function escolherFoto(e) {
        const arquivo = e.target.files?.[0]
        if (!arquivo) return

        setFoto(arquivo)
        setPreview(URL.createObjectURL(arquivo))
    }

    async function editar(e) {
        e.preventDefault()

        if (senha && senha !== confirmarSenha) {
            alert("As senhas não coincidem.")
            return
        }

        setSalvando(true)

        try {
            const dados = new FormData()
            dados.append("nome", nome)
            dados.append("email", email)
            dados.append("crp_crm", crp)
            dados.append("telefone", telefone)
            dados.append("cpf", cpf)
            if (senha) dados.append("senha", senha)
            dados.append("descricao", descricao)
            dados.append("valor", valor)
            dados.append("especialidade", especialidade)
            dados.append("dias", JSON.stringify(dias))
            if (foto) dados.append("foto", foto)

            // TODO: ajustar para o endpoint real da API (id do psicólogo logado)
            const resposta = await fetch("/api/psicologos/me", {
                method: "PUT",
                body: dados,
            })

            if (!resposta.ok) {
                throw new Error("Falha ao editar")
            }

            navigate("/perfil")
        } catch (erro) {
            console.error(erro)
            alert("Não foi possível salvar as alterações. Tente novamente.")
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div>
            <Header />
            <div className={css.container}>
                <div className={css.formulario}>
                    <img
                        src="/logo.png"
                        alt="PSICOdaily"
                        className={css.logo}
                    />
                    <div className={css.linha}></div>
                    <h1 className={css.titulo}>Edição Psicologo</h1>


                    <form
                        onSubmit={editar}
                    >
                        <div className={css.colunas}>

                            {/* COLUNA ESQUERDA */}
                            <div className={css.coluna}>

                                <div className={css.campo}>
                                    <label htmlFor="nome">Nome</label>
                                    <input
                                        id="nome"
                                        name="nome"
                                        placeholder="Seu nome"
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label htmlFor="email">E-mail</label>
                                    <input
                                        id="email"
                                        name="email"
                                        placeholder="SeuEmail@gmail.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* CRP / CRM */}
                                <div className={css.campo}>
                                    <label htmlFor="crp_crm">CRP/CRM</label>
                                    <input
                                        id="crp_crm"
                                        name="crp_crm"
                                        type="text"
                                        value={crp}
                                        placeholder={
                                            especialidade === "Psicologia"
                                                ? "06/123456"
                                                : "CRM/SP 123456"
                                        }
                                        onChange={(e) => {
                                            if (especialidade === "Psicologia") {
                                                setCrp(mascaraCrp(e.target.value))
                                            } else {
                                                setCrp(mascaraCrm(e.target.value))
                                            }
                                        }}
                                    />
                                </div>

                                {/* TELEFONE */}
                                <div className={css.campo}>
                                    <label htmlFor="telefone">Telefone</label>
                                    <input
                                        id="telefone"
                                        name="telefone"
                                        type="text"
                                        value={telefone}
                                        placeholder="(18) 99999-9999"
                                        maxLength={15}
                                        onChange={(e) =>
                                            setTelefone(mascaraTelefone(e.target.value))
                                        }
                                    />
                                </div>

                                {/* CPF */}
                                <div className={css.campo}>
                                    <label htmlFor="cpf">CPF</label>
                                    <input
                                        id="cpf"
                                        name="cpf"
                                        type="text"
                                        value={cpf}
                                        placeholder="123.456.789-00"
                                        maxLength={14}
                                        onChange={(e) =>
                                            setCpf(mascaraCpf(e.target.value))
                                        }
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label htmlFor="senha">Nova senha</label>
                                    <input
                                        id="senha"
                                        name="senha"
                                        placeholder="Deixe em branco para manter a atual"
                                        type="password"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label htmlFor="confirmarSenha">Confirmar senha</label>
                                    <input
                                        id="confirmarSenha"
                                        name="confirmarSenha"
                                        placeholder="Sua senha"
                                        type="password"
                                        value={confirmarSenha}
                                        onChange={(e) => setConfirmarSenha(e.target.value)}
                                    />
                                </div>

                            </div>

                            {/* COLUNA DIREITA */}
                            <div className={css.colunaDireita}>

                                <div className={css.campo}>
                                    <label htmlFor="descricao">Descrição</label>
                                    <input
                                        id="descricao"
                                        name="descricao"
                                        placeholder="Sua descrição"
                                        type="text"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label htmlFor="valor">Valor por sessão</label>
                                    <input
                                        id="valor"
                                        name="valor"
                                        placeholder="Valor de cada sessão"
                                        type="number"
                                        value={valor}
                                        onChange={(e) => setValor(e.target.value)}
                                    />
                                </div>

                                <div className={css.areaEspecialidade}>
                                    <label htmlFor="especialidade">Especialidade</label>

                                    <div id="especialidade" className={css.especialidades}>
                                        <button
                                            type="button"
                                            className={
                                                especialidade === "Psicologia"
                                                    ? css.especialidadeAtiva
                                                    : css.especialidade
                                            }
                                            onClick={() => {
                                                setEspecialidade("Psicologia")
                                                setCrp("")
                                            }}
                                        >
                                            Psicologia
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                especialidade === "Psiquiatria"
                                                    ? css.especialidadeAtiva
                                                    : css.especialidade
                                            }
                                            onClick={() => {
                                                setEspecialidade("Psiquiatria")
                                                setCrp("")
                                            }}
                                        >
                                            Psiquiatria
                                        </button>
                                    </div>
                                </div>

                                <div className={css.areaDias}>
                                    <label>Dias de atendimento</label>

                                    <div className={css.dias}>
                                        {listaDias.map((dia) => (
                                            <button
                                                key={dia}
                                                type="button"
                                                onClick={() => escolherDia(dia)}
                                                className={
                                                    dias.includes(dia)
                                                        ? css.diaAtivo
                                                        : css.dia
                                                }
                                            >
                                                {dia}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={css.areaFoto}>
                                    <label htmlFor="foto" className={css.botaoFoto}>
                                        Upload da foto de perfil
                                    </label>

                                    <input
                                        id="foto"
                                        type="file"
                                        accept="image/*"
                                        onChange={escolherFoto}
                                        className={css.inputFoto}
                                    />

                                    <div className={css.preview}>
                                        {preview ? (
                                            <img src={preview} alt="Foto de perfil" />
                                        ) : (
                                            <div className={css.usuarioPadrao}>
                                                <div className={css.cabeca}></div>
                                                <div className={css.corpo}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        <button
                            type="submit"
                            className={css.botaoCadastrar}
                            disabled={salvando}
                        >
                            {salvando ? "Editando..." : "Editar"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default EdicaoPsicologo;