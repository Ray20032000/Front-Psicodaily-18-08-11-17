
import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import api from "../../config/api.js";
import Skeleton, { Carregando } from "../../components/Skeleton/Skeleton.jsx";
import { formatarCentavos } from "../../utils/dinheiro.js";
import { nomesModalidade } from "../../utils/profissionais.js";
import css from "./QuestionarioInicial.module.css";

const MAXIMO_MOTIVOS = 3;
// "" é "não tenho preferência": o campo não vai para a API
const SEM_PREFERENCIA = { valor: "", rotulo: "Não tenho preferência" };
const paraOpcoes = (lista, rotulo = (valor) => valor) => lista.map((valor) => ({ valor, rotulo: rotulo(valor) }));

// As opções válidas vêm da API; só o orçamento é livre, em centavos
function montarEtapas(opcoes) {
    return [
        {
            titulo: "O que trouxe você até aqui?",
            descricao: `Selecione até ${MAXIMO_MOTIVOS} motivos. Se preferir, pode seguir sem escolher.`,
            campo: "motivos",
            multipla: true,
            opcoes: paraOpcoes(opcoes.motivos),
        },
        {
            titulo: "Você tem preferência por alguma abordagem?",
            descricao: "Se não souber, tudo bem! Você pode deixar essa escolha em aberto.",
            campo: "abordagem",
            opcoes: [SEM_PREFERENCIA, ...paraOpcoes(opcoes.abordagem)],
        },
        {
            titulo: "Como você prefere realizar as sessões?",
            descricao: "Escolha o formato que funciona melhor para sua rotina.",
            campo: "modalidade",
            opcoes: [SEM_PREFERENCIA, ...paraOpcoes(opcoes.modalidade, (valor) => nomesModalidade[valor] || valor)],
        },
        {
            titulo: "Em qual idioma você prefere ser atendido?",
            descricao: "Vamos priorizar profissionais que atendem nesse idioma.",
            campo: "idioma",
            opcoes: [SEM_PREFERENCIA, ...paraOpcoes(opcoes.idioma)],
        },
        {
            titulo: "Qual valor por sessão cabe no seu orçamento?",
            descricao: "Essa informação ajuda a encontrar profissionais compatíveis com seu orçamento.",
            campo: "preco_max",
            opcoes: [SEM_PREFERENCIA, ...paraOpcoes([8000, 12000, 18000, 25000], (valor) => `Até ${formatarCentavos(valor)}`)],
        },
    ];
}

const respostasVazias = { motivos: [], abordagem: null, modalidade: null, idioma: null, preco_max: null };

export default function QuestionarioInicial() {
    const navigate = useNavigate();

    const [etapas, setEtapas] = useState(null);
    const [erroCarga, setErroCarga] = useState("");
    const [versao, setVersao] = useState(0);
    const [respostas, setRespostas] = useState(respostasVazias);
    const [etapaAtual, setEtapaAtual] = useState(0);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [concluido, setConcluido] = useState(false);
    const [jaSalvo, setJaSalvo] = useState(false);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setErroCarga("");
        fetch(`${api}/usuarios/me/preferencias`, { credentials: "include", signal: controller.signal })
            .then(async (resposta) => {
                const dados = await resposta.json().catch(() => null);
                if (!resposta.ok || !dados?.opcoes) throw new Error(dados?.error || "Não foi possível carregar o questionário.");
                setEtapas(montarEtapas(dados.opcoes));
                if (dados.preferencias) {
                    // Campo que não foi guardado é "sem preferência"
                    const salvas = dados.preferencias;
                    setRespostas({
                        motivos: salvas.motivos || [],
                        abordagem: salvas.abordagem ?? "",
                        modalidade: salvas.modalidade ?? "",
                        idioma: salvas.idioma ?? "",
                        preco_max: salvas.preco_max ?? "",
                    });
                    setConcluido(true);
                    setJaSalvo(true);
                }
            })
            .catch((falha) => { if (!controller.signal.aborted) setErroCarga(falha.message); });
        return () => controller.abort();
    }, [versao]);

    if (erroCarga) {
        return (
            <main className={css.pagina}>
                <section className={css.cartaoBoasVindas}>
                    <p className={css.mensagemErro} role="alert">{erroCarga}</p>
                    <button type="button" className={css.botaoPrincipal} onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</button>
                </section>
            </main>
        );
    }

    if (!etapas) {
        return (
            <main className={css.pagina}>
                <Carregando texto="Carregando questionário..." className={css.cartaoBoasVindas}>
                    <Skeleton height="320px" radius="12px" />
                </Carregando>
            </main>
        );
    }

    const etapa = etapas[etapaAtual];

    function selecionarOpcao(opcao) {
        setErro("");

        setRespostas((anterior) => {
            if (!etapa.multipla) {
                return { ...anterior, [etapa.campo]: opcao };
            }

            const selecionadas = anterior[etapa.campo];
            if (selecionadas.includes(opcao)) {
                return { ...anterior, [etapa.campo]: selecionadas.filter((item) => item !== opcao) };
            }
            if (selecionadas.length >= MAXIMO_MOTIVOS) {
                setErro(`Escolha no máximo ${MAXIMO_MOTIVOS} motivos.`);
                return anterior;
            }
            return { ...anterior, [etapa.campo]: [...selecionadas, opcao] };
        });
    }

    function avancar() {
        if (!etapa.multipla && respostas[etapa.campo] === null) {
            setErro("Selecione uma opção para continuar.");
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
            setConcluido(jaSalvo);
        }
    }

    async function salvarQuestionario() {
        // A API recusa corpo vazio; `motivos: null` é "sem preferência" e sempre vai
        const corpo = { motivos: respostas.motivos.length ? respostas.motivos : null };
        ["abordagem", "modalidade", "idioma", "preco_max"].forEach((campo) => {
            if (respostas[campo]) corpo[campo] = respostas[campo];
        });

        setSalvando(true);
        try {
            const resposta = await fetch(`${api}/usuarios/me/preferencias`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(corpo),
            });
            const dados = await resposta.json().catch(() => null);
            if (!resposta.ok) throw new Error(dados?.error || "Não foi possível salvar suas respostas.");
            setConcluido(true);
            setJaSalvo(true);
            setModoEdicao(false);
        } catch (falha) {
            toast.error(falha.message);
        } finally {
            setSalvando(false);
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
                        Você pode editar suas respostas sempre que quiser.
                    </p>

                    <button
                        type="button"
                        className={css.botaoPrincipal}
                        onClick={() => navigate("/profissionais")}
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

                    <Link to="/app" className={css.linkVoltar}>
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
                        profissionais mais compatíveis com suas necessidades.
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

                    <Link to="/app" className={css.linkVoltar}>
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
                    <p className={css.dica}>Você pode selecionar até {MAXIMO_MOTIVOS} opções.</p>
                )}

                <div className={css.listaOpcoes}>
                    {etapa.opcoes.map(({ valor: opcao, rotulo }) => {
                        const selecionada = etapa.multipla
                            ? respostaAtual.includes(opcao)
                            : respostaAtual === opcao;

                        return (
                            <button
                                type="button"
                                key={rotulo}
                                className={`${css.opcao} ${
                                    selecionada ? css.opcaoSelecionada : ""
                                }`}
                                onClick={() => selecionarOpcao(opcao)}
                                aria-pressed={selecionada}
                            >
                                <span>{rotulo}</span>
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
                        disabled={salvando}
                    >
                        {salvando ? "Salvando..." : etapaAtual === etapas.length - 1
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
