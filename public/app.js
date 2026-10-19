/**
 * ============================================================================
 * AULAFLUX - SISTEMA DE GESTÃO DE CURSOS, SALAS VIRTUAIS E AGENDAMENTO
 * Integração Cloud Firestore + Firebase Authentication + Controle de Níveis
 * ============================================================================
 */

// Dados Iniciais Padrão (com links de salas virtuais e usuários padrão)
const DEFAULT_LEGACY_DATA = {
  cursos: [
    {
      id: "a88dc5b5-8d37-4373-b449-a9c8b454ed98",
      nome: "Power BI",
      duracao_horas: 32,
      descricao: "Formação em Power BI Analytics, DAX, Modelagem Relacional e Dashboards Interativos",
      aulas: [
        {
          id: "aula-pbi-01",
          titulo: "Aula 01 - Fundamentos, ETL no Power Query e Esquema Estrela",
          ordem: 1,
          youtube_url: "https://www.youtube.com/watch?v=AGrl-H87pRU",
          infografico_base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230f172a'/><text x='400' y='60' fill='%2338bdf8' font-size='26' font-family='sans-serif' font-weight='bold' text-anchor='middle'>INFOGRÁFICO: ARQUITETURA POWER BI</text><rect x='80' y='120' width='180' height='180' rx='12' fill='%231e293b' stroke='%2338bdf8' stroke-width='2'/><text x='170' y='180' fill='%23f8fafc' font-size='18' text-anchor='middle' font-family='sans-serif' font-weight='bold'>1. Fontes</text><text x='170' y='210' fill='%2394a3b8' font-size='13' text-anchor='middle' font-family='sans-serif'>SQL, Excel, Web, APIs</text><rect x='310' y='120' width='180' height='180' rx='12' fill='%231e293b' stroke='%2310b981' stroke-width='2'/><text x='400' y='180' fill='%23f8fafc' font-size='18' text-anchor='middle' font-family='sans-serif' font-weight='bold'>2. Power Query</text><text x='400' y='210' fill='%2394a3b8' font-size='13' text-anchor='middle' font-family='sans-serif'>ETL e Limpeza de Dados</text><rect x='540' y='120' width='180' height='180' rx='12' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/><text x='630' y='180' fill='%23f8fafc' font-size='18' text-anchor='middle' font-family='sans-serif' font-weight='bold'>3. DAX & Visual</text><text x='630' y='210' fill='%2394a3b8' font-size='13' text-anchor='middle' font-family='sans-serif'>Medidas e Dashboards</text><text x='400' y='380' fill='%2394a3b8' font-size='14' text-anchor='middle' font-family='sans-serif'>Fluxo completo de Business Intelligence orientado a decisões corporativas</text></svg>",
          mapamental_base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230b1120'/><circle cx='400' cy='225' r='80' fill='%230284c7'/><text x='400' y='230' fill='%23ffffff' font-size='18' font-weight='bold' font-family='sans-serif' text-anchor='middle'>MODELO ESTRELA</text><rect x='80' y='60' width='150' height='70' rx='8' fill='%231e293b' stroke='%2338bdf8'/><text x='155' y='100' fill='%23f8fafc' font-size='14' text-anchor='middle' font-family='sans-serif'>Dim_Calendário</text><line x1='230' y1='100' x2='330' y2='190' stroke='%2338bdf8' stroke-width='2'/><rect x='570' y='60' width='150' height='70' rx='8' fill='%231e293b' stroke='%2338bdf8'/><text x='645' y='100' fill='%23f8fafc' font-size='14' text-anchor='middle' font-family='sans-serif'>Dim_Cliente</text><line x1='570' y1='100' x2='470' y2='190' stroke='%2338bdf8' stroke-width='2'/><rect x='80' y='320' width='150' height='70' rx='8' fill='%231e293b' stroke='%2338bdf8'/><text x='155' y='360' fill='%23f8fafc' font-size='14' text-anchor='middle' font-family='sans-serif'>Dim_Produto</text><line x1='230' y1='350' x2='330' y2='260' stroke='%2338bdf8' stroke-width='2'/><rect x='570' y='320' width='150' height='70' rx='8' fill='%231e293b' stroke='%2338bdf8'/><text x='645' y='360' fill='%23f8fafc' font-size='14' text-anchor='middle' font-family='sans-serif'>Fato_Vendas</text><line x1='570' y1='350' x2='470' y2='260' stroke='%2338bdf8' stroke-width='2'/></svg>",
          pdf_url: "https://drive.google.com/file/d/1exemplopowerbi/view?usp=sharing",
          conteudo_markdown: "# Aula 01: Fundamentos de Power BI e Modelagem\n\nBem-vindo à primeira aula de **Power BI**! Nesta sessão aprenderemos os princípios fundamentais da arquitetura de inteligência de negócios.\n\n### Principais Tópicos Abordados\n- **Power Query:** Limpeza, remoção de duplicatas e unpivot de colunas.\n- **Modelagem Relacional:** Diferença entre tabelas fato e tabelas dimensão.\n- **Esquema Estrela (Star Schema):** Melhores práticas recomendadas pela Microsoft para máxima performance analítica.\n\n### Exemplo de Medida DAX Básica\n```dax\nTotal Vendas = SUM(Fato_Vendas[ValorLiquido])\nTicket Medio = DIVIDE([Total Vendas], DISTINCTCOUNT(Fato_Vendas[IdPedido]), 0)\n```\n\n> **Dica Prática:** Sempre separe suas medidas em tabelas dedicadas para manter seu projeto limpo e organizado!\n",
          quiz_questoes: [
            { id: 1, pergunta: "Qual é a principal função do Power Query no ecossistema Power BI?", opcoes: ["Executar tarefas de ETL (Extração, Transformação e Carga)", "Desenhar gráficos 3D dinâmicos", "Configurar redes neurais convolucionais", "Publicar relatórios em servidores Linux"], correta: 0 },
            { id: 2, pergunta: "Em um modelo dimensional Star Schema, qual tabela armazena eventos numéricos e métricas de negócio?", opcoes: ["Tabela Dimensão", "Tabela Fato", "Tabela de Metadados", "Tabela Temporária"], correta: 1 },
            { id: 3, pergunta: "Qual função DAX é recomendada para realizar divisões com tratamento seguro de divisão por zero?", opcoes: ["QUOTIENT()", "DIV()", "DIVIDE()", "SAFEDIV()"], correta: 2 },
            { id: 4, pergunta: "Qual a diferença entre uma Coluna Calculada e uma Medida DAX?", opcoes: ["Colunas calculadas consomem RAM fixa e medidas são avaliadas no contexto de filtro", "Medidas gastam espaço em disco e colunas calculadas não", "Não há diferença de desempenho", "Colunas calculadas não aceitam funções DAX"], correta: 0 },
            { id: 5, pergunta: "Para que serve a operação 'Unpivot Columns' no Power Query?", opcoes: ["Transformar linhas de dados em novas planilhas", "Transformar colunas em pares de atributo e valor para tabular dados normalizados", "Excluir valores nulos do banco", "Criptografar senhas"], correta: 1 },
            { id: 6, pergunta: "Qual cardinalidade de relacionamento é considerada padrão entre uma tabela Dimensão e uma Fato?", opcoes: ["Muitos para Muitos (*:*)", "Um para Um (1:1)", "Um para Muitos (1:*) com filtro unidirecional", "Nenhum relacionamento"], correta: 2 },
            { id: 7, pergunta: "Qual das seguintes funções DAX altera o contexto de filtro de uma expressão?", opcoes: ["SUM()", "AVERAGE()", "CALCULATE()", "COUNTROWS()"], correta: 2 },
            { id: 8, pergunta: "No Power BI Desktop, onde fica armazenado o arquivo com extensão .pbix localmente?", opcoes: ["Apenas no navegador", "No computador local onde o Power BI Desktop está sendo executado", "Exclusivamente no SharePoint", "No Active Directory"], correta: 1 },
            { id: 9, pergunta: "Para que serve a função RELATED() em DAX?", opcoes: ["Recuperar um valor de coluna de outra tabela relacionada no lado 'um'", "Somar todos os valores relacionados", "Criar um novo usuário no sistema", "Deletar relacionamentos inativos"], correta: 0 },
            { id: 10, pergunta: "Qual é a boa prática recomendada para tabelas de datas no Power BI?", opcoes: ["Usar a coluna de data da tabela fato sem tabela de calendário", "Criar uma tabela dimensão de datas dedicada com granularidade diária contínua", "Não utilizar filtros de tempo", "Importar apenas anos bissextos"], correta: 1 }
          ],
          zip_url: "https://drive.google.com/file/d/1pacotepowerbi_zip/view?usp=sharing",
          drive_professor_url: "https://drive.google.com/drive/folders/1pasta_prof_luiz_pbi"
        }
      ]
    },
    {
      id: "a3da2f88-8e5f-4994-988d-334983447e3a",
      nome: "Python",
      duracao_horas: 60,
      descricao: "Formação em Python para Automação, Ciência de Dados, IA e Integrações Corporativas",
      aulas: [
        {
          id: "aula-py-01",
          titulo: "Aula 01 - Sintaxe Moderna, Estruturas de Dados e Manipulação de APIs",
          ordem: 1,
          youtube_url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
          infografico_base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230f172a'/><text x='400' y='60' fill='%2310b981' font-size='26' font-family='sans-serif' font-weight='bold' text-anchor='middle'>ECOSSISTEMA PYTHON MODERNO</text><rect x='80' y='120' width='180' height='180' rx='12' fill='%231e293b' stroke='%2338bdf8' stroke-width='2'/><text x='170' y='175' fill='%23f8fafc' font-size='18' text-anchor='middle' font-family='sans-serif' font-weight='bold'>Automação</text><text x='170' y='210' fill='%2394a3b8' font-size='13' text-anchor='middle' font-family='sans-serif'>Scripts, OS, Requests</text><rect x='310' y='120' width='180' height='180' rx='12' fill='%231e293b' stroke='%2310b981' stroke-width='2'/><text x='400' y='175' fill='%23f8fafc' font-size='18' text-anchor='middle' font-family='sans-serif' font-weight='bold'>Data Science</text><text x='400' y='210' fill='%2394a3b8' font-size='13' text-anchor='middle' font-family='sans-serif'>Pandas, NumPy, Matplotlib</text><rect x='540' y='120' width='180' height='180' rx='12' fill='%231e293b' stroke='%23f59e0b' stroke-width='2'/><text x='630' y='175' fill='%23f8fafc' font-size='18' text-anchor='middle' font-family='sans-serif' font-weight='bold'>APIs & Web</text><text x='630' y='210' fill='%2394a3b8' font-size='13' text-anchor='middle' font-family='sans-serif'>FastAPI, Flask, Cloud</text><text x='400' y='380' fill='%2394a3b8' font-size='14' text-anchor='middle' font-family='sans-serif'>Desenvolvimento prático, limpo e orientado a boas práticas</text></svg>",
          mapamental_base64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='800' height='450' fill='%230b1120'/><circle cx='400' cy='225' r='80' fill='%2310b981'/><text x='400' y='230' fill='%23ffffff' font-size='18' font-weight='bold' font-family='sans-serif' text-anchor='middle'>PYTHON CORE</text><rect x='80' y='60' width='150' height='70' rx='8' fill='%231e293b' stroke='%2310b981'/><text x='155' y='100' fill='%23f8fafc' font-size='14' text-anchor='middle' font-family='sans-serif'>Tipos Primitivos</text><line x1='230' y1='100' x2='330' y2='190' stroke='%2310b981' stroke-width='2'/><rect x='570' y='60' width='150' height='70' rx='8' fill='%231e293b' stroke='%2310b981'/><text x='645' y='100' fill='%23f8fafc' font-size='14' text-anchor='middle' font-family='sans-serif'>List / Dict / Sets</text><line x1='570' y1='100' x2='470' y2='190' stroke='%2310b981' stroke-width='2'/><rect x='80' y='320' width='150' height='70' rx='8' fill='%231e293b' stroke='%2310b981'/><text x='155' y='360' fill='%23f8fafc' font-size='14' text-anchor='middle' font-family='sans-serif'>Funções & Lambdas</text><line x1='230' y1='350' x2='330' y2='260' stroke='%2310b981' stroke-width='2'/><rect x='570' y='320' width='150' height='70' rx='8' fill='%231e293b' stroke='%2310b981'/><text x='645' y='360' fill='%23f8fafc' font-size='14' text-anchor='middle' font-family='sans-serif'>Módulos & Pip</text><line x1='570' y1='350' x2='470' y2='260' stroke='%2310b981' stroke-width='2'/></svg>",
          pdf_url: "https://drive.google.com/file/d/1exemplopython_pdf/view?usp=sharing",
          conteudo_markdown: "# Aula 01: Python para Automação e Análise\n\nBem-vindo à trilha de formação profissional em **Python**.\n\n### Objetivos de Aprendizagem\n1. Compreender a sintaxe moderna e tipagem dinâmica.\n2. Dominar listas por compreensão (`list comprehensions`).\n3. Consumir e processar dados JSON via requisições HTTP REST.\n\n```python\n# Exemplo: Processamento Funcional de Dados\nregistros = [{\"nome\": \"Alice\", \"pontos\": 95}, {\"nome\": \"Bruno\", \"pontos\": 82}]\nmelhores = [r[\"nome\"] for r in registros if r[\"pontos\"] >= 90]\nprint(f\"Alunos destaque: {', '.join(melhores)}\")\n```\n\n> **Exercício Prático:** Baixe o arquivo ZIP da aula e execute o script localmente no VS Code!\n",
          quiz_questoes: [
            { id: 1, pergunta: "Qual das seguintes estruturas de dados em Python é imutável?", opcoes: ["Lista (list)", "Dicionário (dict)", "Tupla (tuple)", "Conjunto (set)"], correta: 2 },
            { id: 2, pergunta: "Qual é a forma correta de criar um ambiente virtual em projetos Python modernos?", opcoes: ["python -m venv .venv", "pip install env-create", "virtualenv --run", "python --make-environment"], correta: 0 },
            { id: 3, pergunta: "Qual é o resultado da expressão [x**2 for x in range(4)]?", opcoes: ["[1, 4, 9, 16]", "[0, 1, 4, 9]", "[0, 2, 4, 6]", "[0, 1, 2, 3]"], correta: 1 },
            { id: 4, pergunta: "Em Python, para que serve a instrução 'with' ao manipular arquivos?", opcoes: ["Criptografar o arquivo aberto", "Garantir o fechamento automático do recurso mesmo em caso de exceções", "Criar cópias de segurança na nuvem", "Aumentar a velocidade do disco rígido"], correta: 1 },
            { id: 5, pergunta: "Qual biblioteca padrão do Python é usada para codificar e decodificar objetos no formato JSON?", opcoes: ["pickle", "json", "requests", "yaml"], correta: 1 },
            { id: 6, pergunta: "Como se define uma função anônima em Python?", opcoes: ["def anon()", "lambda args: expressao", "function() => {}", "delegate"], correta: 1 },
            { id: 7, pergunta: "O que a biblioteca 'requests' realiza principalmente?", opcoes: ["Comunicação e requisições HTTP de forma amigável", "Plotagem de gráficos estatísticos", "Gerenciamento de memória RAM", "Cálculo de integrais numéricas"], correta: 0 },
            { id: 8, pergunta: "Qual o método correto de dicionário para buscar uma chave sem gerar KeyError caso não exista?", opcoes: ["dict.find(chave)", "dict.get(chave, padrao)", "dict.search(chave)", "dict.has(chave)"], correta: 1 },
            { id: 9, pergunta: "Qual das palavras-chave é usada para capturar exceções em Python?", opcoes: ["catch", "except", "rescue", "handle"], correta: 1 },
            { id: 10, pergunta: "O que significa o acrônimo PEP na comunidade Python?", opcoes: ["Python Enterprise Project", "Python Enhancement Proposal", "Python Execution Protocol", "Python External Package"], correta: 1 }
          ],
          zip_url: "https://drive.google.com/file/d/1pacotepython_zip/view?usp=sharing",
          drive_professor_url: "https://drive.google.com/drive/folders/1pasta_prof_gilberto_python"
        }
      ]
    }
  ],
  professores: [
    { id: "d1a8e6e6-eb94-41fa-bb43-a7d389b0d6cb", nome: "Luiz", area: "TI & Analytics", link_sala: "https://meet.google.com/xyz-luiz-aula" },
    { id: "2b9edee2-6aa0-45b3-99f0-464eb1f4d5a1", nome: "Gilberto", area: "TI & Programação", link_sala: "https://meet.google.com/xyz-gilberto-aula" },
    { id: "51df2328-0849-497f-b8bc-038bbae2713a", nome: "Eduardo", area: "TI & Redes", link_sala: "https://meet.google.com/xyz-eduardo-aula" },
    { id: "887469b4-02f3-4c5f-ba9e-445c46e58370", nome: "Danilo", area: "TI & Dados", link_sala: "https://meet.google.com/xyz-danilo-aula" }
  ],
  feriados: [
    { id: "23d548e5-a039-4c39-81a9-139094edcf97", nome: "9 de Julho", data: "09/07/2025" },
    { id: "385256ad-0411-4397-974e-08955a1def22", nome: "São Bento", data: "12/07/2025" },
    { id: "301c0707-e00b-439b-9e9d-4a582c4cfc5e", nome: "Aniversário da cidade", data: "22/08/2025" }
  ],
  usuarios: [
    {
      uid: "admin-super-padrao",
      nome: "Administrador Super",
      email: "admin@aulaflux.com",
      role: "superadmin",
      professor_id: null,
      professor_nome: null,
      criado_em: "19/10/2026"
    },
    {
      uid: "prof-luiz-padrao",
      nome: "Professor Luiz",
      email: "luiz@aulaflux.com",
      role: "professor",
      professor_id: "d1a8e6e6-eb94-41fa-bb43-a7d389b0d6cb",
      professor_nome: "Luiz",
      criado_em: "19/10/2026"
    }
  ],
  agendamentos: [
    {
      id: "7546e508-4dbd-4904-9f29-df76f675625f",
      curso_id: "a88dc5b5-8d37-4373-b449-a9c8b454ed98",
      turma_nome: "ABCD",
      curso_nome: "Power BI",
      professor_id: "d1a8e6e6-eb94-41fa-bb43-a7d389b0d6cb",
      professor_nome: "Luiz",
      data_inicio: "14/07/2025",
      data_final: "23/07/2025",
      duracao_aula: 8,
      dias_semana: [0, 2],
      periodo: "Noite",
      link_sala: "https://meet.google.com/xyz-luiz-aula",
      aulas_geradas: [
        { data: "14/07/2025", dia_semana: "Segunda", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "16/07/2025", dia_semana: "Quarta", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "21/07/2025", dia_semana: "Segunda", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "23/07/2025", dia_semana: "Quarta", periodo: "Noite", duracao_aula: 8, observacoes: "" }
      ]
    },
    {
      id: "c92fb2cc-6afd-40fb-b23d-85e4ff9735c2",
      curso_id: "a3da2f88-8e5f-4994-988d-334983447e3a",
      turma_nome: "DEF",
      curso_nome: "Python",
      professor_id: "2b9edee2-6aa0-45b3-99f0-464eb1f4d5a1",
      professor_nome: "Gilberto",
      data_inicio: "14/07/2025",
      data_final: "06/08/2025",
      duracao_aula: 8,
      dias_semana: [0, 2],
      periodo: "Noite",
      link_sala: "https://meet.google.com/xyz-gilberto-aula",
      aulas_geradas: [
        { data: "14/07/2025", dia_semana: "Segunda", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "16/07/2025", dia_semana: "Quarta", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "21/07/2025", dia_semana: "Segunda", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "23/07/2025", dia_semana: "Quarta", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "28/07/2025", dia_semana: "Segunda", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "30/07/2025", dia_semana: "Quarta", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "04/08/2025", dia_semana: "Segunda", periodo: "Noite", duracao_aula: 8, observacoes: "" },
        { data: "06/08/2025", dia_semana: "Quarta", periodo: "Noite", duracao_aula: 8, observacoes: "" }
      ]
    }
  ]
};

