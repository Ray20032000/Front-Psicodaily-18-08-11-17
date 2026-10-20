
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Heart,
    Pencil,
    Sparkles,
} from "lucide-react";
import { useUsuario } from "../../contexts/UsuarioContext.jsx";
import css from "./QuestionarioInicial.module.css";

const STORAGE_KEY = "psicodaily_questionario_preferencias";

const etapas = [
    {
        titulo: "O que trouxe você até aqui?",
        descricao: "Selecione os motivos que mais combinam com o que você está vivendo.",
        campo: "motivos",
        multipla: true,
        opcoes: [
            "Ansiedade e preocupação",
            "Estresse e sobrecarga",
            "Relacionamentos",
            "Autoconhecimento",
            "Autoestima e confiança",
            "Tristeza ou desânimo",
            "Luto e mudanças",
            "Desenvolvimento pessoal",
            "Outro motivo",
        ],
    },
    {
        titulo: "Você tem preferência por alguma abordagem?",
        descricao: "Se não souber, tudo bem! Você pode deixar essa escolha em aberto.",
        campo: "abordagem",
        multipla: false,
        opcoes: [
            "Não tenho preferência",
            "Terapia Cognitivo-Comportamental (TCC)",
            "Psicanálise",
            "Humanista",
            "Gestalt-terapia",
            "Outra abordagem",
        ],
    },
    {
        titulo: "Como você prefere realizar as sessões?",
        descricao: "Escolha o formato que funciona melhor para sua rotina.",
        campo: "modalidade",
        multipla: false,
        opcoes: [
            "Online",
            "Presencial",
            "Tanto faz",
        ],
    },
    {
        titulo: "Qual valor por sessão cabe no seu orçamento?",
        descricao: "Essa informação ajuda a encontrar profissionais compatíveis com seu orçamento.",
        campo: "orcamento",
        multipla: false,
        opcoes: [
            "Até R$ 80",
            "R$ 81 a R$ 120",
            "R$ 121 a R$ 180",
            "Acima de R$ 180",
            "Prefiro conversar sobre valores",
        ],
    },
    {
        titulo: "Quais horários funcionam para você?",
        descricao: "Você pode selecionar mais de uma opção.",
        campo: "disponibilidade",
        multipla: true,
        opcoes: [
            "Manhã",
            "Tarde",
            "Noite",
            "Finais de semana",
            "Tenho flexibilidade",
        ],
    },
    {
        titulo: "O que é mais importante na sua escolha?",
        descricao: "Isso ajuda a priorizar os critérios na busca por profissionais.",
        campo: "prioridades",
        multipla: true,
        opcoes: [
            "Preço acessível",
            "Experiência com meu motivo de busca",
            "Abordagem terapêutica",
            "Disponibilidade de horários",
            "Modalidade online",
            "Avaliações de outros pacientes",
        ],
    },
];

const respostasVazias = {
    motivos: [],
    abordagem: "",
    modalidade: "",
    orcamento: "",
    disponibilidade: [],
    prioridades: [],
};

function carregarRespostas(usuarioId) {
    try {
        const dados = localStorage.getItem(
            `${STORAGE_KEY}_${usuarioId ?? "visitante"}`
        );

        return dados ? JSON.parse(dados) : null;
    } catch {
        return null;
    }
}

export default function QuestionarioInicial() {
    const { usuario } = useUsuario();
    const navigate = useNavigate();

    const usuarioId = usuario?.id_usuario;
    const [respostas, setRespostas] = useState(
        () => carregarRespostas(usuarioId) ?? respostasVazias
    );
    const [etapaAtual, setEtapaAtual] = useState(0);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [concluido, setConcluido] = useState(
        () => carregarRespostas(usuarioId) !== null
    );
    const [erro, setErro] = useState("");

    const etapa = etapas[etapaAtual];

    function selecionarOpcao(opcao) {
        setErro("");

        setRespostas((anterior) => {
            const selecionadas = anterior[etapa.campo];

            if (!etapa.multipla) {
                return {
                    ...anterior,
                    [etapa.campo]: selecionadas === opcao ? "" : opcao,
                };
            }

            const jaSelecionada = selecionadas.includes(opcao);

            return {
                ...anterior,
                [etapa.campo]: jaSelecionada
                    ? selecionadas.filter((item) => item !== opcao)
                    : [...selecionadas, opcao],
            };
        });
    }

    function avancar() {
        const resposta = respostas[etapa.campo];

        if (!resposta || resposta.length === 0) {
            setErro("Selecione pelo menos uma opção para continuar.");
            return;
        }

        setErro("");

        if (etapaAtual < etapas.length - 1) {
            setEtapaAtual((atual) => atual + 1);
        } else {
            salvarQuestionario();
        }
    }

    function voltar() {
        setErro("");

        if (etapaAtual > 0) {
            setEtapaAtual((atual) => atual - 1);
        } else {
            setModoEdicao(false);
        }
    }

    function salvarQuestionario() {
        try {
            localStorage.setItem(
                `${STORAGE_KEY}_${usuarioId ?? "visitante"}`,
                JSON.stringify(respostas)
            );

            setConcluido(true);
            setModoEdicao(false);
        } catch {
            setErro("Não foi possível salvar suas respostas neste navegador.");
        }
    }

    function editarQuestionario() {
        setEtapaAtual(0);
        setModoEdicao(true);
        setConcluido(false);
    }

    if (concluido && !modoEdicao) {
        return (
            <main className={css.pagina}>
                <section className={css.cartaoConclusao}>
                    <div className={css.iconeConclusao}>
                        <CheckCircle2 size={42} />
                    </div>

                    <span className={css.etiqueta}>Tudo pronto!</span>

                    <h1>Suas preferências foram salvas.</h1>

                    <p>
                        Vamos usar suas respostas para ajudar você a encontrar
                        profissionais mais alinhados ao que procura.
                    </p>

                    <p className={css.avisoEdicao}>
                        Você preencheu este questionário uma vez, mas pode editar suas
                        respostas sempre que quiser.
                    </p>

                    <button
                        type="button"
                        className={css.botaoPrincipal}
                        onClick={() => navigate("/buscar-profissionais")}
                    >
                        Encontrar profissionais
                        <ArrowRight size={18} />
                    </button>

                    <button
                        type="button"
                        className={css.botaoSecundario}
                        onClick={editarQuestionario}
                    >
                        <Pencil size={17} />
                        Editar minhas preferências
                    </button>

                    <Link to="/dashboard-paciente" className={css.linkVoltar}>
                        Voltar ao painel
                    </Link>
                </section>
            </main>
        );
    }

    if (!modoEdicao && !concluido) {
        return (
            <main className={css.pagina}>
                <section className={css.cartaoBoasVindas}>
                    <div className={css.iconeBoasVindas}>
                        <Heart size={34} />
                    </div>

                    <span className={css.etiqueta}>
            <Sparkles size={15} />
            Seu cuidado começa aqui
          </span>

                    <h1>Vamos encontrar o profissional ideal para você?</h1>

                    <p>
                        Queremos entender suas preferências para ajudar você a encontrar
                        psicólogos mais compatíveis com suas necessidades e sua rotina.
                    </p>

                    <div className={css.avisoUnicaVez}>
                        <CheckCircle2 size={21} />
                        <div>
                            <strong>Você preenche uma única vez.</strong>
                            <span>
                Depois, poderá editar suas respostas quando quiser.
              </span>
                        </div>
                    </div>

                    <ul className={css.listaBeneficios}>
                        <li>
                            <Check size={17} />
                            Leva apenas alguns minutos
                        </li>
                        <li>
                            <Check size={17} />
                            Você escolhe o que deseja compartilhar
                        </li>
                        <li>
                            <Check size={17} />
                            Suas respostas ajudam a personalizar a busca
                        </li>
                    </ul>

                    <button
                        type="button"
                        className={css.botaoPrincipal}
                        onClick={() => setModoEdicao(true)}
                    >
                        Começar questionário
                        <ArrowRight size={18} />
                    </button>

                    <Link to="/dashboard-paciente" className={css.linkVoltar}>
                        Fazer isso depois
                    </Link>
                </section>
            </main>
        );
    }

    const progresso = ((etapaAtual + 1) / etapas.length) * 100;
    const respostaAtual = respostas[etapa.campo];

    return (
        <main className={css.pagina}>
            <section className={css.cartaoQuestionario}>
                <header className={css.cabecalhoQuestionario}>
                    <span className={css.etiqueta}>Suas preferências</span>
                    <span className={css.contador}>
            Etapa {etapaAtual + 1} de {etapas.length}
          </span>
                </header>

                <div
                    className={css.trilhoProgresso}
                    role="progressbar"
                    aria-valuenow={etapaAtual + 1}
                    aria-valuemin={1}
                    aria-valuemax={etapas.length}
                    aria-label="Progresso do questionário"
                >
                    <div
                        className={css.progresso}
                        style={{ width: `${progresso}%` }}
                    />
                </div>

                <h1>{etapa.titulo}</h1>
                <p className={css.descricao}>{etapa.descricao}</p>

                {etapa.multipla && (
                    <p className={css.dica}>Você pode selecionar várias opções.</p>
                )}

                <div className={css.listaOpcoes}>
                    {etapa.opcoes.map((opcao) => {
                        const selecionada = etapa.multipla
                            ? respostaAtual.includes(opcao)
                            : respostaAtual === opcao;

                        return (
                            <button
                                type="button"
                                key={opcao}
                                className={`${css.opcao} ${
                                    selecionada ? css.opcaoSelecionada : ""
                                }`}
                                onClick={() => selecionarOpcao(opcao)}
                                aria-pressed={selecionada}
                            >
                                <span>{opcao}</span>
                                <span className={css.marcadorOpcao}>
                  {selecionada && <Check size={16} />}
                </span>
                            </button>
                        );
                    })}
                </div>

                {erro && <p className={css.mensagemErro}>{erro}</p>}

                <footer className={css.acoesQuestionario}>
                    <button
                        type="button"
                        className={css.botaoSecundario}
                        onClick={voltar}
                    >
                        <ArrowLeft size={17} />
                        Voltar
                    </button>

                    <button
                        type="button"
                        className={css.botaoPrincipal}
                        onClick={avancar}
                    >
                        {etapaAtual === etapas.length - 1
                            ? "Salvar respostas"
                            : "Continuar"}
                        <ArrowRight size={18} />
                    </button>
                </footer>

                <p className={css.notaPrivacidade}>
                    Suas preferências servem para personalizar sua busca por profissionais.
                </p>
            </section>
        </main>
    );
}