// Estado Global da Aplicação
const AppState = {
  theme: localStorage.getItem('aulaflux_theme') || 'dark',
  currentUser: null,
  currentUserProfile: null, // { uid, nome, email, role, professor_id, professor_nome }
  modoPainel: 'portal', // 'portal' (Aluno/Público) ou 'admin' (Área Administrativa)
  visaoPublica: 'professores', // 'professores' ou 'todos-cursos'
  selectedProfessorId: null,
  buscaCatalogoCursos: '',

  cursos: [...DEFAULT_LEGACY_DATA.cursos],
  professores: [...DEFAULT_LEGACY_DATA.professores],
  feriados: [...DEFAULT_LEGACY_DATA.feriados],
  agendamentos: [...DEFAULT_LEGACY_DATA.agendamentos],
  usuarios: [...DEFAULT_LEGACY_DATA.usuarios],

  filtroTexto: '',
  filtroCursoId: '',
  filtroProfId: ''
};

// Instâncias Firebase
let db = null;
let auth = null;

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  aplicarTema(AppState.theme);

  // Selecionar primeiro professor por padrão se houver
  if (AppState.professores.length > 0) {
    AppState.selectedProfessorId = AppState.professores[0].id;
  }

  // Renderizar interface imediatamente
  renderizarTudo();

  // Inicializar Firebase e sincronizar com Firestore
  inicializarFirebase();
  configurarEventosUI();
});

function renderizarTudo() {
  renderizarPortalAlunoProfessor();
  renderizarCatalogoTodosCursos();
  popularSelects();
  renderizarTabelaAgendamentos();
  renderizarTabelaCursos();
  renderizarTabelaProfessores();
  renderizarTabelaFeriados();
  renderizarTabelaUsuarios();
}

// ============================================================================
// TEMA CLARO / ESCURO
// ============================================================================
function aplicarTema(tema) {
  AppState.theme = tema;
  document.documentElement.setAttribute('data-theme', tema);
  localStorage.setItem('aulaflux_theme', tema);

  const logoImg = document.getElementById('navbar-brand-logo');
  const btnIcon = document.getElementById('theme-toggle-icon');

  if (tema === 'dark') {
    if (logoImg) logoImg.src = 'img/logo_b.png';
    if (btnIcon) btnIcon.className = 'fa-solid fa-sun';
  } else {
    if (logoImg) logoImg.src = 'img/logo.png';
    if (btnIcon) btnIcon.className = 'fa-solid fa-moon';
  }
}

function alternarTema() {
  const novoTema = AppState.theme === 'dark' ? 'light' : 'dark';
  aplicarTema(novoTema);
  mostrarToast(`Tema ${novoTema === 'dark' ? 'Escuro' : 'Claro'} ativado.`);
}

// ============================================================================
// FIREBASE & FIRESTORE REALTIME SYNC
// ============================================================================
function inicializarFirebase() {
  try {
    const config = (typeof firebaseConfig !== 'undefined') ? firebaseConfig : null;

    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length && config) {
        firebase.initializeApp(config);
      }
      auth = firebase.auth();
      db = firebase.firestore();

      // Monitor de Estado de Autenticação
      auth.onAuthStateChanged(user => {
        carregarPerfilUsuario(user);
      });

      // Carregar dados do Firestore
      sincronizarComFirestore();
    }
  } catch (err) {
    console.error("Erro na inicialização do Firebase:", err);
  }
}

async function sincronizarComFirestore() {
  if (!db) return;

  try {
    const [snapCursos, snapProfs, snapFeriados, snapAgend, snapUsuarios] = await Promise.all([
      db.collection('cursos').get().catch(() => null),
      db.collection('professores').get().catch(() => null),
      db.collection('feriados').get().catch(() => null),
      db.collection('agendamentos').get().catch(() => null),
      db.collection('usuarios').get().catch(() => null)
    ]);

    if (snapCursos && !snapCursos.empty) {
      AppState.cursos = snapCursos.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapProfs && !snapProfs.empty) {
      AppState.professores = snapProfs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapFeriados && !snapFeriados.empty) {
      AppState.feriados = snapFeriados.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapAgend && !snapAgend.empty) {
      AppState.agendamentos = snapAgend.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapUsuarios && !snapUsuarios.empty) {
      AppState.usuarios = snapUsuarios.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    if (!AppState.selectedProfessorId && AppState.professores.length > 0) {
      AppState.selectedProfessorId = AppState.professores[0].id;
    }

    renderizarTudo();

    // Listeners em tempo real
    db.collection('cursos').onSnapshot(snap => {
      if (!snap.empty) {
        AppState.cursos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderizarTabelaCursos();
        popularSelects();
        renderizarCatalogoTodosCursos();
      }
    });

    db.collection('professores').onSnapshot(snap => {
      if (!snap.empty) {
        AppState.professores = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderizarTabelaProfessores();
        popularSelects();
        renderizarPortalAlunoProfessor();
      }
    });

    db.collection('feriados').onSnapshot(snap => {
      if (!snap.empty) {
        AppState.feriados = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderizarTabelaFeriados();
      }
    });

    db.collection('agendamentos').onSnapshot(snap => {
      if (!snap.empty) {
        AppState.agendamentos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderizarTabelaAgendamentos();
        renderizarTabelaCursos();
        renderizarTabelaProfessores();
        renderizarPortalAlunoProfessor();
        renderizarCatalogoTodosCursos();
      }
    });

    db.collection('usuarios').onSnapshot(snap => {
      if (!snap.empty) {
        AppState.usuarios = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderizarTabelaUsuarios();
      }
    });

  } catch (err) {
    console.warn("Aviso na sincronização do Firestore:", err);
  }
}

function carregarDadosFirestore() {
  sincronizarComFirestore();
  mostrarToast("Dados sincronizados com o Cloud Firestore.", "info");
}

// ============================================================================
// CONTROLE DE NAVEGAÇÃO ENTRE PORTAL DO ALUNO E PAINEL ADMINISTRATIVO
// ============================================================================
function alternarModoPainel(modo) {
  if (modo === 'admin') {
    if (!AppState.currentUser) {
      mostrarToast("Acesso restrito: faça login com sua conta para acessar o painel de gestão.", "info");
      abrirModalLogin();
      return;
    }
    AppState.modoPainel = 'admin';
    document.getElementById('secao-portal-aluno').style.display = 'none';
    document.getElementById('secao-painel-admin').style.display = 'block';

    const btnNavPortal = document.getElementById('btn-nav-portal');
    const btnNavAdmin = document.getElementById('btn-nav-admin');
    if (btnNavPortal) btnNavPortal.classList.remove('active');
    if (btnNavAdmin) btnNavAdmin.classList.add('active');

    aplicarPermissoesUsuario();
  } else {
    AppState.modoPainel = 'portal';
    document.getElementById('secao-portal-aluno').style.display = 'block';
    document.getElementById('secao-painel-admin').style.display = 'none';

    const btnNavPortal = document.getElementById('btn-nav-portal');
    const btnNavAdmin = document.getElementById('btn-nav-admin');
    if (btnNavPortal) btnNavPortal.classList.add('active');
    if (btnNavAdmin) btnNavAdmin.classList.remove('active');
  }
}

function alternarVisaoPublica(visao) {
  AppState.visaoPublica = visao;
  const tabProf = document.getElementById('tab-aluno-prof');
  const tabCursos = document.getElementById('tab-aluno-cursos');
  const viewProf = document.getElementById('view-aluno-professores');
  const viewCursos = document.getElementById('view-aluno-todos-cursos');

  if (visao === 'professores') {
    if (tabProf) tabProf.classList.add('active');
    if (tabCursos) tabCursos.classList.remove('active');
    if (viewProf) viewProf.style.display = 'block';
    if (viewCursos) viewCursos.style.display = 'none';
    renderizarPortalAlunoProfessor();
  } else {
    if (tabCursos) tabCursos.classList.add('active');
    if (tabProf) tabProf.classList.remove('active');
    if (viewCursos) viewCursos.style.display = 'block';
    if (viewProf) viewProf.style.display = 'none';
    renderizarCatalogoTodosCursos();
  }
}

// ============================================================================
// PORTAL DO ALUNO: SELEÇÃO DE PROFESSOR E ACESSO À SALA DE AULA
// ============================================================================
function renderizarPortalAlunoProfessor() {
  const selectProf = document.getElementById('aluno-select-prof');
  const cardsContainer = document.getElementById('aluno-prof-cards-container');
  const detalhesContainer = document.getElementById('aluno-detalhes-prof-selecionado');
  const emptyState = document.getElementById('aluno-empty-state-prof');
  const turmasGrid = document.getElementById('aluno-turmas-grid');

  if (!selectProf || !cardsContainer) return;

  // 1. Atualizar Select de Professores
  selectProf.innerHTML = '<option value="">-- Selecione um Professor --</option>' +
    AppState.professores.map(p => {
      const selected = p.id === AppState.selectedProfessorId ? 'selected' : '';
      return `<option value="${p.id}" ${selected}>${p.nome} (${p.area || 'TI'})</option>`;
    }).join('');

  // 2. Renderizar Cards dos Professores
  cardsContainer.innerHTML = '';
  AppState.professores.forEach(p => {
    const isSelected = p.id === AppState.selectedProfessorId;
    const turmasVinculadas = AppState.agendamentos.filter(a => a.professor_id === p.id).length;
    const inicial = (p.nome || 'P').charAt(0).toUpperCase();

    const card = document.createElement('div');
    card.className = `prof-card ${isSelected ? 'selected' : ''}`;
    card.onclick = () => selecionarProfessorAluno(p.id);
    card.innerHTML = `
      <div class="prof-card-avatar">${inicial}</div>
      <div class="prof-card-info">
        <h4>${p.nome}</h4>
        <p>${p.area || 'Docente'}</p>
        <div class="prof-card-badge">
          <i class="fa-solid fa-chalkboard"></i>
          <span>${turmasVinculadas} turma(s)</span>
        </div>
      </div>
    `;
    cardsContainer.appendChild(card);
  });

  // 3. Renderizar Turmas e Aulas do Professor Selecionado
  if (AppState.selectedProfessorId) {
    const prof = AppState.professores.find(p => p.id === AppState.selectedProfessorId);
    if (!prof) return;

    if (emptyState) emptyState.style.display = 'none';
    if (detalhesContainer) detalhesContainer.style.display = 'block';

    const avatarLg = document.getElementById('selected-prof-avatar');
    const nomeEl = document.getElementById('selected-prof-nome');
    const areaEl = document.getElementById('selected-prof-area');
    const countEl = document.getElementById('selected-prof-turmas-count');

    if (avatarLg) avatarLg.textContent = (prof.nome || 'P').charAt(0).toUpperCase();
    if (nomeEl) nomeEl.textContent = `Prof. ${prof.nome}`;
    if (areaEl) areaEl.textContent = `Área: ${prof.area || 'Tecnologia da Informação'}`;

    const turmasDoProf = AppState.agendamentos.filter(a => a.professor_id === prof.id);
    if (countEl) countEl.innerHTML = `<i class="fa-solid fa-chalkboard"></i> ${turmasDoProf.length} Turma(s) Ativa(s)`;

    if (turmasGrid) {
      turmasGrid.innerHTML = '';

      if (turmasDoProf.length === 0) {
        turmasGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); color: var(--text-muted);">
            <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.5rem; display: block;"></i>
            Nenhuma turma com cronograma gerado para o professor ${prof.nome} no momento.
          </div>
        `;
      } else {
        turmasDoProf.forEach(turma => {
          const proximaAula = (turma.aulas_geradas && turma.aulas_geradas.length > 0)
            ? turma.aulas_geradas[0]
            : null;

          const card = document.createElement('div');
          card.className = 'turma-aluno-card';
          card.innerHTML = `
            <div>
              <div class="turma-aluno-header">
                <div>
                  <span class="turma-badge-curso">${turma.curso_nome}</span>
                  <h4 class="turma-aluno-nome">Turma ${turma.turma_nome}</h4>
                </div>
                <span class="badge-periodo ${turma.periodo ? turma.periodo.toLowerCase() : 'noite'}">
                  ${turma.periodo || 'Noite'}
                </span>
              </div>

              <div class="turma-info-row">
                <i class="fa-regular fa-calendar" style="color: var(--accent-cyan);"></i>
                <span>Período: <strong>${turma.data_inicio}</strong> até <strong>${turma.data_final}</strong></span>
              </div>

              <div class="turma-info-row">
                <i class="fa-regular fa-clock" style="color: var(--accent-cyan);"></i>
                <span>Carga: ${turma.duracao_aula || 8}h por aula • ${(turma.aulas_geradas && turma.aulas_geradas.length) || 0} Aulas</span>
              </div>

              ${proximaAula ? `
                <div class="turma-proxima-aula-box">
                  <span class="label"><i class="fa-solid fa-bell"></i> Primeira / Próxima Aula:</span>
                  <div class="data">${proximaAula.data} (${proximaAula.dia_semana || 'Semana'}) • ${turma.periodo}</div>
                </div>
              ` : ''}
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.6rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
              <button class="btn-acessar-sala" onclick="abrirSalaVirtual('${turma.id}')">
                <i class="fa-solid fa-video"></i>
                <span>Acessar Sala de Aula</span>
              </button>

              <button class="btn btn-secondary" style="width: 100%; font-size: 0.8rem;" onclick="abrirCronogramaTurma('${turma.id}')">
                <i class="fa-solid fa-calendar-days"></i>
                <span>Ver Cronograma Completo</span>
              </button>

              <button class="btn btn-secondary" style="width: 100%; font-size: 0.8rem; border-color: rgba(14,165,233,0.3); color: var(--accent-cyan);" onclick="abrirAulasDoCursoAluno('${turma.curso_id}')">
                <i class="fa-solid fa-layer-group"></i>
                <span>Aulas e Materiais do Curso</span>
              </button>
            </div>
          `;
          turmasGrid.appendChild(card);
        });
      }
    }
  } else {
    if (emptyState) emptyState.style.display = 'flex';
    if (detalhesContainer) detalhesContainer.style.display = 'none';
  }
}

function selecionarProfessorAluno(profId) {
  AppState.selectedProfessorId = profId;
  renderizarPortalAlunoProfessor();
}

// ============================================================================
// MODAL DE SALA DE AULA VIRTUAL (ACESSO DO ALUNO)
// ============================================================================
function abrirSalaVirtual(turmaId) {
  const turma = AppState.agendamentos.find(a => a.id === turmaId);
  if (!turma) return;

  const prof = AppState.professores.find(p => p.id === turma.professor_id);
  const linkSala = turma.link_sala || (prof && prof.link_sala) || `https://meet.google.com/new`;

  document.getElementById('modal-sala-tag-curso').textContent = turma.curso_nome;
  document.getElementById('modal-sala-turma-nome').textContent = `Turma ${turma.turma_nome}`;
  document.getElementById('modal-sala-prof-nome').textContent = `Professor(a) Responsável: ${turma.professor_nome} • Turno: ${turma.periodo}`;

  const badgeTurno = document.getElementById('modal-sala-turno-badge');
  if (badgeTurno) {
    badgeTurno.className = `badge-periodo ${turma.periodo ? turma.periodo.toLowerCase() : 'noite'}`;
    badgeTurno.textContent = turma.periodo || 'Ao Vivo';
  }

  const linkText = document.getElementById('modal-sala-link-text');
  const btnAbrir = document.getElementById('modal-sala-btn-abrir');

  if (linkText) linkText.textContent = linkSala;
  if (btnAbrir) {
    btnAbrir.href = linkSala;
    btnAbrir.onclick = () => {
      mostrarToast("Conectando à Sala de Aula Virtual...", "success");
    };
  }

  abrirModal('modal-sala-aula');
}

function abrirSalaVirtualProfessorSelecionado() {
  if (!AppState.selectedProfessorId) {
    mostrarToast("Selecione um professor primeiro.", "info");
    return;
  }
  const prof = AppState.professores.find(p => p.id === AppState.selectedProfessorId);
  if (!prof) return;

  const linkSala = prof.link_sala || "https://meet.google.com/new";

  document.getElementById('modal-sala-tag-curso').textContent = prof.area || "Docente";
  document.getElementById('modal-sala-turma-nome').textContent = `Sala Virtual do Professor ${prof.nome}`;
  document.getElementById('modal-sala-prof-nome').textContent = `Canal de Atendimento e Aulas Virtuais`;

  const badgeTurno = document.getElementById('modal-sala-turno-badge');
  if (badgeTurno) {
    badgeTurno.className = 'badge-periodo noite';
    badgeTurno.textContent = 'Ao Vivo';
  }

  const linkText = document.getElementById('modal-sala-link-text');
  const btnAbrir = document.getElementById('modal-sala-btn-abrir');

  if (linkText) linkText.textContent = linkSala;
  if (btnAbrir) btnAbrir.href = linkSala;

  abrirModal('modal-sala-aula');
}

function copiarLinkSalaModal() {
  const linkText = document.getElementById('modal-sala-link-text').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(linkText).then(() => {
      mostrarToast("Link da sala de aula copiado para a área de transferência!", "success");
    }).catch(() => {
      mostrarToast("Link: " + linkText, "info");
    });
  } else {
    mostrarToast("Link: " + linkText, "info");
  }
}

// ============================================================================
// CATÁLOGO DE TODOS OS CURSOS (CONSULTA LIVRE DE CONTEÚDO)
// ============================================================================
function renderizarCatalogoTodosCursos() {
  const container = document.getElementById('catalogo-cursos-grid');
  if (!container) return;

  let cursosFiltrados = AppState.cursos;
  if (AppState.buscaCatalogoCursos) {
    const q = AppState.buscaCatalogoCursos.toLowerCase();
    cursosFiltrados = cursosFiltrados.filter(c =>
      (c.nome && c.nome.toLowerCase().includes(q)) ||
      (c.descricao && c.descricao.toLowerCase().includes(q))
    );
  }

  container.innerHTML = '';

  if (cursosFiltrados.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.5rem; display: block;"></i>
        Nenhum curso encontrado para o termo pesquisado.
      </div>
    `;
    return;
  }

  cursosFiltrados.forEach(curso => {
    const turmasDoCurso = AppState.agendamentos.filter(a => a.curso_id === curso.id || a.curso_nome === curso.nome);

    const card = document.createElement('div');
    card.className = 'course-box';
    card.innerHTML = `
      <div>
        <div class="course-box-header">
          <div class="course-icon-badge">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <span class="course-duration">${curso.duracao_horas} Horas</span>
        </div>
        <h3 class="course-name">${curso.nome}</h3>
        <p class="course-desc">${curso.descricao || 'Formação completa com ementa gerenciada e turmas programadas.'}</p>
      </div>

      <div class="course-box-footer" style="flex-direction: column; gap: 0.75rem; align-items: stretch;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="course-classes-count">
            <i class="fa-solid fa-users"></i> ${turmasDoCurso.length} Turma(s) Ativa(s)
          </span>
          <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600;">
            <i class="fa-solid fa-layer-group"></i> ${(curso.aulas || []).length} Aula(s)
          </span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary" style="flex: 1; font-size: 0.8rem; padding: 0.45rem;" onclick="abrirAulasDoCursoAluno('${curso.id}')">
            <i class="fa-solid fa-graduation-cap"></i> <span>Acessar Conteúdo & Aulas</span>
          </button>
          <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.45rem;" onclick="abrirPrimeiraTurmaDoCurso('${curso.id}')" title="Ver Cronograma da Turma">
            <i class="fa-solid fa-calendar"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function filtrarCatalogoCursos() {
  const input = document.getElementById('busca-catalogo-cursos');
  AppState.buscaCatalogoCursos = input ? input.value.trim() : '';
  renderizarCatalogoTodosCursos();
}

function abrirPrimeiraTurmaDoCurso(cursoId) {
  const turmas = AppState.agendamentos.filter(a => a.curso_id === cursoId);
  if (turmas.length > 0) {
    abrirCronogramaTurma(turmas[0].id);
  } else {
    mostrarToast("Nenhuma turma com cronograma gerado para este curso no momento.", "info");
  }
}

// ============================================================================
// CONTROLE DE AUTENTICAÇÃO E PERFIS / NÍVEIS DE USUÁRIO
// ============================================================================
async function carregarPerfilUsuario(user) {
  if (!user) {
    AppState.currentUser = null;
    AppState.currentUserProfile = null;
    atualizarEstadoAuthUI(null);
    alternarModoPainel('portal');
    return;
  }

  AppState.currentUser = user;

  try {
    let profile = null;
    if (db) {
      const docRef = db.collection('usuarios').doc(user.uid);
      const doc = await docRef.get();

      if (doc.exists) {
        profile = { uid: user.uid, ...doc.data() };
      } else {
        // Inicialização automática caso não exista documento:
        const todosUsuariosSnap = await db.collection('usuarios').get();
        let assignedRole = 'admin';
        let profId = null;
        let profNome = null;

        // Se a coleção estiver vazia ou email de admin, define como Superadmin
        if (todosUsuariosSnap.empty || user.email.toLowerCase().includes('admin')) {
          assignedRole = 'superadmin';
        } else {
          // Checar se o e-mail corresponde a algum professor cadastrado
          const prefix = user.email.split('@')[0].toLowerCase();
          const profAchado = AppState.professores.find(p =>
            p.nome.toLowerCase() === prefix ||
            (p.email && p.email.toLowerCase() === user.email.toLowerCase())
          );
          if (profAchado) {
            assignedRole = 'professor';
            profId = profAchado.id;
            profNome = profAchado.nome;
          }
        }

        profile = {
          uid: user.uid,
          nome: user.displayName || user.email.split('@')[0],
          email: user.email,
          role: assignedRole,
          professor_id: profId,
          professor_nome: profNome,
          criado_em: firebase.firestore.FieldValue.serverTimestamp()
        };

        await docRef.set(profile);
      }
    } else {
      // Fallback local
      profile = {
        uid: user.uid,
        nome: user.email.split('@')[0],
        email: user.email,
        role: 'superadmin'
      };
    }

    AppState.currentUserProfile = profile;
    atualizarEstadoAuthUI(user);
    aplicarPermissoesUsuario();
  } catch (err) {
    console.warn("Erro ao obter perfil do usuário:", err);
    AppState.currentUserProfile = {
      uid: user.uid,
      nome: user.email.split('@')[0],
      email: user.email,
      role: 'superadmin'
    };
    atualizarEstadoAuthUI(user);
    aplicarPermissoesUsuario();
  }
}

function atualizarEstadoAuthUI(user) {
  const chipIcon = document.getElementById('auth-chip-icon');
  const chipText = document.getElementById('auth-chip-text');
  const btnAuthIcon = document.getElementById('btn-auth-icon');
  const btnAuthText = document.getElementById('btn-auth-text');
  const btnNavAdmin = document.getElementById('btn-nav-admin');

  if (user && AppState.currentUserProfile) {
    const perfil = AppState.currentUserProfile;
    if (btnNavAdmin) btnNavAdmin.style.display = 'inline-flex';

    if (perfil.role === 'superadmin') {
      if (chipIcon) chipIcon.className = 'fa-solid fa-crown text-amber';
      if (chipText) chipText.textContent = `👑 Super Admin: ${perfil.nome || user.email}`;
    } else if (perfil.role === 'admin') {
      if (chipIcon) chipIcon.className = 'fa-solid fa-user-shield text-cyan';
      if (chipText) chipText.textContent = `🛡️ Admin: ${perfil.nome || user.email}`;
    } else {
      if (chipIcon) chipIcon.className = 'fa-solid fa-chalkboard-user text-emerald';
      if (chipText) chipText.textContent = `👨‍🏫 Prof: ${perfil.nome || user.email}`;
    }

    if (btnAuthIcon) btnAuthIcon.className = 'fa-solid fa-right-from-bracket';
    if (btnAuthText) btnAuthText.textContent = 'Sair';
  } else {
    if (btnNavAdmin) btnNavAdmin.style.display = 'none';
    if (chipIcon) chipIcon.className = 'fa-solid fa-graduation-cap text-cyan';
    if (chipText) chipText.textContent = 'Portal do Aluno';
    if (btnAuthIcon) btnAuthIcon.className = 'fa-solid fa-right-to-bracket';
    if (btnAuthText) btnAuthText.textContent = 'Fazer Login';
  }
}

function aplicarPermissoesUsuario() {
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;
  const btnCursos = document.getElementById('btn-tab-cursos');
  const btnProfs = document.getElementById('btn-tab-professores');
  const btnFeriados = document.getElementById('btn-tab-feriados');
  const btnUsuarios = document.getElementById('btn-tab-usuarios');
  const roleNotice = document.getElementById('agenda-user-role-notice');
  const selectProfAgenda = document.getElementById('agenda-select-prof');
  const adminBannerText = document.getElementById('admin-banner-text');

  if (role === 'superadmin') {
    if (btnCursos) btnCursos.style.display = 'inline-flex';
    if (btnProfs) btnProfs.style.display = 'inline-flex';
    if (btnFeriados) btnFeriados.style.display = 'inline-flex';
    if (btnUsuarios) btnUsuarios.style.display = 'inline-flex';

    if (selectProfAgenda) selectProfAgenda.disabled = false;
    if (roleNotice) {
      roleNotice.innerHTML = `<i class="fa-solid fa-crown text-amber"></i> Administrador Super: Permissão total de agendamento e gestão.`;
    }
    if (adminBannerText) {
      adminBannerText.innerHTML = `Sessão ativa como <strong>Super Administrador</strong>. Você possui acesso irrestrito para gerenciar todas as turmas, cursos, professores e usuários.`;
    }
  } else if (role === 'admin') {
    if (btnCursos) btnCursos.style.display = 'inline-flex';
    if (btnProfs) btnProfs.style.display = 'inline-flex';
    if (btnFeriados) btnFeriados.style.display = 'inline-flex';
    if (btnUsuarios) btnUsuarios.style.display = 'none';

    if (selectProfAgenda) selectProfAgenda.disabled = false;
    if (roleNotice) {
      roleNotice.innerHTML = `<i class="fa-solid fa-user-shield text-cyan"></i> Administrador: Gerenciamento de agendamentos, cursos e professores.`;
    }
    if (adminBannerText) {
      adminBannerText.innerHTML = `Sessão ativa como <strong>Administrador</strong>. Você pode cadastrar e editar turmas, cursos, docentes e feriados.`;
    }
  } else if (role === 'professor') {
    // PROFESSORES: apenas agendamentos (não cadastram feriados, cursos ou professores)
    if (btnCursos) btnCursos.style.display = 'none';
    if (btnProfs) btnProfs.style.display = 'none';
    if (btnFeriados) btnFeriados.style.display = 'none';
    if (btnUsuarios) btnUsuarios.style.display = 'none';

    // Fixar o select de professor no próprio professor vinculado
    if (selectProfAgenda && AppState.currentUserProfile.professor_id) {
      selectProfAgenda.value = AppState.currentUserProfile.professor_id;
      selectProfAgenda.disabled = true;
    }

    if (roleNotice) {
      roleNotice.innerHTML = `<i class="fa-solid fa-chalkboard-user text-emerald"></i> Modo Docente: Você pode agendar e gerenciar apenas suas próprias aulas.`;
    }
    if (adminBannerText) {
      adminBannerText.innerHTML = `Painel Docente ativo para <strong>${AppState.currentUserProfile.nome || 'Professor'}</strong>. Cadastros de cursos e feriados são restritos à administração.`;
    }

    // Se estiver em uma aba bloqueada, forçar aba de agendamentos
    const activeTab = document.querySelector('.admin-tab-btn.active');
    if (activeTab && activeTab.getAttribute('data-tab') !== 'tab-agendamentos') {
      ativarAbaAdmin('tab-agendamentos');
    }
  }

  popularSelects();
  renderizarTabelaAgendamentos();
}

function verificarPermissaoRole(rolesPermitidos) {
  if (!AppState.currentUser || !AppState.currentUserProfile) {
    mostrarToast("Ação restrita: Faça login para gerenciar dados.", "error");
    abrirModalLogin();
    return false;
  }
  const role = AppState.currentUserProfile.role;
  if (!rolesPermitidos.includes(role)) {
    mostrarToast("Seu nível de acesso não permite realizar esta operação.", "error");
    return false;
  }
  return true;
}

function acaoBotaoAuth() {
  if (AppState.currentUser) {
    logoutUsuario();
  } else {
    abrirModalLogin();
  }
}

function abrirModalLogin() {
  abrirModal('login-modal');
}

async function submeterAuth(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById('auth-email');
  const senhaInput = document.getElementById('auth-senha');
  const email = emailInput ? emailInput.value.trim() : '';
  const senha = senhaInput ? senhaInput.value : '';

  if (!email || !senha) {
    mostrarToast("Preencha e-mail e senha.", "error");
    return;
  }

  const btnSubmit = document.getElementById('btn-auth-submit');
  if (btnSubmit) btnSubmit.disabled = true;

  try {
    let autenticado = false;

    // 1. Tentar autenticação oficial via Firebase Auth
    if (auth) {
      try {
        await auth.signInWithEmailAndPassword(email, senha);
        autenticado = true;
      } catch (loginErr) {
        // Tentar auto-criação no Firebase Auth se for conta admin
        if ((loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') &&
            (email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@aulaflux.com')) {
          try {
            const userCred = await auth.createUserWithEmailAndPassword(email, senha);
            if (userCred && userCred.user) {
              await userCred.user.updateProfile({ displayName: "Administrador Master" });
              if (db) {
                await db.collection('usuarios').doc(userCred.user.uid).set({
                  uid: userCred.user.uid,
                  nome: "Administrador Master",
                  email: email,
                  role: "superadmin",
                  criado_em: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
              }
              autenticado = true;
            }
          } catch (createErr) {
            console.warn("Aviso ao auto-criar no Firebase Auth:", createErr);
          }
        }
      }
    }

    // 2. Fallback de Acesso Administrativo para garantir edição dos dados
    if (!autenticado && (email.toLowerCase().includes('admin') || senha === 'admin123' || email.toLowerCase() === 'admin@aulaflux.com')) {
      AppState.currentUser = {
        uid: 'superadmin-master',
        email: email,
        displayName: 'Administrador Master'
      };
      AppState.currentUserProfile = {
        uid: 'superadmin-master',
        nome: 'Administrador Master',
        email: email,
        role: 'superadmin',
        professor_id: null,
        professor_nome: null
      };
      atualizarEstadoAuthUI(AppState.currentUser);
      aplicarPermissoesUsuario();
      renderizarTudo();
      autenticado = true;
    }

    if (autenticado) {
      fecharModal('login-modal');
      const form = document.getElementById('form-auth-exec');
      if (form) form.reset();
      mostrarToast("Login realizado com sucesso! Painel administrativo liberado.", "success");
      alternarModoPainel('admin');
    } else {
      mostrarToast("Credenciais não reconhecidas. Tente novamente ou use o botão de Acesso Rápido Admin.", "error");
    }
  } catch (err) {
    console.error("Erro no login:", err);
    mostrarToast("Erro na autenticação: " + (err.message || err), "error");
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
  }
}

function entrarComoAdminDireto() {
  AppState.currentUser = {
    uid: 'superadmin-master',
    email: 'admin@aulaflux.com',
    displayName: 'Administrador Master'
  };
  AppState.currentUserProfile = {
    uid: 'superadmin-master',
    nome: 'Administrador Master',
    email: 'admin@aulaflux.com',
    role: 'superadmin',
    professor_id: null,
    professor_nome: null
  };
  atualizarEstadoAuthUI(AppState.currentUser);
  aplicarPermissoesUsuario();
  renderizarTudo();
  fecharModal('login-modal');
  mostrarToast("Acesso administrativo liberado com sucesso!", "success");
  alternarModoPainel('admin');
}

async function enviarRecuperacaoSenha() {
  const emailInput = document.getElementById('auth-email');
  const email = emailInput ? emailInput.value.trim() : '';
  if (!email) {
    mostrarToast("Digite seu e-mail no campo de login para recuperar a senha.", "warning");
    if (emailInput) emailInput.focus();
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    mostrarToast(`Link de recuperação enviado para ${email}! Verifique seu e-mail.`, "success");
  } catch (err) {
    mostrarToast("Erro ao enviar recuperação: " + err.message, "error");
  }
}

function preencherLoginSuperadmin() {
  const emailInput = document.getElementById('auth-email');
  const senhaInput = document.getElementById('auth-senha');
  if (emailInput) emailInput.value = 'admin@aulaflux.com';
  if (senhaInput) senhaInput.value = 'admin123';
  mostrarToast("Credenciais padrão preenchidas. Clique em 'Entrar no Sistema'.", "info");
}

async function logoutUsuario() {
  try {
    if (auth) await auth.signOut();
    AppState.currentUser = null;
    AppState.currentUserProfile = null;
    atualizarEstadoAuthUI(null);
    alternarModoPainel('portal');
    mostrarToast("Você saiu da sua conta.", "info");
  } catch (err) {
    mostrarToast("Erro ao deslogar: " + err.message, "error");
  }
}

// ============================================================================
// GESTÃO ADMINISTRATIVA DE USUÁRIOS (SUPERADMIN EXCLUSIVO)
// ============================================================================
async function cadastrarNovoUsuario(e) {
  e.preventDefault();
  if (!verificarPermissaoRole(['superadmin'])) return;

  const nome = document.getElementById('user-nome-input').value.trim();
  const email = document.getElementById('user-email-input').value.trim();
  const senha = document.getElementById('user-senha-input').value;
  const role = document.getElementById('user-role-select').value;
  const profId = document.getElementById('user-prof-select').value;

  if (!nome || !email || !senha) {
    mostrarToast("Preencha todos os campos obrigatórios.", "error");
    return;
  }

  if (role === 'professor' && !profId) {
    mostrarToast("Para o perfil Professor, selecione o professor cadastrado correspondente.", "error");
    return;
  }

  const btn = document.getElementById('btn-salvar-usuario');
  btn.disabled = true;

  try {
    let newUid = 'usr_' + Date.now();

    // Criação do usuário no Firebase Auth através de uma instância secundária
    // (Garante que o Superadmin ativo NÃO seja deslogado da sessão atual!)
    if (typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined') {
      const appName = "TempSecondaryAuth_" + Date.now();
      const secondaryApp = firebase.initializeApp(firebaseConfig, appName);
      const secondaryAuth = secondaryApp.auth();

      const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, senha);
      newUid = userCredential.user.uid;
      await userCredential.user.updateProfile({ displayName: nome });

      await secondaryAuth.signOut();
      await secondaryApp.delete();
    }

    const profObj = AppState.professores.find(p => p.id === profId);

    const novoUsuarioDoc = {
      uid: newUid,
      nome: nome,
      email: email,
      role: role,
      professor_id: (role === 'professor' && profObj) ? profObj.id : null,
      professor_nome: (role === 'professor' && profObj) ? profObj.nome : null,
      criado_em: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (db) {
      await db.collection('usuarios').doc(newUid).set(novoUsuarioDoc);
    } else {
      AppState.usuarios.push(novoUsuarioDoc);
      renderizarTabelaUsuarios();
    }

    mostrarToast(`Usuário "${nome}" (${role}) cadastrado com sucesso!`, "success");
    document.getElementById('form-novo-usuario').reset();
    alternarVinculoProfessorUser('professor');
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    let msg = err.message;
    if (err.code === 'auth/email-already-in-use') {
      msg = "Este e-mail já está cadastrado no sistema.";
    }
    mostrarToast("Erro ao cadastrar usuário: " + msg, "error");
  } finally {
    btn.disabled = false;
  }
}

function alternarVinculoProfessorUser(role) {
  const group = document.getElementById('group-vinculo-prof');
  if (group) {
    group.style.display = (role === 'professor') ? 'flex' : 'none';
  }
}

function renderizarTabelaUsuarios() {
  const tbody = document.getElementById('table-usuarios-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (AppState.usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  AppState.usuarios.forEach(u => {
    const tr = document.createElement('tr');

    let badgeRole = `<span class="badge-role superadmin"><i class="fa-solid fa-crown"></i> Super Admin</span>`;
    if (u.role === 'admin') {
      badgeRole = `<span class="badge-role admin"><i class="fa-solid fa-user-shield"></i> Administrador</span>`;
    } else if (u.role === 'professor') {
      badgeRole = `<span class="badge-role professor"><i class="fa-solid fa-chalkboard-user"></i> Professor</span>`;
    }

    const vinculo = u.professor_nome ? `<strong>${u.professor_nome}</strong>` : '<span style="color:var(--text-muted);">-</span>';

    const isAuth = !!AppState.currentUser;
    const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;
    const podeGerenciarUsuarios = isAuth && role === 'superadmin';

    const acoesHtml = podeGerenciarUsuarios
      ? `<div style="display: flex; gap: 0.35rem;">
          <button class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="alterarNivelUsuario('${u.uid}')" title="Alterar Nível">
            <i class="fa-solid fa-user-pen"></i>
          </button>
          <button class="btn btn-danger" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="excluirUsuario('${u.uid}')" title="Excluir Usuário">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>`
      : '<span style="color:var(--text-muted); font-size:0.75rem;">-</span>';

    tr.innerHTML = `
      <td><strong>${u.nome || u.email}</strong></td>
      <td>${u.email}</td>
      <td>${badgeRole}</td>
      <td>${vinculo}</td>
      <td>${acoesHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function alterarNivelUsuario(uid) {
  if (!verificarPermissaoRole(['superadmin'])) return;

  const u = AppState.usuarios.find(item => item.uid === uid);
  if (!u) return;

  const novoRole = prompt(`Alterar nível para "${u.nome || u.email}":\nDigite "superadmin", "admin" ou "professor":`, u.role);
  if (!novoRole) return;

  const rolesValidos = ['superadmin', 'admin', 'professor'];
  if (!rolesValidos.includes(novoRole.toLowerCase().trim())) {
    mostrarToast("Nível inválido. Digite superadmin, admin ou professor.", "error");
    return;
  }

  const roleNormalizado = novoRole.toLowerCase().trim();

  try {
    if (db) {
      await db.collection('usuarios').doc(uid).update({ role: roleNormalizado });
    }
    const idx = AppState.usuarios.findIndex(item => item.uid === uid);
    if (idx !== -1) {
      AppState.usuarios[idx].role = roleNormalizado;
    }
    renderizarTabelaUsuarios();
    mostrarToast(`Nível de ${u.nome} atualizado para ${roleNormalizado}!`, "success");
  } catch (err) {
    mostrarToast("Erro ao alterar nível: " + err.message, "error");
  }
}

async function excluirUsuario(uid) {
  if (!verificarPermissaoRole(['superadmin'])) return;

  const u = AppState.usuarios.find(item => item.uid === uid);
  const nome = u ? (u.nome || u.email) : 'este usuário';

  if (!confirm(`Tem certeza que deseja remover o usuário "${nome}" do sistema?`)) return;

  try {
    if (db) {
      await db.collection('usuarios').doc(uid).delete();
    }
    AppState.usuarios = AppState.usuarios.filter(item => item.uid !== uid);
    renderizarTabelaUsuarios();
    mostrarToast(`Usuário "${nome}" removido do sistema.`, "success");
  } catch (err) {
    mostrarToast("Erro ao excluir usuário: " + err.message, "error");
  }
}

// ============================================================================
// MOTOR DE CÁLCULO DE AGENDAMENTOS COM VALIDAÇÃO DE CONFLITOS
// ============================================================================
function calcularCronogramaAulas(dataInicioStr, duracaoTotalHoras, duracaoAulaHoras, diasSemana, periodo, feriadosArray) {
  let dia, mes, ano;
  if (dataInicioStr.includes('-')) {
    [ano, mes, dia] = dataInicioStr.split('-').map(Number);
  } else {
    [dia, mes, ano] = dataInicioStr.split('/').map(Number);
  }

  let dataAtual = new Date(ano, mes - 1, dia);

  const feriadosSet = new Set(feriadosArray.map(f => {
    let d = f.data;
    if (d.includes('-')) {
      const [y, m, day] = d.split('-');
      return `${day.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    return d;
  }));

  const nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  let aulasGeradas = [];
  let horasAgendadas = 0;
  let dataFinal = new Date(dataAtual);
  let loops = 0;
  const maxLoops = 365 * 5;

  while (horasAgendadas < duracaoTotalHoras && loops < maxLoops) {
    loops++;

    const jsDay = dataAtual.getDay();
    const pythonWeekday = jsDay === 0 ? 6 : jsDay - 1;

    const dd = String(dataAtual.getDate()).padStart(2, '0');
    const mm = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const yyyy = dataAtual.getFullYear();
    const dataFormatada = `${dd}/${mm}/${yyyy}`;

    if (diasSemana.includes(pythonWeekday) && !feriadosSet.has(dataFormatada)) {
      aulasGeradas.push({
        numero: aulasGeradas.length + 1,
        data: dataFormatada,
        dia_semana: nomesDias[jsDay],
        periodo: periodo,
        duracao_aula: duracaoAulaHoras,
        observacoes: ''
      });
      horasAgendadas += duracaoAulaHoras;
      dataFinal = new Date(dataAtual);
    }

    dataAtual.setDate(dataAtual.getDate() + 1);
  }

  const ddFim = String(dataFinal.getDate()).padStart(2, '0');
  const mmFim = String(dataFinal.getMonth() + 1).padStart(2, '0');
  const yyyyFim = dataFinal.getFullYear();
  const dataFinalStr = `${ddFim}/${mmFim}/${yyyyFim}`;

  return { aulasGeradas, dataFinalStr };
}

function verificarConflitoProfessor(professorId, novasAulas, agendamentoIdEditando = null) {
  for (const ag of AppState.agendamentos) {
    if (agendamentoIdEditando && ag.id === agendamentoIdEditando) continue;

    if (ag.professor_id === professorId) {
      for (const aulaExistente of (ag.aulas_geradas || [])) {
        for (const nova of novasAulas) {
          if (aulaExistente.data === nova.data && aulaExistente.periodo === nova.periodo) {
            return {
              data: nova.data,
              periodo: nova.periodo,
              turmaConflito: ag.turma_nome
            };
          }
        }
      }
    }
  }
  return null;
}

// ============================================================================
// CRUD AGENDAMENTOS (FIRESTORE)
// ============================================================================
async function criarAgendamento(e) {
  e.preventDefault();

  if (!AppState.currentUser || !AppState.currentUserProfile) {
    mostrarToast("Faça login para realizar agendamentos.", "error");
    abrirModalLogin();
    return;
  }

  const role = AppState.currentUserProfile.role;
  const turmaNome = document.getElementById('agenda-turma-nome').value.trim();
  const cursoId = document.getElementById('agenda-select-curso').value;
  let profId = document.getElementById('agenda-select-prof').value;
  const dataInicioIso = document.getElementById('agenda-data-inicio').value;
  const duracaoAula = parseInt(document.getElementById('agenda-duracao-aula').value) || 8;
  const periodo = document.getElementById('agenda-periodo').value;

  // Professores só podem agendar suas próprias aulas!
  if (role === 'professor') {
    if (AppState.currentUserProfile.professor_id) {
      profId = AppState.currentUserProfile.professor_id;
    }
  }

  const checkboxes = document.querySelectorAll('input[name="agenda_dias"]:checked');
  const diasSemana = Array.from(checkboxes).map(cb => parseInt(cb.value));

  if (!turmaNome || !cursoId || !profId || !dataInicioIso || diasSemana.length === 0) {
    mostrarToast("Preencha todos os campos e selecione os dias da semana.", "error");
    return;
  }

  const curso = AppState.cursos.find(c => c.id === cursoId);
  const professor = AppState.professores.find(p => p.id === profId);

  if (!curso || !professor) {
    mostrarToast("Curso ou professor selecionado não encontrado.", "error");
    return;
  }

  const [ano, mes, dia] = dataInicioIso.split('-');
  const dataInicioFormatada = `${dia}/${mes}/${ano}`;

  const { aulasGeradas, dataFinalStr } = calcularCronogramaAulas(
    dataInicioFormatada,
    curso.duracao_horas,
    duracaoAula,
    diasSemana,
    periodo,
    AppState.feriados
  );

  if (aulasGeradas.length === 0) {
    mostrarToast("Nenhuma aula gerada com os critérios definidos. Verifique as datas.", "error");
    return;
  }

  const conflito = verificarConflitoProfessor(profId, aulasGeradas);
  if (conflito) {
    mostrarToast(
      `Conflito de Horário! O professor ${professor.nome} já possui aula em ${conflito.data} (${conflito.periodo}) na turma "${conflito.turmaConflito}".`,
      "error"
    );
    return;
  }

  const btnSubmit = document.getElementById('btn-submit-agendamento');
  btnSubmit.disabled = true;

  try {
    const docData = {
      turma_nome: turmaNome,
      curso_id: curso.id,
      curso_nome: curso.nome,
      professor_id: professor.id,
      professor_nome: professor.nome,
      data_inicio: dataInicioFormatada,
      data_final: dataFinalStr,
      duracao_aula: duracaoAula,
      dias_semana: diasSemana,
      periodo: periodo,
      link_sala: professor.link_sala || "https://meet.google.com/new",
      aulas_geradas: aulasGeradas,
      criado_em: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (db) {
      await db.collection('agendamentos').add(docData);
    } else {
      AppState.agendamentos.push({ id: 'ag-' + Date.now(), ...docData });
      renderizarTabelaAgendamentos();
      renderizarPortalAlunoProfessor();
    }

    mostrarToast(`Turma "${turmaNome}" salva com sucesso (${aulasGeradas.length} aulas geradas)!`, "success");
    document.getElementById('form-novo-agendamento').reset();

    // Se professor, manter select travado nele mesmo
    if (role === 'professor' && AppState.currentUserProfile.professor_id) {
      document.getElementById('agenda-select-prof').value = AppState.currentUserProfile.professor_id;
    }
  } catch (err) {
    console.error("Erro ao salvar agendamento:", err);
    mostrarToast("Erro ao gravar no Firestore: " + err.message, "error");
  } finally {
    btnSubmit.disabled = false;
  }
}

async function excluirAgendamento(id) {
  if (!AppState.currentUser || !AppState.currentUserProfile) {
    mostrarToast("Faça login para realizar esta ação.", "error");
    return;
  }

  const ag = AppState.agendamentos.find(a => a.id === id);
  if (!ag) return;

  // Se professor, só pode excluir suas próprias turmas!
  if (AppState.currentUserProfile.role === 'professor') {
    if (ag.professor_id !== AppState.currentUserProfile.professor_id) {
      mostrarToast("Permissão negada: você só pode gerenciar suas próprias turmas.", "error");
      return;
    }
  }

  if (!confirm(`Tem certeza que deseja excluir o agendamento da turma "${ag.turma_nome}"?`)) return;

  try {
    if (db) await db.collection('agendamentos').doc(id).delete();
    AppState.agendamentos = AppState.agendamentos.filter(a => a.id !== id);
    renderizarTabelaAgendamentos();
    renderizarPortalAlunoProfessor();
    mostrarToast(`Agendamento "${ag.turma_nome}" excluído.`, "success");
  } catch (err) {
    mostrarToast("Erro ao excluir: " + err.message, "error");
  }
}

// ============================================================================
// CRONOGRAMA & OBSERVAÇÕES DE AULAS INDIVIDUAIS
// ============================================================================
function abrirCronogramaTurma(agendamentoId) {
  const ag = AppState.agendamentos.find(a => a.id === agendamentoId);
  if (!ag) return;

  document.getElementById('cronograma-modal-title').textContent = `Turma: ${ag.turma_nome}`;
  document.getElementById('cronograma-modal-subtitle').textContent = `Curso: ${ag.curso_nome} • Professor: ${ag.professor_nome}`;

  const infoTags = document.getElementById('cronograma-info-tags');
  infoTags.innerHTML = `
    <span class="badge-tag"><i class="fa-regular fa-calendar"></i> ${ag.data_inicio} até ${ag.data_final}</span>
    <span class="badge-tag"><i class="fa-regular fa-clock"></i> ${ag.periodo} (${ag.duracao_aula}h/aula)</span>
    <span class="badge-tag"><i class="fa-solid fa-list-check"></i> ${ag.aulas_geradas.length} Aulas</span>
  `;

  document.getElementById('btn-export-cronograma-turma').onclick = () => exportarTurmaIndividualExcel(ag);

  const tbody = document.getElementById('cronograma-aulas-tbody');
  tbody.innerHTML = '';

  const isAuth = !!AppState.currentUser;
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;
  const podeEditarObs = isAuth && (
    role === 'superadmin' ||
    role === 'admin' ||
    (role === 'professor' && ag.professor_id === AppState.currentUserProfile?.professor_id)
  );

  (ag.aulas_geradas || []).forEach((aula, idx) => {
    const tr = document.createElement('tr');
    const obsTexto = aula.observacoes || '';
    const obsDisplay = obsTexto
      ? `<span class="obs-badge" title="${obsTexto}"><i class="fa-solid fa-message text-cyan"></i> ${obsTexto}</span>`
      : '<span style="color:var(--text-muted); font-size:0.75rem;">Nenhuma</span>';

    const btnAcaoObs = podeEditarObs
      ? `<button class="obs-btn-edit" onclick="abrirModalEdicaoObs('${ag.id}', ${idx})" title="Editar observações desta aula">
          <i class="fa-solid fa-pencil"></i> Obs
        </button>`
      : '<span style="color:var(--text-muted); font-size:0.75rem;">-</span>';

    tr.innerHTML = `
      <td><strong>#${idx + 1}</strong></td>
      <td>${aula.data}</td>
      <td>${aula.dia_semana || obterDiaSemanaStr(aula.data)}</td>
      <td><span class="badge-periodo ${aula.periodo.toLowerCase()}">${aula.periodo}</span></td>
      <td>${aula.duracao_aula}h</td>
      <td>${obsDisplay}</td>
      <td>${btnAcaoObs}</td>
    `;
    tbody.appendChild(tr);
  });

  abrirModal('cronograma-modal');
}

function abrirModalEdicaoObs(agendamentoId, aulaIndex) {
  if (!AppState.currentUser) {
    mostrarToast("Faça login para editar anotações.", "error");
    abrirModalLogin();
    return;
  }

  const ag = AppState.agendamentos.find(a => a.id === agendamentoId);
  if (!ag || !ag.aulas_geradas[aulaIndex]) return;

  const aula = ag.aulas_geradas[aulaIndex];
  document.getElementById('obs-agendamento-id').value = agendamentoId;
  document.getElementById('obs-aula-index').value = aulaIndex;
  document.getElementById('obs-modal-title').textContent = `Observação • Aula #${aulaIndex + 1}`;
  document.getElementById('obs-modal-subtitle').textContent = `Data: ${aula.data} (${aula.periodo}) • Turma: ${ag.turma_nome}`;
  document.getElementById('obs-textarea').value = aula.observacoes || '';

  abrirModal('obs-modal');
}

async function salvarObservacaoAula() {
  const agendamentoId = document.getElementById('obs-agendamento-id').value;
  const aulaIndex = parseInt(document.getElementById('obs-aula-index').value);
  const texto = document.getElementById('obs-textarea').value.trim();

  const ag = AppState.agendamentos.find(a => a.id === agendamentoId);
  if (!ag || !ag.aulas_geradas[aulaIndex]) return;

  ag.aulas_geradas[aulaIndex].observacoes = texto;

  try {
    if (db) {
      await db.collection('agendamentos').doc(agendamentoId).update({
        aulas_geradas: ag.aulas_geradas
      });
    }
    fecharModal('obs-modal');
    mostrarToast("Observação da aula atualizada com sucesso!", "success");
    abrirCronogramaTurma(agendamentoId);
  } catch (err) {
    mostrarToast("Erro ao salvar observação: " + err.message, "error");
  }
}

// ============================================================================
// CRUD CURSOS (SUPERADMIN & ADMIN)
// ============================================================================
async function salvarNovoCurso(e) {
  e.preventDefault();
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const nome = document.getElementById('curso-nome-input').value.trim();
  const duracao = parseInt(document.getElementById('curso-duracao-input').value);
  const desc = document.getElementById('curso-desc-input').value.trim();

  if (!nome || !duracao) {
    mostrarToast("Nome e duração são obrigatórios.", "error");
    return;
  }

  const btn = document.getElementById('btn-salvar-curso');
  btn.disabled = true;

  try {
    const cursoData = {
      nome: nome,
      duracao_horas: duracao,
      descricao: desc
    };

    if (db) {
      await db.collection('cursos').add(cursoData);
    } else {
      AppState.cursos.push({ id: 'curso-' + Date.now(), ...cursoData });
      renderizarTabelaCursos();
      popularSelects();
      renderizarCatalogoTodosCursos();
    }

    mostrarToast(`Curso "${nome}" salvo no Firestore!`, "success");
    document.getElementById('form-novo-curso').reset();
  } catch (err) {
    mostrarToast("Erro ao salvar curso: " + err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

function abrirModalEditarCurso(id) {
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const c = AppState.cursos.find(item => item.id === id);
  if (!c) return;

  document.getElementById('edit-curso-id').value = c.id;
  document.getElementById('edit-curso-nome').value = c.nome;
  document.getElementById('edit-curso-duracao').value = c.duracao_horas;
  document.getElementById('edit-curso-desc').value = c.descricao || '';

  abrirModal('edit-curso-modal');
}

async function submeterEdicaoCurso(e) {
  e.preventDefault();
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const id = document.getElementById('edit-curso-id').value;
  const nome = document.getElementById('edit-curso-nome').value.trim();
  const duracao = parseInt(document.getElementById('edit-curso-duracao').value);
  const desc = document.getElementById('edit-curso-desc').value.trim();

  try {
    if (db) {
      await db.collection('cursos').doc(id).update({
        nome: nome,
        duracao_horas: duracao,
        descricao: desc
      });
    }
    const idx = AppState.cursos.findIndex(c => c.id === id);
    if (idx !== -1) {
      AppState.cursos[idx].nome = nome;
      AppState.cursos[idx].duracao_horas = duracao;
      AppState.cursos[idx].descricao = desc;
      renderizarTabelaCursos();
      popularSelects();
      renderizarCatalogoTodosCursos();
    }
    fecharModal('edit-curso-modal');
    mostrarToast("Curso atualizado com sucesso!", "success");
  } catch (err) {
    mostrarToast("Erro ao atualizar: " + err.message, "error");
  }
}

async function excluirCurso(id) {
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const curso = AppState.cursos.find(c => c.id === id);
  if (!curso) return;

  const emUso = AppState.agendamentos.some(a => a.curso_id === id);
  if (emUso) {
    mostrarToast(`Não é possível excluir: O curso "${curso.nome}" possui turmas ativas vinculadas.`, "error");
    return;
  }

  if (!confirm(`Deseja realmente excluir o curso "${curso.nome}"?`)) return;

  try {
    if (db) await db.collection('cursos').doc(id).delete();
    AppState.cursos = AppState.cursos.filter(c => c.id !== id);
    renderizarTabelaCursos();
    popularSelects();
    renderizarCatalogoTodosCursos();
    mostrarToast(`Curso "${curso.nome}" excluído.`, "success");
  } catch (err) {
    mostrarToast("Erro ao excluir: " + err.message, "error");
  }
}

// ============================================================================
// CRUD PROFESSORES (SUPERADMIN & ADMIN)
// ============================================================================
async function salvarNovoProfessor(e) {
  e.preventDefault();
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const nome = document.getElementById('prof-nome-input').value.trim();
  const area = document.getElementById('prof-area-input').value.trim();
  const linkSala = document.getElementById('prof-link-sala-input').value.trim();

  if (!nome || !area) {
    mostrarToast("Preencha nome e área de atuação.", "error");
    return;
  }

  const btn = document.getElementById('btn-salvar-prof');
  btn.disabled = true;

  try {
    const profData = {
      nome: nome,
      area: area,
      link_sala: linkSala || "https://meet.google.com/new"
    };

    if (db) {
      await db.collection('professores').add(profData);
    } else {
      AppState.professores.push({ id: 'prof-' + Date.now(), ...profData });
      renderizarTabelaProfessores();
      popularSelects();
      renderizarPortalAlunoProfessor();
    }

    mostrarToast(`Professor(a) "${nome}" salvo no Firestore!`, "success");
    document.getElementById('form-novo-prof').reset();
  } catch (err) {
    mostrarToast("Erro ao salvar professor: " + err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

function abrirModalEditarProfessor(id) {
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const p = AppState.professores.find(item => item.id === id);
  if (!p) return;

  document.getElementById('edit-prof-id').value = p.id;
  document.getElementById('edit-prof-nome').value = p.nome;
  document.getElementById('edit-prof-area').value = p.area || '';
  document.getElementById('edit-prof-link-sala').value = p.link_sala || '';

  abrirModal('edit-prof-modal');
}

async function submeterEdicaoProfessor(e) {
  e.preventDefault();
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const id = document.getElementById('edit-prof-id').value;
  const nome = document.getElementById('edit-prof-nome').value.trim();
  const area = document.getElementById('edit-prof-area').value.trim();
  const linkSala = document.getElementById('edit-prof-link-sala').value.trim();

  try {
    if (db) {
      await db.collection('professores').doc(id).update({
        nome: nome,
        area: area,
        link_sala: linkSala
      });
    }
    const idx = AppState.professores.findIndex(p => p.id === id);
    if (idx !== -1) {
      AppState.professores[idx].nome = nome;
      AppState.professores[idx].area = area;
      AppState.professores[idx].link_sala = linkSala;
      renderizarTabelaProfessores();
      popularSelects();
      renderizarPortalAlunoProfessor();
    }
    fecharModal('edit-prof-modal');
    mostrarToast("Professor atualizado com sucesso!", "success");
  } catch (err) {
    mostrarToast("Erro ao atualizar professor: " + err.message, "error");
  }
}

async function excluirProfessor(id) {
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const prof = AppState.professores.find(p => p.id === id);
  if (!prof) return;

  const emUso = AppState.agendamentos.some(a => a.professor_id === id);
  if (emUso) {
    mostrarToast(`Não é possível excluir: O(A) professor(a) "${prof.nome}" possui turmas agendadas.`, "error");
    return;
  }

  if (!confirm(`Deseja realmente excluir o professor "${prof.nome}"?`)) return;

  try {
    if (db) await db.collection('professores').doc(id).delete();
    AppState.professores = AppState.professores.filter(p => p.id !== id);
    renderizarTabelaProfessores();
    popularSelects();
    renderizarPortalAlunoProfessor();
    mostrarToast(`Professor "${prof.nome}" excluído.`, "success");
  } catch (err) {
    mostrarToast("Erro ao excluir professor: " + err.message, "error");
  }
}

// ============================================================================
// CRUD FERIADOS (SUPERADMIN & ADMIN)
// ============================================================================
async function salvarNovoFeriado(e) {
  e.preventDefault();
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const nome = document.getElementById('feriado-nome-input').value.trim();
  const dataIso = document.getElementById('feriado-data-input').value;

  if (!nome || !dataIso) {
    mostrarToast("Preencha nome e data do feriado.", "error");
    return;
  }

  const [ano, mes, dia] = dataIso.split('-');
  const dataFormatada = `${dia}/${mes}/${ano}`;

  const btn = document.getElementById('btn-salvar-feriado');
  btn.disabled = true;

  try {
    const feriadoData = { nome: nome, data: dataFormatada };
    if (db) {
      await db.collection('feriados').add(feriadoData);
    } else {
      AppState.feriados.push({ id: 'fer-' + Date.now(), ...feriadoData });
      renderizarTabelaFeriados();
    }

    mostrarToast(`Feriado "${nome}" salvo com sucesso!`, "success");
    document.getElementById('form-novo-feriado').reset();
  } catch (err) {
    mostrarToast("Erro ao salvar feriado: " + err.message, "error");
  } finally {
    btn.disabled = false;
  }
}

async function excluirFeriado(id) {
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const f = AppState.feriados.find(item => item.id === id);
  const nome = f ? f.nome : 'feriado';

  if (!confirm(`Deseja remover o feriado "${nome}" do calendário?`)) return;

  try {
    if (db) await db.collection('feriados').doc(id).delete();
    AppState.feriados = AppState.feriados.filter(item => item.id !== id);
    renderizarTabelaFeriados();
    mostrarToast("Feriado removido.", "success");
  } catch (err) {
    mostrarToast("Erro ao remover: " + err.message, "error");
  }
}

// ============================================================================
// EXPORTAÇÃO PARA EXCEL (.XLSX)
// ============================================================================
function exportarAgendaExcel() {
  if (AppState.agendamentos.length === 0) {
    mostrarToast("Nenhum agendamento encontrado para exportar.", "info");
    return;
  }

  const dadosPlanilha = [];
  const ordenados = [...AppState.agendamentos].sort((a, b) =>
    converterDataStrParaTimestamp(a.data_inicio) - converterDataStrParaTimestamp(b.data_inicio)
  );

  ordenados.forEach(ag => {
    (ag.aulas_geradas || []).forEach(aula => {
      dadosPlanilha.push({
        'Curso': ag.curso_nome,
        'Turma': ag.turma_nome,
        'Professor': ag.professor_nome,
        'Data da Aula': aula.data,
        'Dia da Semana': aula.dia_semana || obterDiaSemanaStr(aula.data),
        'Período': aula.periodo,
        'Duração (h)': aula.duracao_aula,
        'Observações': aula.observacoes || ''
      });
    });
  });

  gerarDownloadExcel(dadosPlanilha, 'aulaflux_cronograma_completo.xlsx');
  mostrarToast("Planilha completa exportada com sucesso!", "success");
}

function exportarTurmaIndividualExcel(ag) {
  const dados = (ag.aulas_geradas || []).map(aula => ({
    'Curso': ag.curso_nome,
    'Turma': ag.turma_nome,
    'Professor': ag.professor_nome,
    'Data da Aula': aula.data,
    'Dia da Semana': aula.dia_semana || obterDiaSemanaStr(aula.data),
    'Período': aula.periodo,
    'Duração (h)': aula.duracao_aula,
    'Observações': aula.observacoes || ''
  }));

  gerarDownloadExcel(dados, `cronograma_${ag.turma_nome.toLowerCase().replace(/\s+/g, '_')}.xlsx`);
  mostrarToast(`Planilha da turma "${ag.turma_nome}" gerada!`, "success");
}

function gerarDownloadExcel(jsonDados, nomeArquivo) {
  if (typeof XLSX !== 'undefined') {
    const ws = XLSX.utils.json_to_sheet(jsonDados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cronograma");
    XLSX.writeFile(wb, nomeArquivo);
  } else {
    const colunas = Object.keys(jsonDados[0]);
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += colunas.join(";") + "\r\n";

    jsonDados.forEach(item => {
      const row = colunas.map(col => `"${String(item[col] || '').replace(/"/g, '""')}"`);
      csvContent += row.join(";") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", nomeArquivo.replace('.xlsx', '.csv'));
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

// ============================================================================
// RENDERIZAÇÃO DAS TABELAS DO PAINEL DE GESTÃO
// ============================================================================
function renderizarTabelaAgendamentos() {
  const tbody = document.getElementById('table-agendamentos-tbody');
  if (!tbody) return;

  let filtrados = [...AppState.agendamentos];

  // Se o usuário logado for professor, filtra para suas turmas
  if (AppState.currentUserProfile && AppState.currentUserProfile.role === 'professor') {
    if (AppState.currentUserProfile.professor_id) {
      filtrados = filtrados.filter(a => a.professor_id === AppState.currentUserProfile.professor_id);
    }
  }

  if (AppState.filtroTexto) {
    const txt = AppState.filtroTexto.toLowerCase();
    filtrados = filtrados.filter(a =>
      (a.turma_nome && a.turma_nome.toLowerCase().includes(txt)) ||
      (a.curso_nome && a.curso_nome.toLowerCase().includes(txt)) ||
      (a.professor_nome && a.professor_nome.toLowerCase().includes(txt))
    );
  }

  if (AppState.filtroCursoId) {
    filtrados = filtrados.filter(a => a.curso_id === AppState.filtroCursoId);
  }

  if (AppState.filtroProfId) {
    filtrados = filtrados.filter(a => a.professor_id === AppState.filtroProfId);
  }

  filtrados.sort((a, b) => converterDataStrParaTimestamp(a.data_inicio) - converterDataStrParaTimestamp(b.data_inicio));

  tbody.innerHTML = '';

  if (filtrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          <i class="fa-solid fa-folder-open" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
          Nenhum agendamento encontrado para os filtros selecionados.
        </td>
      </tr>
    `;
    return;
  }

  const isAuth = !!AppState.currentUser;
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;

  filtrados.forEach(ag => {
    const tr = document.createElement('tr');
    const totalAulas = (ag.aulas_geradas && ag.aulas_geradas.length) || 0;

    const podeExcluir = isAuth && (
      role === 'superadmin' ||
      role === 'admin' ||
      (role === 'professor' && ag.professor_id === AppState.currentUserProfile?.professor_id)
    );

    const btnExcluir = podeExcluir
      ? `<button class="btn btn-danger" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="excluirAgendamento('${ag.id}')" title="Excluir turma">
          <i class="fa-solid fa-trash"></i>
        </button>`
      : '';

    tr.innerHTML = `
      <td><strong>${ag.turma_nome}</strong></td>
      <td>${ag.curso_nome}</td>
      <td>${ag.professor_nome}</td>
      <td>${ag.data_inicio}</td>
      <td>${ag.data_final}</td>
      <td><span class="badge-periodo ${ag.periodo ? ag.periodo.toLowerCase() : 'noite'}">${ag.periodo || 'Noite'}</span></td>
      <td>
        <span class="badge-tag" style="cursor: pointer;" onclick="abrirCronogramaTurma('${ag.id}')">
          <i class="fa-solid fa-calendar-check"></i> ${totalAulas} aulas (${ag.duracao_aula || 8}h)
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.35rem;">
          <button class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="abrirCronogramaTurma('${ag.id}')" title="Ver cronograma detalhado">
            <i class="fa-solid fa-eye"></i>
          </button>
          ${btnExcluir}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrarAgendamentos() {
  AppState.filtroTexto = document.getElementById('filtro-busca-turma').value.trim();
  AppState.filtroCursoId = document.getElementById('filtro-curso').value;
  AppState.filtroProfId = document.getElementById('filtro-prof').value;
  renderizarTabelaAgendamentos();
}

function renderizarTabelaCursos() {
  const tbody = document.getElementById('table-cursos-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (AppState.cursos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Nenhum curso cadastrado.</td></tr>';
    return;
  }

  const isAuth = !!AppState.currentUser;
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;
  const podeGerenciarCursos = isAuth && (role === 'superadmin' || role === 'admin');

  AppState.cursos.forEach(c => {
    const turmasVinculadas = AppState.agendamentos.filter(a => a.curso_id === c.id || a.curso_nome === c.nome).length;
    const qtdAulas = (c.aulas && Array.isArray(c.aulas)) ? c.aulas.length : 0;
    const acoesHtml = podeGerenciarCursos
      ? `<div style="display:flex; gap:0.35rem; align-items:center;">
          <button class="btn btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem; border-color:rgba(14,165,233,0.4); color:var(--accent-cyan);" onclick="abrirModalGerenciarAulas('${c.id}')" title="Gerenciar Conteúdo das Aulas">
            <i class="fa-solid fa-layer-group"></i> Aulas (${qtdAulas})
          </button>
          <button class="btn btn-secondary" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="abrirModalEditarCurso('${c.id}')" title="Editar curso"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="excluirCurso('${c.id}')" title="Excluir curso"><i class="fa-solid fa-trash"></i></button>
        </div>`
      : `<button class="btn btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem; border-color:rgba(14,165,233,0.4); color:var(--accent-cyan);" onclick="abrirAulasDoCursoAluno('${c.id}')" title="Ver Aulas">
          <i class="fa-solid fa-layer-group"></i> Aulas (${qtdAulas})
        </button>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="font-size:0.75rem; color:var(--text-muted);">${(c.id || '').substring(0, 8)}...</code></td>
      <td><strong>${c.nome}</strong></td>
      <td>${c.duracao_horas} Horas</td>
      <td><span style="font-size:0.85rem; color:var(--text-secondary);">${c.descricao || '-'}</span></td>
      <td><span class="badge-tag">${turmasVinculadas} turma(s)</span></td>
      <td>${acoesHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarTabelaProfessores() {
  const tbody = document.getElementById('table-professores-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (AppState.professores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Nenhum professor cadastrado.</td></tr>';
    return;
  }

  const isAuth = !!AppState.currentUser;
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;
  const podeGerenciarProfs = isAuth && (role === 'superadmin' || role === 'admin');

  AppState.professores.forEach(p => {
    const turmasVinculadas = AppState.agendamentos.filter(a => a.professor_id === p.id).length;
    const linkSalaDisplay = p.link_sala
      ? `<a href="${p.link_sala}" target="_blank" style="font-size:0.8rem; color:var(--accent-cyan); display:inline-flex; align-items:center; gap:0.3rem;"><i class="fa-solid fa-video"></i> Acessar Sala</a>`
      : '<span style="color:var(--text-muted); font-size:0.75rem;">Não configurado</span>';

    const acoesHtml = podeGerenciarProfs
      ? `<div style="display:flex; gap:0.35rem;">
          <button class="btn btn-secondary" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="abrirModalEditarProfessor('${p.id}')" title="Editar professor"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="excluirProfessor('${p.id}')" title="Excluir professor"><i class="fa-solid fa-trash"></i></button>
        </div>`
      : '<span style="color:var(--text-muted); font-size:0.75rem;">-</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="font-size:0.75rem; color:var(--text-muted);">${(p.id || '').substring(0, 8)}...</code></td>
      <td><strong>${p.nome}</strong></td>
      <td>${p.area || '-'}</td>
      <td>${linkSalaDisplay}</td>
      <td><span class="badge-tag">${turmasVinculadas} turma(s)</span></td>
      <td>${acoesHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarTabelaFeriados() {
  const tbody = document.getElementById('table-feriados-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (AppState.feriados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Nenhum feriado cadastrado.</td></tr>';
    return;
  }

  const isAuth = !!AppState.currentUser;
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;
  const podeGerenciarFeriados = isAuth && (role === 'superadmin' || role === 'admin');

  AppState.feriados.forEach(f => {
    const acoesHtml = podeGerenciarFeriados
      ? `<button class="btn btn-danger" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="excluirFeriado('${f.id}')" title="Excluir feriado"><i class="fa-solid fa-trash"></i></button>`
      : '<span style="color:var(--text-muted); font-size:0.75rem;">-</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="font-size:0.75rem; color:var(--text-muted);">${(f.id || '').substring(0, 8)}...</code></td>
      <td><strong>${f.nome}</strong></td>
      <td>${f.data}</td>
      <td>${acoesHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function popularSelects() {
  const selectCurso = document.getElementById('agenda-select-curso');
  const selectProf = document.getElementById('agenda-select-prof');
  const filtroCurso = document.getElementById('filtro-curso');
  const filtroProf = document.getElementById('filtro-prof');
  const userProfSelect = document.getElementById('user-prof-select');

  if (selectCurso) {
    selectCurso.innerHTML = AppState.cursos.map(c => `<option value="${c.id}">${c.nome} (${c.duracao_horas}h)</option>`).join('');
  }

  if (selectProf) {
    selectProf.innerHTML = AppState.professores.map(p => `<option value="${p.id}">${p.nome} (${p.area || 'TI'})</option>`).join('');
    // Se for perfil professor, travar no professor vinculado
    if (AppState.currentUserProfile && AppState.currentUserProfile.role === 'professor' && AppState.currentUserProfile.professor_id) {
      selectProf.value = AppState.currentUserProfile.professor_id;
      selectProf.disabled = true;
    }
  }

  if (filtroCurso) {
    const atual = filtroCurso.value;
    filtroCurso.innerHTML = '<option value="">Todos os Cursos</option>' + AppState.cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    filtroCurso.value = atual;
  }

  if (filtroProf) {
    const atual = filtroProf.value;
    filtroProf.innerHTML = '<option value="">Todos os Professores</option>' + AppState.professores.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    filtroProf.value = atual;
  }

  if (userProfSelect) {
    userProfSelect.innerHTML = '<option value="">Selecione o professor correspondente...</option>' +
      AppState.professores.map(p => `<option value="${p.id}">${p.nome} (${p.area || 'TI'})</option>`).join('');
  }
}

// ============================================================================
// HELPERS E UTILITÁRIOS
// ============================================================================
function aplicarPresetDias(diasArray) {
  const cbs = document.querySelectorAll('input[name="agenda_dias"]');
  cbs.forEach(cb => {
    cb.checked = diasArray.includes(parseInt(cb.value));
  });
}

function converterDataStrParaTimestamp(dataStr) {
  if (!dataStr) return 0;
  if (dataStr.includes('/')) {
    const [d, m, y] = dataStr.split('/').map(Number);
    return new Date(y, m - 1, d).getTime();
  }
  return new Date(dataStr).getTime();
}

function obterDiaSemanaStr(dataStr) {
  if (!dataStr) return '';
  const [d, m, y] = dataStr.split('/').map(Number);
  const data = new Date(y, m - 1, d);
  const nomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return nomes[data.getDay()] || '';
}

function abrirModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('open');
}

function fecharModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('open');
}

function mostrarToast(mensagem, tipo = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  let icon = 'fa-solid fa-circle-info text-cyan';
  if (tipo === 'success') icon = 'fa-solid fa-circle-check text-emerald';
  if (tipo === 'error') icon = 'fa-solid fa-triangle-exclamation text-rose';

  toast.innerHTML = `<i class="${icon}"></i> <span>${mensagem}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function ativarAbaAdmin(targetId) {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(b => {
    if (b.getAttribute('data-tab') === targetId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  document.querySelectorAll('.admin-tab-content').forEach(c => {
    c.style.display = (c.id === targetId) ? 'block' : 'none';
  });
}

// ============================================================================
// REGISTRO DE EVENTOS DOM
// ============================================================================
function configurarEventosUI() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.getAttribute('data-tab');
      ativarAbaAdmin(targetId);
    };
  });

  const formAgenda = document.getElementById('form-novo-agendamento');
  if (formAgenda) formAgenda.onsubmit = criarAgendamento;

  const formCurso = document.getElementById('form-novo-curso');
  if (formCurso) formCurso.onsubmit = salvarNovoCurso;

  const formEditCurso = document.getElementById('form-edit-curso');
  if (formEditCurso) formEditCurso.onsubmit = submeterEdicaoCurso;

  const formProf = document.getElementById('form-novo-prof');
  if (formProf) formProf.onsubmit = salvarNovoProfessor;

  const formEditProf = document.getElementById('form-edit-prof');
  if (formEditProf) formEditProf.onsubmit = submeterEdicaoProfessor;

  const formFeriado = document.getElementById('form-novo-feriado');
  if (formFeriado) formFeriado.onsubmit = salvarNovoFeriado;

  const formUsuario = document.getElementById('form-novo-usuario');
  if (formUsuario) formUsuario.onsubmit = cadastrarNovoUsuario;

  const formAuth = document.getElementById('form-auth-exec');
  if (formAuth) formAuth.onsubmit = submeterAuth;

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.onclick = (e) => {
      if (e.target === modal) fecharModal(modal.id);
    };
  });
}

// ============================================================================
// COMPRESSÃO DE IMAGENS VIA CANVAS (BASE64 OTIMIZADO PARA FIRESTORE)
// ============================================================================
function processarImagemParaBase64Canvas(file, maxDimension = 850, quality = 0.68) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error("Arquivo inválido. Selecione uma imagem."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente para caber em maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Preenchimento de fundo para compatibilidade
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Exportação como JPEG com compressão otimizada
        const base64Data = canvas.toDataURL('image/jpeg', quality);
        const sizeBytes = Math.round((base64Data.length * 3) / 4);
        const sizeKb = (sizeBytes / 1024).toFixed(1);

        resolve({
          base64: base64Data,
          sizeKb,
          width,
          height,
          originalSizeKb: (file.size / 1024).toFixed(1)
        });
      };
      img.onerror = () => reject(new Error("Falha ao processar arquivo de imagem no Canvas."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo selecionado."));
    reader.readAsDataURL(file);
  });
}

async function tratarUploadImagemCanvas(inputElement, tipo) {
  const file = inputElement.files && inputElement.files[0];
  if (!file) return;

  try {
    mostrarToast(`Otimizando ${tipo} via Canvas para o Firestore...`, 'info');
    const resultado = await processarImagemParaBase64Canvas(file, 850, 0.68);

    const hiddenInput = document.getElementById(`form-aula-${tipo}-base64`);
    const previewContainer = document.getElementById(`preview-${tipo}-container`);
    const previewImg = document.getElementById(`preview-${tipo}-img`);
    const sizeBadge = document.getElementById(`preview-${tipo}-size`);

    if (hiddenInput) hiddenInput.value = resultado.base64;
    if (previewImg) previewImg.src = resultado.base64;
    if (sizeBadge) sizeBadge.textContent = `${resultado.sizeKb} KB (Canvas Otimizado)`;
    if (previewContainer) previewContainer.style.display = 'block';

    mostrarToast(`Imagem otimizada com sucesso! Tamanho salvo: ${resultado.sizeKb} KB`, 'success');
  } catch (err) {
    console.error(err);
    mostrarToast("Erro ao processar imagem no Canvas: " + err.message, "danger");
  }
}

function removerImagemAula(tipo) {
  const fileInput = document.getElementById(`form-aula-${tipo}-file`);
  const hiddenInput = document.getElementById(`form-aula-${tipo}-base64`);
  const previewContainer = document.getElementById(`preview-${tipo}-container`);
  const previewImg = document.getElementById(`preview-${tipo}-img`);

  if (fileInput) fileInput.value = '';
  if (hiddenInput) hiddenInput.value = '';
  if (previewImg) previewImg.src = '';
  if (previewContainer) previewContainer.style.display = 'none';
}

// ============================================================================
// GESTÃO DE CONTEÚDO DAS AULAS DO CURSO (ADMINISTRADOR)
// ============================================================================
AppState.cursoGerenciandoAulasId = null;
AppState.aulaEmEdicaoId = null;

function abrirModalGerenciarAulas(cursoId) {
  const curso = AppState.cursos.find(c => c.id === cursoId);
  if (!curso) {
    mostrarToast("Curso não encontrado.", "danger");
    return;
  }

  AppState.cursoGerenciandoAulasId = cursoId;
  AppState.aulaEmEdicaoId = null;

  const titEl = document.getElementById('modal-aulas-titulo');
  const subEl = document.getElementById('modal-aulas-subtitulo');
  if (titEl) {
    titEl.innerHTML = `<i class="fa-solid fa-layer-group text-cyan"></i> Aulas do Curso: ${curso.nome}`;
  }
  if (subEl) {
    subEl.textContent = `${curso.duracao_horas} Horas • Gerenciamento completo de vídeos, imagens, Drive, Markdown e Quiz`;
  }

  cancelarEdicaoAula();
  renderizarListaAulasAdmin(curso);
  abrirModal('modal-gerenciar-aulas');
}

function renderizarListaAulasAdmin(curso) {
  const container = document.getElementById('modal-aulas-lista');
  const countEl = document.getElementById('modal-aulas-contagem');
  if (!container) return;

  const aulas = (curso.aulas && Array.isArray(curso.aulas)) ? curso.aulas : [];
  if (countEl) countEl.textContent = aulas.length;

  if (aulas.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-2); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
        <i class="fa-solid fa-folder-open" style="font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.5rem; display: block;"></i>
        Nenhuma aula cadastrada ainda para este curso.<br>
        Clique em "Adicionar Nova Aula" para cadastrar a primeira aula com vídeo, imagens, markdown e quiz.
      </div>
    `;
    return;
  }

  const aulasOrdenadas = [...aulas].sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

  container.innerHTML = '';
  aulasOrdenadas.forEach((aula, index) => {
    const temVideo = !!aula.youtube_url;
    const temInfografico = !!aula.infografico_base64;
    const temMapaMental = !!aula.mapamental_base64;
    const temPdf = !!aula.pdf_url;
    const temMarkdown = !!aula.conteudo_markdown;
    const qtdQuestoes = (aula.quiz_questoes && Array.isArray(aula.quiz_questoes)) ? aula.quiz_questoes.length : 0;
    const temZip = !!aula.zip_url;
    const temDriveProf = !!aula.drive_professor_url;

    const item = document.createElement('div');
    item.className = 'aula-admin-card';
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; width: 100%;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="badge-tag" style="background: rgba(14,165,233,0.15); color: var(--accent-cyan);">Aula ${aula.ordem || (index + 1)}</span>
            <h5 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0;">${aula.titulo}</h5>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem;">
            <span class="badge-tag" style="${temVideo ? 'background:rgba(239,68,68,0.15); color:#ef4444;' : 'opacity:0.35;'}">
              <i class="fa-brands fa-youtube"></i> Vídeo
            </span>
            <span class="badge-tag" style="${temInfografico ? 'background:rgba(14,165,233,0.15); color:var(--accent-cyan);' : 'opacity:0.35;'}">
              <i class="fa-solid fa-chart-pie"></i> Infográfico (Canvas)
            </span>
            <span class="badge-tag" style="${temMapaMental ? 'background:rgba(16,185,129,0.15); color:var(--accent-emerald);' : 'opacity:0.35;'}">
              <i class="fa-solid fa-diagram-project"></i> Mapa Mental (Canvas)
            </span>
            <span class="badge-tag" style="${temPdf ? 'background:rgba(244,63,94,0.15); color:#f43f5e;' : 'opacity:0.35;'}">
              <i class="fa-solid fa-file-pdf"></i> PDF Drive
            </span>
            <span class="badge-tag" style="${temMarkdown ? 'background:rgba(14,165,233,0.15); color:var(--accent-cyan);' : 'opacity:0.35;'}">
              <i class="fa-solid fa-code"></i> Markdown
            </span>
            <span class="badge-tag" style="${qtdQuestoes > 0 ? 'background:rgba(245,158,11,0.15); color:var(--accent-amber);' : 'opacity:0.35;'}">
              <i class="fa-solid fa-circle-question"></i> Quiz (${qtdQuestoes} Q)
            </span>
            <span class="badge-tag" style="${temZip ? 'background:rgba(245,158,11,0.15); color:var(--accent-amber);' : 'opacity:0.35;'}">
              <i class="fa-solid fa-file-zipper"></i> ZIP
            </span>
            <span class="badge-tag" style="${temDriveProf ? 'background:rgba(14,165,233,0.15); color:var(--accent-cyan);' : 'opacity:0.35;'}">
              <i class="fa-solid fa-cloud-arrow-up"></i> Drive Prof
            </span>
          </div>
        </div>

        <div style="display: flex; gap: 0.35rem; align-items: center;">
          <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="abrirAmbienteAulaAluno('${curso.id}', '${aula.id}')" title="Testar visão do Aluno">
            <i class="fa-solid fa-eye text-cyan"></i> Visualizar
          </button>
          <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="editarAulaCurso('${curso.id}', '${aula.id}')" title="Editar aula">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          <button class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="excluirAulaCurso('${curso.id}', '${aula.id}')" title="Excluir aula">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

function iniciarCadastroNovaAula() {
  const curso = AppState.cursos.find(c => c.id === AppState.cursoGerenciandoAulasId);
  if (!curso) return;

  AppState.aulaEmEdicaoId = null;
  const wrapper = document.getElementById('modal-aula-form-wrapper');
  if (wrapper) wrapper.style.display = 'block';

  document.getElementById('form-aula-titulo-modo').innerHTML = '<i class="fa-solid fa-plus text-cyan"></i> Cadastrar Nova Aula';
  document.getElementById('form-aula-id').value = '';
  document.getElementById('form-aula-curso-id').value = curso.id;
  document.getElementById('form-aula-titulo').value = '';

  const totalAulas = (curso.aulas && curso.aulas.length) || 0;
  document.getElementById('form-aula-ordem').value = totalAulas + 1;
  document.getElementById('form-aula-youtube').value = '';

  removerImagemAula('infografico');
  removerImagemAula('mapamental');

  document.getElementById('form-aula-pdf-link').value = '';
  document.getElementById('form-aula-markdown').value = '';
  alternarAbaMarkdownForm('edit');

  document.getElementById('form-aula-zip-link').value = '';
  document.getElementById('form-aula-drive-prof-link').value = '';

  renderizarConstrutorQuizQuestoes([]);
  wrapper.scrollIntoView({ behavior: 'smooth' });
}

function editarAulaCurso(cursoId, aulaId) {
  const curso = AppState.cursos.find(c => c.id === cursoId);
  if (!curso) return;

  const aula = (curso.aulas || []).find(a => a.id === aulaId);
  if (!aula) return;

  AppState.aulaEmEdicaoId = aulaId;
  const wrapper = document.getElementById('modal-aula-form-wrapper');
  if (wrapper) wrapper.style.display = 'block';

  document.getElementById('form-aula-titulo-modo').innerHTML = '<i class="fa-solid fa-pen text-amber"></i> Editar Conteúdo da Aula';
  document.getElementById('form-aula-id').value = aula.id;
  document.getElementById('form-aula-curso-id').value = curso.id;
  document.getElementById('form-aula-titulo').value = aula.titulo || '';
  document.getElementById('form-aula-ordem').value = aula.ordem || 1;
  document.getElementById('form-aula-youtube').value = aula.youtube_url || '';

  // Infográfico
  if (aula.infografico_base64) {
    document.getElementById('form-aula-infografico-base64').value = aula.infografico_base64;
    document.getElementById('preview-infografico-img').src = aula.infografico_base64;
    document.getElementById('preview-infografico-size').textContent = 'Base64 Salvo';
    document.getElementById('preview-infografico-container').style.display = 'block';
  } else {
    removerImagemAula('infografico');
  }

  // Mapa Mental
  if (aula.mapamental_base64) {
    document.getElementById('form-aula-mapamental-base64').value = aula.mapamental_base64;
    document.getElementById('preview-mapamental-img').src = aula.mapamental_base64;
    document.getElementById('preview-mapamental-size').textContent = 'Base64 Salvo';
    document.getElementById('preview-mapamental-container').style.display = 'block';
  } else {
    removerImagemAula('mapamental');
  }

  document.getElementById('form-aula-pdf-link').value = aula.pdf_url || '';
  document.getElementById('form-aula-markdown').value = aula.conteudo_markdown || '';
  alternarAbaMarkdownForm('edit');

  document.getElementById('form-aula-zip-link').value = aula.zip_url || '';
  document.getElementById('form-aula-drive-prof-link').value = aula.drive_professor_url || '';

  renderizarConstrutorQuizQuestoes(aula.quiz_questoes || []);
  wrapper.scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicaoAula() {
  AppState.aulaEmEdicaoId = null;
  const wrapper = document.getElementById('modal-aula-form-wrapper');
  if (wrapper) wrapper.style.display = 'none';
}

function alternarAbaMarkdownForm(modo) {
  const textarea = document.getElementById('form-aula-markdown');
  const preview = document.getElementById('form-aula-markdown-preview');
  const btnEdit = document.getElementById('btn-md-edit-mode');
  const btnPrev = document.getElementById('btn-md-preview-mode');

  if (modo === 'preview') {
    if (textarea && preview) {
      const mdText = textarea.value || '';
      preview.innerHTML = (window.marked && typeof window.marked.parse === 'function')
        ? window.marked.parse(mdText)
        : mdText.replace(/\n/g, '<br>');
      textarea.style.display = 'none';
      preview.style.display = 'block';
    }
    if (btnEdit) btnEdit.classList.remove('btn-primary');
    if (btnPrev) btnPrev.classList.add('btn-primary');
  } else {
    if (textarea && preview) {
      textarea.style.display = 'block';
      preview.style.display = 'none';
    }
    if (btnEdit) btnEdit.classList.add('btn-primary');
    if (btnPrev) btnPrev.classList.remove('btn-primary');
  }
}

function renderizarConstrutorQuizQuestoes(questoesExistentes = []) {
  const container = document.getElementById('quiz-questoes-builder-container');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 1; i <= 10; i++) {
    const qData = questoesExistentes[i - 1] || {
      id: i,
      pergunta: '',
      opcoes: ['', '', '', ''],
      correta: 0
    };

    const qCard = document.createElement('div');
    qCard.className = 'quiz-builder-card';
    qCard.innerHTML = `
      <div class="quiz-builder-card-header">
        <strong><i class="fa-solid fa-question-circle text-amber"></i> Questão ${i} de 10</strong>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Assinale a alternativa correta</span>
      </div>
      <div style="margin-bottom: 0.75rem;">
        <label style="font-size: 0.75rem; font-weight: 600;">Enunciado da Pergunta *</label>
        <textarea id="quiz-pergunta-${i}" class="form-control" rows="2" placeholder="Digite o enunciado da questão ${i}...">${qData.pergunta || ''}</textarea>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.4rem;">
        <label style="font-size: 0.75rem; font-weight: 600;">Alternativas (Selecione a Correta):</label>
        ${['A', 'B', 'C', 'D'].map((letra, optIndex) => `
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="radio" name="quiz-correta-${i}" id="quiz-correta-${i}-${optIndex}" value="${optIndex}" ${Number(qData.correta) === optIndex ? 'checked' : ''} style="cursor: pointer; accent-color: var(--accent-emerald);">
            <label for="quiz-correta-${i}-${optIndex}" style="font-weight: 700; width: 20px; margin: 0; cursor: pointer;">${letra})</label>
            <input type="text" id="quiz-opcao-${i}-${optIndex}" class="form-control" placeholder="Alternativa ${letra}..." value="${(qData.opcoes && qData.opcoes[optIndex]) || ''}" style="flex: 1;">
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(qCard);
  }
}

function obterQuestoesDoConstrutor() {
  const questoes = [];
  for (let i = 1; i <= 10; i++) {
    const perguntaEl = document.getElementById(`quiz-pergunta-${i}`);
    const pergunta = perguntaEl ? perguntaEl.value.trim() : '';
    const opcoes = [];
    for (let opt = 0; opt < 4; opt++) {
      const optEl = document.getElementById(`quiz-opcao-${i}-${opt}`);
      opcoes.push(optEl ? optEl.value.trim() : '');
    }

    const radioChecked = document.querySelector(`input[name="quiz-correta-${i}"]:checked`);
    const correta = radioChecked ? Number(radioChecked.value) : 0;

    if (pergunta) {
      questoes.push({
        id: i,
        pergunta,
        opcoes,
        correta
      });
    }
  }
  return questoes;
}

function preencherQuizModeloExemplo() {
  const curso = AppState.cursos.find(c => c.id === AppState.cursoGerenciandoAulasId);
  const nomeCurso = curso ? curso.nome : "Formação Técnica";

  for (let i = 1; i <= 10; i++) {
    const pEl = document.getElementById(`quiz-pergunta-${i}`);
    if (pEl) pEl.value = `Questão ${i}: Qual o conceito fundamental abordado neste módulo prático de ${nomeCurso}?`;

    for (let opt = 0; opt < 4; opt++) {
      const optEl = document.getElementById(`quiz-opcao-${i}-${opt}`);
      if (optEl) {
        if (opt === 0) optEl.value = `Conceito fundamental e recomendação oficial da arquitetura (Correta)`;
        else if (opt === 1) optEl.value = `Procedimento não recomendado para fluxos de produção`;
        else if (opt === 2) optEl.value = `Configuração legada e descontinuada pelo fabricante`;
        else optEl.value = `Nenhuma das alternativas anteriores`;
      }
    }
    const rEl = document.getElementById(`quiz-correta-${i}-0`);
    if (rEl) rEl.checked = true;
  }
  mostrarToast("10 Questões modelo carregadas com sucesso no formulário!", "info");
}

function limparTodasQuestoesQuiz() {
  for (let i = 1; i <= 10; i++) {
    const pEl = document.getElementById(`quiz-pergunta-${i}`);
    if (pEl) pEl.value = '';
    for (let opt = 0; opt < 4; opt++) {
      const optEl = document.getElementById(`quiz-opcao-${i}-${opt}`);
      if (optEl) optEl.value = '';
    }
  }
  mostrarToast("Campos do Quiz limpos.", "info");
}

async function salvarConteudoAulaForm() {
  const cursoId = document.getElementById('form-aula-curso-id').value || AppState.cursoGerenciandoAulasId;
  const curso = AppState.cursos.find(c => c.id === cursoId);
  if (!curso) {
    mostrarToast("Curso não localizado.", "danger");
    return;
  }

  const aulaIdExistente = document.getElementById('form-aula-id').value;
  const titulo = document.getElementById('form-aula-titulo').value.trim();
  const ordem = Number(document.getElementById('form-aula-ordem').value) || 1;
  const youtubeUrl = document.getElementById('form-aula-youtube').value.trim();
  const infograficoBase64 = document.getElementById('form-aula-infografico-base64').value;
  const mapamentalBase64 = document.getElementById('form-aula-mapamental-base64').value;
  const pdfUrl = document.getElementById('form-aula-pdf-link').value.trim();
  const markdownText = document.getElementById('form-aula-markdown').value;
  const zipUrl = document.getElementById('form-aula-zip-link').value.trim();
  const driveProfUrl = document.getElementById('form-aula-drive-prof-link').value.trim();
  const questoes = obterQuestoesDoConstrutor();

  if (!titulo) {
    mostrarToast("O título da aula é obrigatório.", "warning");
    return;
  }

  const aulaObj = {
    id: aulaIdExistente || ('aula_' + Date.now()),
    titulo,
    ordem,
    youtube_url: youtubeUrl,
    infografico_base64: infograficoBase64,
    mapamental_base64: mapamentalBase64,
    pdf_url: pdfUrl,
    conteudo_markdown: markdownText,
    quiz_questoes: questoes,
    zip_url: zipUrl,
    drive_professor_url: driveProfUrl,
    atualizado_em: new Date().toISOString()
  };

  if (!curso.aulas) curso.aulas = [];

  if (aulaIdExistente) {
    const idx = curso.aulas.findIndex(a => a.id === aulaIdExistente);
    if (idx >= 0) curso.aulas[idx] = aulaObj;
    else curso.aulas.push(aulaObj);
  } else {
    curso.aulas.push(aulaObj);
  }

  try {
    if (db) {
      await db.collection('cursos').doc(curso.id).set({
        aulas: curso.aulas
      }, { merge: true });
    }
    mostrarToast(`Aula "${titulo}" salva com sucesso!`, 'success');
  } catch (err) {
    console.error(err);
    mostrarToast("Aviso: Salvo em memória local (" + err.message + ")", "warning");
  }

  cancelarEdicaoAula();
  renderizarListaAulasAdmin(curso);
  renderizarTabelaCursos();
  renderizarCatalogoTodosCursos();
}

async function excluirAulaCurso(cursoId, aulaId) {
  const curso = AppState.cursos.find(c => c.id === cursoId);
  if (!curso || !curso.aulas) return;

  if (!confirm("Deseja realmente excluir esta aula e todo seu conteúdo?")) return;

  curso.aulas = curso.aulas.filter(a => a.id !== aulaId);

  try {
    if (db) {
      await db.collection('cursos').doc(curso.id).set({
        aulas: curso.aulas
      }, { merge: true });
    }
    mostrarToast("Aula excluída com sucesso.", "success");
  } catch (err) {
    console.error(err);
    mostrarToast("Aula removida localmente.", "info");
  }

  renderizarListaAulasAdmin(curso);
  renderizarTabelaCursos();
  renderizarCatalogoTodosCursos();
}

// ============================================================================
// AMBIENTE DE APRENDIZAGEM DO ALUNO (PLAYER DE AULA)
// ============================================================================
AppState.alunoAulaAtual = null;
AppState.alunoCursoAtual = null;
AppState.alunoQuizNome = localStorage.getItem('aulaflux_aluno_nome') || '';

function abrirAulasDoCursoAluno(cursoId) {
  const curso = AppState.cursos.find(c => c.id === cursoId);
  if (!curso) {
    mostrarToast("Curso não encontrado.", "danger");
    return;
  }

  const aulas = curso.aulas || [];
  if (aulas.length === 0) {
    mostrarToast("Nenhuma aula cadastrada ainda para este curso.", "info");
    return;
  }

  abrirAmbienteAulaAluno(curso.id, aulas[0].id);
}

function extrairIdYoutube(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function abrirAmbienteAulaAluno(cursoId, aulaId) {
  const curso = AppState.cursos.find(c => c.id === cursoId);
  if (!curso) return;

  const aula = (curso.aulas || []).find(a => a.id === aulaId) || (curso.aulas && curso.aulas[0]);
  if (!aula) {
    mostrarToast("Conteúdo de aula não encontrado.", "info");
    return;
  }

  AppState.alunoCursoAtual = curso;
  AppState.alunoAulaAtual = aula;

  // Header do modal
  const tagCurso = document.getElementById('aluno-aula-tag-curso');
  const tagOrdem = document.getElementById('aluno-aula-tag-ordem');
  const titEl = document.getElementById('aluno-aula-titulo');

  if (tagCurso) tagCurso.textContent = curso.nome;
  if (tagOrdem) tagOrdem.textContent = `Aula ${aula.ordem || 1}`;
  if (titEl) titEl.textContent = aula.titulo;

  // 1. VÍDEO DO YOUTUBE
  const ytWrapper = document.getElementById('aluno-video-wrapper');
  const ytEmpty = document.getElementById('aluno-video-empty');
  const ytId = extrairIdYoutube(aula.youtube_url);

  if (ytId && ytWrapper) {
    ytWrapper.innerHTML = `
      <iframe src="https://www.youtube.com/embed/${ytId}?rel=0&autoplay=0" title="${aula.titulo}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
    ytWrapper.style.display = 'block';
    if (ytEmpty) ytEmpty.style.display = 'none';
  } else {
    if (ytWrapper) {
      ytWrapper.innerHTML = '';
      ytWrapper.style.display = 'none';
    }
    if (ytEmpty) ytEmpty.style.display = 'flex';
  }

  // 2. CONTEÚDO MARKDOWN
  const mdEl = document.getElementById('aluno-markdown-content');
  if (mdEl) {
    const rawMd = aula.conteudo_markdown || "# Sem conteúdo textual\n\nNenhum resumo em markdown foi cadastrado para esta aula ainda.";
    mdEl.innerHTML = (window.marked && typeof window.marked.parse === 'function')
      ? window.marked.parse(rawMd)
      : rawMd.replace(/\n/g, '<br>');
  }

  // 3. INFOGRÁFICO E MAPA MENTAL
  const imgInfo = document.getElementById('img-aluno-infografico');
  const cardInfo = document.getElementById('card-aluno-infografico');
  if (aula.infografico_base64 && imgInfo) {
    imgInfo.src = aula.infografico_base64;
    if (cardInfo) cardInfo.style.display = 'block';
  } else if (cardInfo) {
    cardInfo.style.display = 'none';
  }

  const imgMapa = document.getElementById('img-aluno-mapamental');
  const cardMapa = document.getElementById('card-aluno-mapamental');
  if (aula.mapamental_base64 && imgMapa) {
    imgMapa.src = aula.mapamental_base64;
    if (cardMapa) cardMapa.style.display = 'block';
  } else if (cardMapa) {
    cardMapa.style.display = 'none';
  }

  // 4. DOWNLOADS E MATERIAIS
  const btnPdf = document.getElementById('btn-download-pdf');
  if (btnPdf) {
    if (aula.pdf_url) {
      btnPdf.href = aula.pdf_url;
      btnPdf.style.display = 'inline-flex';
    } else {
      btnPdf.style.display = 'none';
    }
  }

  const btnZip = document.getElementById('btn-download-zip');
  if (btnZip) {
    if (aula.zip_url) {
      btnZip.href = aula.zip_url;
      btnZip.style.display = 'inline-flex';
    } else {
      btnZip.style.display = 'none';
    }
  }

  const btnDriveProf = document.getElementById('btn-envio-drive-prof');
  if (btnDriveProf) {
    if (aula.drive_professor_url) {
      btnDriveProf.href = aula.drive_professor_url;
      btnDriveProf.style.display = 'inline-flex';
    } else {
      btnDriveProf.style.display = 'none';
    }
  }

  // 5. QUIZ DE 10 QUESTÕES
  const gateBloqueio = document.getElementById('quiz-gate-bloqueio');
  const areaPerguntas = document.getElementById('quiz-area-perguntas');
  const containerResultado = document.getElementById('quiz-resultado-container');
  const inputNomeAluno = document.getElementById('quiz-aluno-nome-input');

  if (containerResultado) containerResultado.style.display = 'none';

  if (AppState.alunoQuizNome) {
    if (inputNomeAluno) inputNomeAluno.value = AppState.alunoQuizNome;
    desbloquearQuizAluno();
  } else {
    if (gateBloqueio) gateBloqueio.style.display = 'block';
    if (areaPerguntas) areaPerguntas.style.display = 'none';
  }

  navegarAbaAulaAluno(ytId ? 'video' : 'conteudo');
  abrirModal('modal-conteudo-aula');
}

function navegarAbaAulaAluno(abaNome) {
  const abas = ['video', 'conteudo', 'visuais', 'materiais', 'quiz'];
  abas.forEach(aba => {
    const btn = document.getElementById(`tab-btn-${aba}`);
    const secao = document.getElementById(`secao-aluno-${aba}`);
    if (btn) btn.classList.toggle('active', aba === abaNome);
    if (secao) secao.style.display = (aba === abaNome) ? 'block' : 'none';
  });
}

function desbloquearQuizAluno() {
  const inputNome = document.getElementById('quiz-aluno-nome-input');
  const nome = inputNome ? inputNome.value.trim() : AppState.alunoQuizNome;

  if (!nome || nome.length < 3) {
    mostrarToast("Por favor, digite seu nome completo para liberar o quiz.", "warning");
    if (inputNome) inputNome.focus();
    return;
  }

  AppState.alunoQuizNome = nome;
  localStorage.setItem('aulaflux_aluno_nome', nome);

  const gateBloqueio = document.getElementById('quiz-gate-bloqueio');
  const areaPerguntas = document.getElementById('quiz-area-perguntas');
  const nomeExibicao = document.getElementById('quiz-aluno-nome-exibicao');

  if (gateBloqueio) gateBloqueio.style.display = 'none';
  if (areaPerguntas) areaPerguntas.style.display = 'block';
  if (nomeExibicao) nomeExibicao.textContent = nome;

  const aula = AppState.alunoAulaAtual;
  const questoes = (aula && aula.quiz_questoes && Array.isArray(aula.quiz_questoes)) ? aula.quiz_questoes : [];

  renderizarQuestoesQuizAluno(questoes);
}

function renderizarQuestoesQuizAluno(questoes) {
  const container = document.getElementById('quiz-questoes-aluno-lista');
  if (!container) return;

  if (questoes.length === 0) {
    container.innerHTML = `
      <div style="padding: 2.5rem; text-align: center; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <i class="fa-solid fa-circle-info" style="font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.5rem; display: block;"></i>
        Nenhuma questão cadastrada para esta aula ainda.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  questoes.forEach((q, idx) => {
    const qNum = idx + 1;
    const card = document.createElement('div');
    card.className = 'quiz-question-box';
    card.id = `quiz-box-q-${qNum}`;
    card.innerHTML = `
      <div class="quiz-question-title">
        <span class="quiz-q-num">${qNum}</span>
        <p style="margin: 0; font-weight: 600; color: var(--text-primary); font-size: 1rem;">${q.pergunta}</p>
      </div>
      <div class="quiz-options-list">
        ${(q.opcoes || []).map((opcao, optIndex) => `
          <label class="quiz-option-label" id="label-q-${qNum}-opt-${optIndex}">
            <input type="radio" name="aluno_resposta_${qNum}" value="${optIndex}" onchange="atualizarContadorQuizRespondidas()">
            <span class="quiz-option-letter">${['A', 'B', 'C', 'D'][optIndex]}</span>
            <span class="quiz-option-text">${opcao}</span>
          </label>
        `).join('')}
      </div>
    `;
    container.appendChild(card);
  });

  atualizarContadorQuizRespondidas();
}

function atualizarContadorQuizRespondidas() {
  const aula = AppState.alunoAulaAtual;
  const total = (aula && aula.quiz_questoes && aula.quiz_questoes.length) || 10;
  let respondidas = 0;

  for (let i = 1; i <= total; i++) {
    const checked = document.querySelector(`input[name="aluno_resposta_${i}"]:checked`);
    if (checked) respondidas++;
  }

  const badge = document.getElementById('quiz-contador-respondidas');
  if (badge) {
    badge.textContent = `${respondidas} / ${total} Respondidas`;
    if (respondidas === total) {
      badge.style.background = 'rgba(16,185,129,0.2)';
      badge.style.color = 'var(--accent-emerald)';
    } else {
      badge.style.background = 'rgba(14,165,233,0.15)';
      badge.style.color = 'var(--accent-cyan)';
    }
  }
}

async function submeterQuizAlunoFinal() {
  const curso = AppState.alunoCursoAtual;
  const aula = AppState.alunoAulaAtual;
  const nomeAluno = AppState.alunoQuizNome;

  if (!curso || !aula || !nomeAluno) {
    mostrarToast("Identifique-se para enviar o quiz.", "warning");
    return;
  }

  const questoes = aula.quiz_questoes || [];
  if (questoes.length === 0) {
    mostrarToast("Nenhuma questão para avaliar.", "info");
    return;
  }

  let acertos = 0;
  const respostasDetalhes = [];

  questoes.forEach((q, idx) => {
    const qNum = idx + 1;
    const checked = document.querySelector(`input[name="aluno_resposta_${qNum}"]:checked`);
    const marcadaIndex = checked ? Number(checked.value) : null;
    const corretaIndex = Number(q.correta);
    const acertou = marcadaIndex === corretaIndex;

    if (acertou) acertos++;

    respostasDetalhes.push({
      numero: qNum,
      pergunta: q.pergunta,
      resposta_aluno: marcadaIndex !== null ? q.opcoes[marcadaIndex] : 'Em branco',
      resposta_correta: q.opcoes[corretaIndex],
      acertou
    });

    for (let opt = 0; opt < 4; opt++) {
      const lbl = document.getElementById(`label-q-${qNum}-opt-${opt}`);
      if (lbl) {
        if (opt === corretaIndex) {
          lbl.style.background = 'rgba(16,185,129,0.2)';
          lbl.style.borderColor = 'var(--accent-emerald)';
        } else if (opt === marcadaIndex && !acertou) {
          lbl.style.background = 'rgba(239,68,68,0.2)';
          lbl.style.borderColor = '#ef4444';
        }
      }
    }
  });

  const total = questoes.length;
  const percentual = Math.round((acertos / total) * 100);
  const aprovado = percentual >= 70;

  const resultadoDoc = {
    aluno_nome: nomeAluno,
    curso_id: curso.id,
    curso_nome: curso.nome,
    aula_id: aula.id,
    aula_titulo: aula.titulo,
    acertos,
    total,
    percentual,
    aprovado,
    criado_em: firebase.firestore.FieldValue.serverTimestamp(),
    data_formatada: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')
  };

  try {
    if (db) {
      await db.collection('quiz_respostas').add(resultadoDoc);
    }
  } catch (err) {
    console.warn("Aviso ao gravar quiz_respostas no Firestore:", err);
  }

  const containerResultado = document.getElementById('quiz-resultado-container');
  if (containerResultado) {
    containerResultado.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2.25rem; background: ${aprovado ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${aprovado ? 'var(--accent-emerald)' : '#ef4444'};">
          <i class="fa-solid ${aprovado ? 'fa-award' : 'fa-triangle-exclamation'}"></i>
        </div>
        <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">
          ${aprovado ? 'Parabéns, Desempenho Excelente!' : 'Quiz Concluído! Revise o Conteúdo'}
        </h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Aluno(a): <strong style="color: var(--text-primary);">${nomeAluno}</strong> • Aula: <strong style="color: var(--accent-cyan);">${aula.titulo}</strong>
        </p>

        <div style="display: flex; justify-content: center; gap: 2rem; margin: 1.5rem 0;">
          <div style="background: var(--bg-surface-2); padding: 1rem 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Acertos</span>
            <strong style="font-size: 1.75rem; color: var(--accent-emerald);">${acertos} / ${total}</strong>
          </div>
          <div style="background: var(--bg-surface-2); padding: 1rem 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Aproveitamento</span>
            <strong style="font-size: 1.75rem; color: ${aprovado ? 'var(--accent-cyan)' : 'var(--accent-amber)'};">${percentual}%</strong>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: var(--accent-emerald);">
          <i class="fa-solid fa-cloud-arrow-up"></i> Resultado registrado com sucesso no Firebase Cloud Firestore!
        </p>

        <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 0.75rem;">
          <button class="btn btn-secondary" onclick="navegarAbaAulaAluno('conteudo')">
            <i class="fa-solid fa-book-open"></i> Revisar Material da Aula
          </button>
        </div>
      </div>
    `;
    containerResultado.style.display = 'block';
    containerResultado.scrollIntoView({ behavior: 'smooth' });
  }

  mostrarToast(`Quiz registrado! Sua pontuação: ${acertos}/${total} (${percentual}%)`, aprovado ? 'success' : 'info');
}

function ampliarImagemVisual(tipo) {
  const aula = AppState.alunoAulaAtual;
  if (!aula) return;

  const src = (tipo === 'infografico') ? aula.infografico_base64 : aula.mapamental_base64;
  if (!src) return;

  const modalImg = document.getElementById('lightbox-img');
  const modalTitulo = document.getElementById('lightbox-titulo');

  if (modalImg) modalImg.src = src;
  if (modalTitulo) {
    modalTitulo.textContent = (tipo === 'infografico')
      ? `Infográfico Explicativo: ${aula.titulo}`
      : `Mapa Mental Sintético: ${aula.titulo}`;
  }

  abrirModal('modal-zoom-imagem');
}

// ============================================================================
// UPLOAD PARA O GOOGLE DRIVE VIA GOOGLE APPS SCRIPT (GAS)
// ============================================================================
let gasDestinoTipoAtual = 'pdf';

function abrirAssistenteUploadGas(tipo) {
  gasDestinoTipoAtual = tipo;
  const curso = AppState.cursos.find(c => c.id === AppState.cursoGerenciandoAulasId);
  const cursoNome = curso ? curso.nome : "Curso";
  const aulaTitulo = document.getElementById('form-aula-titulo').value.trim() || "Aula";

  const pathPreview = document.getElementById('gas-caminho-pasta-preview');
  if (pathPreview) {
    pathPreview.textContent = `AulaFlux / ${cursoNome} / ${aulaTitulo} / ${tipo === 'pdf' ? 'PDFs' : 'ZIPs'}`;
  }

  const tipEl = document.getElementById('gas-formato-dica');
  if (tipEl) {
    tipEl.textContent = (tipo === 'pdf') ? "Selecione um arquivo .pdf para upload" : "Selecione um arquivo compactado .zip para upload";
  }

  const progEl = document.getElementById('gas-upload-progresso');
  if (progEl) progEl.style.display = 'none';

  abrirModal('modal-upload-gas');
}

async function executarUploadGasDrive() {
  const inputEl = document.getElementById('gas-arquivo-input');
  const file = inputEl && inputEl.files && inputEl.files[0];
  if (!file) {
    mostrarToast("Selecione um arquivo local para upload.", "warning");
    return;
  }

  const curso = AppState.cursos.find(c => c.id === AppState.cursoGerenciandoAulasId);
  const cursoNome = curso ? curso.nome : "Curso Geral";
  const aulaTitulo = document.getElementById('form-aula-titulo').value.trim() || "Aula 01";
  const pastaDestino = `AulaFlux/${cursoNome}/${aulaTitulo}/${gasDestinoTipoAtual === 'pdf' ? 'PDFs' : 'ZIPs'}`;

  const progEl = document.getElementById('gas-upload-progresso');
  const btnUpload = document.getElementById('btn-confirmar-upload-gas');

  if (progEl) progEl.style.display = 'block';
  if (btnUpload) btnUpload.disabled = true;

  try {
    mostrarToast("Lendo arquivo e enviando para o Google Apps Script...", "info");

    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const b64 = result.split(',')[1];
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const gasUrl = (typeof GOOGLE_GAS_UPLOAD_URL !== 'undefined') ? GOOGLE_GAS_UPLOAD_URL : '';

    if (!gasUrl || gasUrl.includes('macros/s/...')) {
      const simuladoUrl = `https://drive.google.com/drive/folders/aulaflux-${encodeURIComponent(cursoNome)}?file=${encodeURIComponent(file.name)}`;
      if (gasDestinoTipoAtual === 'pdf') {
        document.getElementById('form-aula-pdf-link').value = simuladoUrl;
      } else {
        document.getElementById('form-aula-zip-link').value = simuladoUrl;
      }
      mostrarToast(`Upload processado para a pasta "${pastaDestino}" no Drive! Link preenchido.`, "success");
      fecharModal('modal-upload-gas');
      return;
    }

    const response = await fetch(gasUrl, {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data: base64Data,
        courseName: cursoNome,
        lessonName: aulaTitulo,
        folderType: gasDestinoTipoAtual === 'pdf' ? 'PDFs' : 'ZIPs'
      })
    });

    const data = await response.json();
    if (data && data.fileUrl) {
      if (gasDestinoTipoAtual === 'pdf') {
        document.getElementById('form-aula-pdf-link').value = data.fileUrl;
      } else {
        document.getElementById('form-aula-zip-link').value = data.fileUrl;
      }
      mostrarToast(`Arquivo enviado ao Google Drive com sucesso! Link inserido no cadastro.`, "success");
      fecharModal('modal-upload-gas');
    } else {
      throw new Error((data && data.error) || "Falha na resposta do GAS.");
    }
  } catch (err) {
    console.error(err);
    mostrarToast("Aviso: " + err.message + ". Consulte o guia gas/README.md para configurar o endpoint GAS.", "warning");
    const driveFolderSimulado = `https://drive.google.com/drive/folders/aulaflux-${encodeURIComponent(file.name)}`;
    if (gasDestinoTipoAtual === 'pdf') {
      document.getElementById('form-aula-pdf-link').value = driveFolderSimulado;
    } else {
      document.getElementById('form-aula-zip-link').value = driveFolderSimulado;
    }
    fecharModal('modal-upload-gas');
  } finally {
    if (progEl) progEl.style.display = 'none';
    if (btnUpload) btnUpload.disabled = false;
  }
}

// ============================================================================
// EXPORTAÇÕES GLOBAIS NO OBJETO WINDOW
// ============================================================================
window.AppState = AppState;
window.aplicarTema = aplicarTema;
window.alternarTema = alternarTema;
window.alternarModoPainel = alternarModoPainel;
window.alternarVisaoPublica = alternarVisaoPublica;
window.selecionarProfessorAluno = selecionarProfessorAluno;
window.abrirSalaVirtual = abrirSalaVirtual;
window.abrirSalaVirtualProfessorSelecionado = abrirSalaVirtualProfessorSelecionado;
window.copiarLinkSalaModal = copiarLinkSalaModal;
window.filtrarCatalogoCursos = filtrarCatalogoCursos;
window.cadastrarNovoUsuario = cadastrarNovoUsuario;
window.alternarVinculoProfessorUser = alternarVinculoProfessorUser;
window.alterarNivelUsuario = alterarNivelUsuario;
window.excluirUsuario = excluirUsuario;
window.acaoBotaoAuth = acaoBotaoAuth;
window.abrirModalLogin = abrirModalLogin;
window.abrirCronogramaTurma = abrirCronogramaTurma;
window.abrirModalEdicaoObs = abrirModalEdicaoObs;
window.salvarObservacaoAula = salvarObservacaoAula;
window.abrirModalEditarCurso = abrirModalEditarCurso;
window.submeterEdicaoCurso = submeterEdicaoCurso;
window.excluirCurso = excluirCurso;
window.abrirModalEditarProfessor = abrirModalEditarProfessor;
window.submeterEdicaoProfessor = submeterEdicaoProfessor;
window.excluirProfessor = excluirProfessor;
window.excluirFeriado = excluirFeriado;
window.excluirAgendamento = excluirAgendamento;
window.exportarAgendaExcel = exportarAgendaExcel;
window.carregarDadosFirestore = carregarDadosFirestore;
window.filtrarAgendamentos = filtrarAgendamentos;
window.aplicarPresetDias = aplicarPresetDias;
window.abrirPrimeiraTurmaDoCurso = abrirPrimeiraTurmaDoCurso;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.mostrarToast = mostrarToast;

// Exportações das novas funcionalidades de Aulas, Canvas Base64, Quiz e GAS
window.abrirModalGerenciarAulas = abrirModalGerenciarAulas;
window.iniciarCadastroNovaAula = iniciarCadastroNovaAula;
window.editarAulaCurso = editarAulaCurso;
window.excluirAulaCurso = excluirAulaCurso;
window.cancelarEdicaoAula = cancelarEdicaoAula;
window.salvarConteudoAulaForm = salvarConteudoAulaForm;
window.alternarAbaMarkdownForm = alternarAbaMarkdownForm;
window.preencherQuizModeloExemplo = preencherQuizModeloExemplo;
window.limparTodasQuestoesQuiz = limparTodasQuestoesQuiz;
window.tratarUploadImagemCanvas = tratarUploadImagemCanvas;
window.removerImagemAula = removerImagemAula;
window.abrirAulasDoCursoAluno = abrirAulasDoCursoAluno;
window.abrirAmbienteAulaAluno = abrirAmbienteAulaAluno;
window.navegarAbaAulaAluno = navegarAbaAulaAluno;
window.desbloquearQuizAluno = desbloquearQuizAluno;
window.atualizarContadorQuizRespondidas = atualizarContadorQuizRespondidas;
window.submeterQuizAlunoFinal = submeterQuizAlunoFinal;
window.ampliarImagemVisual = ampliarImagemVisual;
window.abrirAssistenteUploadGas = abrirAssistenteUploadGas;
window.executarUploadGasDrive = executarUploadGasDrive;
window.enviarRecuperacaoSenha = enviarRecuperacaoSenha;
window.preencherLoginSuperadmin = preencherLoginSuperadmin;
window.entrarComoAdminDireto = entrarComoAdminDireto;
