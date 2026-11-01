/**
 * ============================================================================
 * AULAFLUX - SISTEMA DE GESTÃO DE CURSOS, PROFESSORES, FERIADOS E CRONOGRAMAS
 * Integração Cloud Firestore + Firebase Authentication + Controle de Níveis
 * ============================================================================
 */

// Dados Iniciais Padrão (Apenas Superusuário, Professores e Curso Inicial)
const DEFAULT_LEGACY_DATA = {
  cursos: [
    {
      id: "curso-mkt-digital-ia",
      nome: "Marketing Digital com IA",
      duracao_horas: 48,
      descricao: "Formação prática em Marketing Digital com Inteligência Artificial, Funil Pirata (AARRR), Tráfego Pago, Copywriting e Analytics."
    }
  ],
  professores: [
    { id: "d1a8e6e6-eb94-41fa-bb43-a7d389b0d6cb", nome: "Luiz", area: "TI & Analytics" },
    { id: "2b9edee2-6aa0-45b3-99f0-464eb1f4d5a1", nome: "Gilberto", area: "TI & Programação" },
    { id: "51df2328-0849-497f-b8bc-038bbae2713a", nome: "Eduardo", area: "TI & Redes" },
    { id: "887469b4-02f3-4c5f-ba9e-445c46e58370", nome: "Danilo", area: "TI & Dados" }
  ],
  feriados: [],
  usuarios: [
    {
      uid: "admin-super-padrao",
      nome: "Administrador Super",
      email: "admin@aulaflux.com",
      role: "superadmin",
      professor_id: null,
      professor_nome: null,
      criado_em: "19/10/2026"
    }
  ],
  agendamentos: []
};

// Estado Global da Aplicação
const AppState = {
  theme: localStorage.getItem('aulaflux_theme') || 'dark',
  currentUser: null,
  currentUserProfile: null, // { uid, nome, email, role, professor_id, professor_nome }
  modoPainel: 'portal', // 'portal' (Aluno/Público), 'aula' (Página da Aula) ou 'admin' (Área Administrativa)
  visaoPublica: 'professores', // 'professores' ou 'todos-cursos'
  selectedProfessorId: null,
  buscaCatalogoCursos: '',

  cursos: [...DEFAULT_LEGACY_DATA.cursos],
  professores: [...DEFAULT_LEGACY_DATA.professores],
  feriados: [],
  agendamentos: [],
  usuarios: [...DEFAULT_LEGACY_DATA.usuarios],

  quizRespostas: [],
  gameResultados: [],
  tarefasEntregas: [],

  alunoNomeCompleto: localStorage.getItem('aulaflux_aluno_nome_completo') || '',
  gasWebAppUrl: localStorage.getItem('aulaflux_gas_webapp_url') || ((typeof GAS_CONFIG !== 'undefined' && GAS_CONFIG.webAppUrl) ? GAS_CONFIG.webAppUrl : ''),

  aulaContexto: {
    turmaId: null,
    turmaNome: '',
    cursoId: null,
    cursoNome: '',
    professorId: null,
    professorNome: '',
    totalAulasCronograma: 6,
    aulaAtualNumero: 1,
    dadosAulaAtual: null,
    quizAtual: null,
    callbackAposIdentificacao: null,
    arquivosSelecionadosUpload: []
  },

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

  // Inicializar campo de URL do GAS no painel admin se existir
  const inputGasUrl = document.getElementById('gas-webapp-url-input') || document.getElementById('input-gas-webapp-url');
  if (inputGasUrl && AppState.gasWebAppUrl) {
    inputGasUrl.value = AppState.gasWebAppUrl;
  }

  // Renderizar interface imediatamente
  renderizarTudo();

  // Inicializar Firebase e sincronizar com Firestore
  inicializarFirebase();
  configurarEventosUI();
  configurarListenerMensagensGame();
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
  renderizarTabelasResultados();
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

async function garantirDadosIniciaisPadrao() {
  if (!db) return;

  try {
    // 1. Garantir que o curso "Marketing Digital com IA" esteja cadastrado no Firestore
    const snapCursos = await db.collection('cursos').get().catch(() => null);
    if (snapCursos) {
      const temCursoMkt = snapCursos.docs.some(d => {
        const data = d.data() || {};
        return (data.nome || '').trim().toLowerCase() === 'marketing digital com ia';
      });
      if (!temCursoMkt) {
        const cursoPadrao = DEFAULT_LEGACY_DATA.cursos[0];
        await db.collection('cursos').doc(cursoPadrao.id).set({
          nome: cursoPadrao.nome,
          duracao_horas: cursoPadrao.duracao_horas,
          descricao: cursoPadrao.descricao
        }, { merge: true }).catch(() => null);
      }
    }

    // 2. Garantir professores padrão se a coleção estiver vazia
    const snapProfs = await db.collection('professores').get().catch(() => null);
    if (snapProfs && snapProfs.empty) {
      for (const prof of DEFAULT_LEGACY_DATA.professores) {
        await db.collection('professores').doc(prof.id).set({
          nome: prof.nome,
          area: prof.area
        }).catch(() => null);
      }
    }

    // 3. Garantir superusuário padrão se não houver
    const snapUsers = await db.collection('usuarios').get().catch(() => null);
    if (snapUsers && snapUsers.empty) {
      const su = DEFAULT_LEGACY_DATA.usuarios[0];
      await db.collection('usuarios').doc(su.uid).set(su).catch(() => null);
    }
  } catch (err) {
    console.warn("Aviso ao verificar dados iniciais:", err);
  }
}

async function sincronizarComFirestore() {
  if (!db) return;

  try {
    await garantirDadosIniciaisPadrao();

    const [snapCursos, snapProfs, snapFeriados, snapAgend, snapUsuarios, snapQuiz, snapGame, snapEntregas] = await Promise.all([
      db.collection('cursos').get().catch(() => null),
      db.collection('professores').get().catch(() => null),
      db.collection('feriados').get().catch(() => null),
      db.collection('agendamentos').get().catch(() => null),
      db.collection('usuarios').get().catch(() => null),
      db.collection('quiz_respostas').get().catch(() => null),
      db.collection('game_resultados').get().catch(() => null),
      db.collection('tarefas_entregas').get().catch(() => null)
    ]);

    if (snapCursos && !snapCursos.empty) {
      AppState.cursos = snapCursos.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapProfs) {
      if (!snapProfs.empty) {
        AppState.professores = snapProfs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        AppState.professores = [...DEFAULT_LEGACY_DATA.professores];
      }
    }
    if (snapFeriados) {
      AppState.feriados = snapFeriados.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapAgend) {
      AppState.agendamentos = snapAgend.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapUsuarios) {
      if (!snapUsuarios.empty) {
        AppState.usuarios = snapUsuarios.docs.map(doc => ({ uid: doc.id, id: doc.id, ...doc.data() }));
      } else {
        AppState.usuarios = [...DEFAULT_LEGACY_DATA.usuarios];
      }
    }
    if (snapQuiz) {
      AppState.quizRespostas = snapQuiz.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapGame) {
      AppState.gameResultados = snapGame.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    if (snapEntregas) {
      AppState.tarefasEntregas = snapEntregas.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    if (!AppState.selectedProfessorId && AppState.professores.length > 0) {
      AppState.selectedProfessorId = AppState.professores[0].id;
    } else if (AppState.professores.length === 0) {
      AppState.selectedProfessorId = null;
    }

    renderizarTudo();

    // Listeners em tempo real
    db.collection('cursos').onSnapshot(snap => {
      if (!snap.empty) {
        AppState.cursos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      renderizarTabelaCursos();
      popularSelects();
      renderizarCatalogoTodosCursos();
    });

    db.collection('professores').onSnapshot(snap => {
      AppState.professores = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderizarTabelaProfessores();
      popularSelects();
      renderizarPortalAlunoProfessor();
    });

    db.collection('feriados').onSnapshot(snap => {
      AppState.feriados = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderizarTabelaFeriados();
    });

    db.collection('agendamentos').onSnapshot(snap => {
      AppState.agendamentos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderizarTabelaAgendamentos();
      renderizarTabelaCursos();
      renderizarTabelaProfessores();
      renderizarPortalAlunoProfessor();
      renderizarCatalogoTodosCursos();
    });

    db.collection('usuarios').onSnapshot(snap => {
      if (!snap.empty) {
        AppState.usuarios = snap.docs.map(d => ({ uid: d.id, id: d.id, ...d.data() }));
        renderizarTabelaUsuarios();
      }
    });

    db.collection('quiz_respostas').onSnapshot(snap => {
      AppState.quizRespostas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderizarTabelasResultados();
    });

    db.collection('game_resultados').onSnapshot(snap => {
      AppState.gameResultados = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderizarTabelasResultados();
    });

    db.collection('tarefas_entregas').onSnapshot(snap => {
      AppState.tarefasEntregas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderizarTabelasResultados();
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
// CONTROLE DE NAVEGAÇÃO ENTRE PORTAL DO ALUNO, PÁGINA DE AULA E PAINEL ADMIN
// ============================================================================
function alternarModoPainel(modo) {
  const secPortal = document.getElementById('secao-portal-aluno');
  const secAula = document.getElementById('secao-pagina-aula');
  const secAdmin = document.getElementById('secao-painel-admin');
  const videoEl = document.getElementById('aula-video-player');
  if (videoEl && typeof videoEl.pause === 'function') {
    videoEl.pause();
  }

  if (modo === 'admin') {
    if (!AppState.currentUser) {
      mostrarToast("Acesso restrito: faça login com sua conta para acessar o painel de gestão.", "info");
      abrirModalLogin();
      return;
    }
    AppState.modoPainel = 'admin';
    if (secPortal) secPortal.style.display = 'none';
    if (secAula) secAula.style.display = 'none';
    if (secAdmin) secAdmin.style.display = 'block';

    const btnNavPortal = document.getElementById('btn-nav-portal');
    const btnNavAdmin = document.getElementById('btn-nav-admin');
    if (btnNavPortal) btnNavPortal.classList.remove('active');
    if (btnNavAdmin) btnNavAdmin.classList.add('active');

    aplicarPermissoesUsuario();
    renderizarTabelasResultados();
  } else {
    AppState.modoPainel = 'portal';
    if (secPortal) secPortal.style.display = 'block';
    if (secAula) secAula.style.display = 'none';
    if (secAdmin) secAdmin.style.display = 'none';

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
// PORTAL DO ALUNO: SELEÇÃO DE PROFESSOR E CONSULTA DE TURMAS / CRONOGRAMAS
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

  // 3. Renderizar Turmas do Professor Selecionado
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
                <span>Carga: ${turma.duracao_aula || 8}h por encontro • ${(turma.aulas_geradas && turma.aulas_geradas.length) || 0} Encontros</span>
              </div>

              ${proximaAula ? `
                <div class="turma-proxima-aula-box">
                  <span class="label"><i class="fa-solid fa-bell"></i> Primeiro / Próximo Encontro:</span>
                  <div class="data">${proximaAula.data} (${proximaAula.dia_semana || 'Semana'}) • ${turma.periodo}</div>
                </div>
              ` : ''}
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.6rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
              <button class="btn btn-primary" style="width: 100%; font-size: 0.825rem;" onclick="iniciarAcessoAulasTurma('${turma.id}', 1)">
                <i class="fa-solid fa-graduation-cap"></i>
                <span>Acessar Aulas da Turma</span>
              </button>
              <button class="btn btn-secondary" style="width: 100%; font-size: 0.825rem;" onclick="abrirCronogramaTurma('${turma.id}')">
                <i class="fa-solid fa-calendar-days"></i>
                <span>Ver Cronograma Completo</span>
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
// CATÁLOGO DE TODOS OS CURSOS (CONSULTA DE CURSOS E EMENTAS)
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
        <i class="fa-solid fa-book-open" style="font-size: 2rem; color: var(--accent-cyan); margin-bottom: 0.5rem; display: block;"></i>
        Nenhum curso cadastrado no momento.
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
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-primary" style="flex: 1; font-size: 0.8rem; padding: 0.45rem;" onclick="acessarAulasPorCurso('${curso.id}')" title="Acessar Conteúdo e Aulas">
            <i class="fa-solid fa-graduation-cap"></i> <span>Acessar Aulas</span>
          </button>
          <button class="btn btn-secondary" style="flex: 1; font-size: 0.8rem; padding: 0.45rem;" onclick="abrirPrimeiraTurmaDoCurso('${curso.id}')" title="Ver Cronograma da Turma">
            <i class="fa-solid fa-calendar-days"></i> <span>Cronograma</span>
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
  const curso = AppState.cursos.find(c => c.id === cursoId);
  const turmas = AppState.agendamentos.filter(a => a.curso_id === cursoId || (curso && a.curso_nome === curso.nome));
  if (turmas.length > 0) {
    abrirCronogramaTurma(turmas[0].id);
  } else {
    mostrarToast("Nenhuma turma com cronograma gerado para este curso. Acessando aulas diretamente!", "info");
    acessarAulasPorCurso(cursoId);
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
    const tabId = activeTab ? activeTab.getAttribute('data-tab') : '';
    if (activeTab && tabId !== 'tab-agendamentos' && tabId !== 'tab-resultados') {
      ativarAbaAdmin('tab-agendamentos');
    }
  }

  popularSelects();
  renderizarTabelaAgendamentos();
  renderizarTabelasResultados();
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
          <button class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="abrirModalEditarUsuario('${u.uid}')" title="Editar Usuário">
            <i class="fa-solid fa-pen"></i>
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

function alternarVinculoProfessorEditUser(role) {
  const group = document.getElementById('group-edit-vinculo-prof');
  if (group) {
    group.style.display = (role === 'professor') ? 'flex' : 'none';
  }
}

function abrirModalEditarUsuario(uid) {
  if (!verificarPermissaoRole(['superadmin'])) return;

  const u = AppState.usuarios.find(item => item.uid === uid);
  if (!u) return;

  document.getElementById('edit-usuario-uid').value = u.uid;
  document.getElementById('edit-usuario-nome').value = u.nome || '';
  document.getElementById('edit-usuario-email').value = u.email || '';
  document.getElementById('edit-usuario-role').value = u.role || 'professor';

  const selectProf = document.getElementById('edit-usuario-prof');
  if (selectProf) {
    selectProf.innerHTML = '<option value="">Selecione o professor...</option>' +
      AppState.professores.map(p => `<option value="${p.id}">${p.nome} (${p.area || 'TI'})</option>`).join('');
    selectProf.value = u.professor_id || '';
  }

  alternarVinculoProfessorEditUser(u.role || 'professor');
  abrirModal('edit-usuario-modal');
}

async function submeterEdicaoUsuario(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!verificarPermissaoRole(['superadmin'])) return;

  const uid = document.getElementById('edit-usuario-uid').value;
  const nome = document.getElementById('edit-usuario-nome').value.trim();
  const email = document.getElementById('edit-usuario-email').value.trim();
  const role = document.getElementById('edit-usuario-role').value;
  const profId = document.getElementById('edit-usuario-prof').value;

  if (!nome || !email) {
    mostrarToast("Nome e e-mail são obrigatórios.", "error");
    return;
  }

  const profObj = AppState.professores.find(p => p.id === profId);
  const dadosAtualizados = {
    nome,
    email,
    role,
    professor_id: (role === 'professor' && profObj) ? profObj.id : null,
    professor_nome: (role === 'professor' && profObj) ? profObj.nome : null
  };

  try {
    if (db) {
      await db.collection('usuarios').doc(uid).set(dadosAtualizados, { merge: true });
    }
    const idx = AppState.usuarios.findIndex(item => item.uid === uid);
    if (idx !== -1) {
      AppState.usuarios[idx] = { ...AppState.usuarios[idx], ...dadosAtualizados };
    }
    renderizarTabelaUsuarios();
    fecharModal('edit-usuario-modal');
    mostrarToast(`Usuário "${nome}" atualizado com sucesso!`, "success");
  } catch (err) {
    mostrarToast("Erro ao atualizar usuário: " + err.message, "error");
  }
}

async function alterarNivelUsuario(uid) {
  abrirModalEditarUsuario(uid);
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

  const feriadosExatosSet = new Set();
  const feriadosAnuaisSet = new Set();

  (feriadosArray || []).forEach(f => {
    if (!f || !f.data) return;
    let d = f.data;
    let dayStr, monthStr, yearStr;
    if (d.includes('-')) {
      const [y, m, day] = d.split('-');
      dayStr = day.padStart(2, '0');
      monthStr = m.padStart(2, '0');
      yearStr = y;
    } else {
      const parts = d.split('/');
      dayStr = (parts[0] || '').padStart(2, '0');
      monthStr = (parts[1] || '').padStart(2, '0');
      yearStr = parts[2] || '';
    }

    if (f.recorrencia === 'anual' || !yearStr) {
      feriadosAnuaisSet.add(`${dayStr}/${monthStr}`);
    } else {
      feriadosExatosSet.add(`${dayStr}/${monthStr}/${yearStr}`);
    }
  });

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
    const diaMesFormatado = `${dd}/${mm}`;

    const ehFeriado = feriadosExatosSet.has(dataFormatada) || feriadosAnuaisSet.has(diaMesFormatado);

    if (diasSemana.includes(pythonWeekday) && !ehFeriado) {
      aulasGeradas.push({
        numero: aulasGeradas.length + 1,
        data: dataFormatada,
        dia_semana: nomesDias[jsDay],
        periodo: periodo,
        duracao_aula: duracaoAulaHoras
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

function abrirModalEditarAgendamento(id) {
  if (!AppState.currentUser || !AppState.currentUserProfile) {
    mostrarToast("Faça login para editar agendamentos.", "error");
    abrirModalLogin();
    return;
  }

  const ag = AppState.agendamentos.find(a => a.id === id);
  if (!ag) return;

  const role = AppState.currentUserProfile.role;
  if (role === 'professor' && ag.professor_id !== AppState.currentUserProfile.professor_id) {
    mostrarToast("Permissão negada: você só pode editar suas próprias turmas.", "error");
    return;
  }

  document.getElementById('edit-agenda-id').value = ag.id;
  document.getElementById('edit-agenda-turma-nome').value = ag.turma_nome || '';

  const selCurso = document.getElementById('edit-agenda-select-curso');
  if (selCurso) {
    selCurso.innerHTML = AppState.cursos.map(c => `<option value="${c.id}">${c.nome} (${c.duracao_horas}h)</option>`).join('');
    selCurso.value = ag.curso_id || '';
  }

  const selProf = document.getElementById('edit-agenda-select-prof');
  if (selProf) {
    selProf.innerHTML = AppState.professores.map(p => `<option value="${p.id}">${p.nome} (${p.area || 'TI'})</option>`).join('');
    selProf.value = ag.professor_id || '';
    selProf.disabled = (role === 'professor');
  }

  if (ag.data_inicio && ag.data_inicio.includes('/')) {
    const [d, m, y] = ag.data_inicio.split('/');
    document.getElementById('edit-agenda-data-inicio').value = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else {
    document.getElementById('edit-agenda-data-inicio').value = ag.data_inicio || '';
  }

  document.getElementById('edit-agenda-duracao-aula').value = ag.duracao_aula || 8;
  document.getElementById('edit-agenda-periodo').value = ag.periodo || 'Noite';

  const dias = Array.isArray(ag.dias_semana) ? ag.dias_semana : [0, 2];
  document.querySelectorAll('input[name="edit_agenda_dias"]').forEach(cb => {
    cb.checked = dias.includes(parseInt(cb.value));
  });

  abrirModal('edit-agendamento-modal');
}

async function submeterEdicaoAgendamento(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!AppState.currentUser || !AppState.currentUserProfile) return;

  const id = document.getElementById('edit-agenda-id').value;
  const ag = AppState.agendamentos.find(a => a.id === id);
  if (!ag) return;

  const role = AppState.currentUserProfile.role;
  const turmaNome = document.getElementById('edit-agenda-turma-nome').value.trim();
  const cursoId = document.getElementById('edit-agenda-select-curso').value;
  let profId = document.getElementById('edit-agenda-select-prof').value;
  const dataInicioIso = document.getElementById('edit-agenda-data-inicio').value;
  const duracaoAula = parseInt(document.getElementById('edit-agenda-duracao-aula').value) || 8;
  const periodo = document.getElementById('edit-agenda-periodo').value;

  if (role === 'professor' && AppState.currentUserProfile.professor_id) {
    profId = AppState.currentUserProfile.professor_id;
  }

  const checkboxes = document.querySelectorAll('input[name="edit_agenda_dias"]:checked');
  const diasSemana = Array.from(checkboxes).map(cb => parseInt(cb.value));

  if (!turmaNome || !cursoId || !profId || !dataInicioIso || diasSemana.length === 0) {
    mostrarToast("Preencha todos os campos e selecione os dias da semana.", "error");
    return;
  }

  const curso = AppState.cursos.find(c => c.id === cursoId);
  const professor = AppState.professores.find(p => p.id === profId);
  if (!curso || !professor) {
    mostrarToast("Curso ou professor não encontrado.", "error");
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
    mostrarToast("Nenhuma aula gerada com os critérios definidos.", "error");
    return;
  }

  const conflito = verificarConflitoProfessor(profId, aulasGeradas, id);
  if (conflito) {
    mostrarToast(
      `Conflito de Horário! O professor ${professor.nome} já possui aula em ${conflito.data} (${conflito.periodo}) na turma "${conflito.turmaConflito}".`,
      "error"
    );
    return;
  }

  const dadosAtualizados = {
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
    aulas_geradas: aulasGeradas
  };

  try {
    if (db) {
      await db.collection('agendamentos').doc(id).update(dadosAtualizados);
    }
    const idx = AppState.agendamentos.findIndex(a => a.id === id);
    if (idx !== -1) {
      AppState.agendamentos[idx] = { ...AppState.agendamentos[idx], ...dadosAtualizados };
    }
    renderizarTabelaAgendamentos();
    renderizarPortalAlunoProfessor();
    renderizarCatalogoTodosCursos();
    fecharModal('edit-agendamento-modal');
    mostrarToast(`Turma "${turmaNome}" atualizada com sucesso!`, "success");
  } catch (err) {
    mostrarToast("Erro ao atualizar agendamento: " + err.message, "error");
  }
}

// ============================================================================
// VISUALIZAÇÃO DO CRONOGRAMA DE AULAS DA TURMA
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

  const btnAcessarAulas = document.getElementById('btn-acessar-aulas-cronograma');
  if (btnAcessarAulas) {
    btnAcessarAulas.onclick = () => {
      fecharModal('cronograma-modal');
      iniciarAcessoAulasTurma(ag.id, 1);
    };
  }

  const tbody = document.getElementById('cronograma-aulas-tbody');
  tbody.innerHTML = '';

  (ag.aulas_geradas || []).forEach((aula, idx) => {
    const numAula = aula.numero || (idx + 1);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${numAula}</strong></td>
      <td>${aula.data}</td>
      <td>${aula.dia_semana || obterDiaSemanaStr(aula.data)}</td>
      <td><span class="badge-periodo ${aula.periodo.toLowerCase()}">${aula.periodo}</span></td>
      <td>${aula.duracao_aula}h</td>
      <td>
        <button class="btn btn-primary" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;" onclick="fecharModal('cronograma-modal'); iniciarAcessoAulasTurma('${ag.id}', ${numAula})">
          <i class="fa-solid fa-play"></i> Acessar Aula ${numAula}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  abrirModal('cronograma-modal');
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

    mostrarToast(`Curso "${nome}" salvo com sucesso!`, "success");
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

  const turmasVinculadas = AppState.agendamentos.filter(a => a.curso_id === id || a.curso_nome === curso.nome);
  const msgConfirm = turmasVinculadas.length > 0
    ? `ATENÇÃO: O curso "${curso.nome}" possui ${turmasVinculadas.length} turma(s) vinculada(s).\n\nDeseja realmente excluir este curso e suas turmas agendadas?`
    : `Deseja realmente excluir o curso "${curso.nome}"?`;

  if (!confirm(msgConfirm)) return;

  try {
    if (db) {
      await db.collection('cursos').doc(id).delete();
      for (const ag of turmasVinculadas) {
        await db.collection('agendamentos').doc(ag.id).delete().catch(() => null);
      }
    }

    AppState.cursos = AppState.cursos.filter(c => c.id !== id);
    AppState.agendamentos = AppState.agendamentos.filter(a => a.curso_id !== id && a.curso_nome !== curso.nome);

    renderizarTabelaCursos();
    renderizarTabelaAgendamentos();
    popularSelects();
    renderizarCatalogoTodosCursos();
    renderizarPortalAlunoProfessor();
    mostrarToast(`Curso "${curso.nome}" excluído com sucesso!`, "success");
  } catch (err) {
    mostrarToast("Erro ao excluir curso: " + err.message, "error");
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

  if (!nome || !area) {
    mostrarToast("Preencha nome e área de atuação.", "error");
    return;
  }

  const btn = document.getElementById('btn-salvar-prof');
  btn.disabled = true;

  try {
    const profData = {
      nome: nome,
      area: area
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

  abrirModal('edit-prof-modal');
}

async function submeterEdicaoProfessor(e) {
  e.preventDefault();
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const id = document.getElementById('edit-prof-id').value;
  const nome = document.getElementById('edit-prof-nome').value.trim();
  const area = document.getElementById('edit-prof-area').value.trim();

  try {
    if (db) {
      await db.collection('professores').doc(id).update({
        nome: nome,
        area: area
      });
    }
    const idx = AppState.professores.findIndex(p => p.id === id);
    if (idx !== -1) {
      AppState.professores[idx].nome = nome;
      AppState.professores[idx].area = area;
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

  const turmasVinculadas = AppState.agendamentos.filter(a => a.professor_id === id);
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;

  if (turmasVinculadas.length > 0 && role !== 'superadmin') {
    mostrarToast(`Não é possível excluir: O(A) professor(a) "${prof.nome}" possui turmas agendadas.`, "error");
    return;
  }

  const msg = turmasVinculadas.length > 0
    ? `O(A) professor(a) "${prof.nome}" possui ${turmasVinculadas.length} turma(s) vinculada(s). Deseja excluir o professor e remover suas turmas agendadas?`
    : `Deseja realmente excluir o professor "${prof.nome}"?`;

  if (!confirm(msg)) return;

  try {
    if (db) {
      await db.collection('professores').doc(id).delete();
      for (const ag of turmasVinculadas) {
        await db.collection('agendamentos').doc(ag.id).delete().catch(() => null);
      }
    }
    AppState.professores = AppState.professores.filter(p => p.id !== id);
    AppState.agendamentos = AppState.agendamentos.filter(a => a.professor_id !== id);
    renderizarTabelaProfessores();
    renderizarTabelaAgendamentos();
    popularSelects();
    renderizarPortalAlunoProfessor();
    mostrarToast(`Professor "${prof.nome}" excluído com sucesso.`, "success");
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
  const recorrenciaEl = document.getElementById('feriado-recorrencia-select');
  const recorrencia = recorrenciaEl ? recorrenciaEl.value : 'anual';

  if (!nome || !dataIso) {
    mostrarToast("Preencha nome e data do feriado.", "error");
    return;
  }

  const [ano, mes, dia] = dataIso.split('-');
  const dataFormatada = `${dia}/${mes}/${ano}`;

  const btn = document.getElementById('btn-salvar-feriado');
  btn.disabled = true;

  try {
    const feriadoData = { nome: nome, data: dataFormatada, recorrencia: recorrencia };
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

function abrirModalEditarFeriado(id) {
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const f = AppState.feriados.find(item => item.id === id);
  if (!f) return;

  document.getElementById('edit-feriado-id').value = f.id;
  document.getElementById('edit-feriado-nome').value = f.nome || '';

  if (f.data && f.data.includes('/')) {
    const [d, m, y] = f.data.split('/');
    document.getElementById('edit-feriado-data').value = `${y || new Date().getFullYear()}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else {
    document.getElementById('edit-feriado-data').value = f.data || '';
  }

  const recSelect = document.getElementById('edit-feriado-recorrencia');
  if (recSelect) {
    recSelect.value = f.recorrencia || 'unico';
  }

  abrirModal('edit-feriado-modal');
}

async function submeterEdicaoFeriado(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!verificarPermissaoRole(['superadmin', 'admin'])) return;

  const id = document.getElementById('edit-feriado-id').value;
  const nome = document.getElementById('edit-feriado-nome').value.trim();
  const dataIso = document.getElementById('edit-feriado-data').value;
  const recSelect = document.getElementById('edit-feriado-recorrencia');
  const recorrencia = recSelect ? recSelect.value : 'unico';

  if (!nome || !dataIso) {
    mostrarToast("Preencha nome e data do feriado.", "error");
    return;
  }

  const [ano, mes, dia] = dataIso.split('-');
  const dataFormatada = `${dia}/${mes}/${ano}`;

  try {
    if (db) {
      await db.collection('feriados').doc(id).update({
        nome: nome,
        data: dataFormatada,
        recorrencia: recorrencia
      });
    }
    const idx = AppState.feriados.findIndex(item => item.id === id);
    if (idx !== -1) {
      AppState.feriados[idx].nome = nome;
      AppState.feriados[idx].data = dataFormatada;
      AppState.feriados[idx].recorrencia = recorrencia;
    }
    renderizarTabelaFeriados();
    fecharModal('edit-feriado-modal');
    mostrarToast(`Feriado "${nome}" atualizado com sucesso!`, "success");
  } catch (err) {
    mostrarToast("Erro ao atualizar feriado: " + err.message, "error");
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
        'Duração (h)': aula.duracao_aula
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
    'Duração (h)': aula.duracao_aula
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

    const podeGerenciarTurma = isAuth && (
      role === 'superadmin' ||
      role === 'admin' ||
      (role === 'professor' && ag.professor_id === AppState.currentUserProfile?.professor_id)
    );

    const btnEditar = podeGerenciarTurma
      ? `<button class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="abrirModalEditarAgendamento('${ag.id}')" title="Editar turma">
          <i class="fa-solid fa-pen"></i>
        </button>`
      : '';

    const btnExcluir = podeGerenciarTurma
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
          <button class="btn btn-primary" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="iniciarAcessoAulasTurma('${ag.id}', 1)" title="Acessar Página de Aulas da Turma">
            <i class="fa-solid fa-graduation-cap"></i>
          </button>
          <button class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="abrirCronogramaTurma('${ag.id}')" title="Ver cronograma detalhado">
            <i class="fa-solid fa-eye"></i>
          </button>
          ${btnEditar}
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
    const acoesHtml = podeGerenciarCursos
      ? `<div style="display:flex; gap:0.35rem; align-items:center;">
          <button class="btn btn-secondary" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="abrirModalEditarCurso('${c.id}')" title="Editar curso"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="excluirCurso('${c.id}')" title="Excluir curso"><i class="fa-solid fa-trash"></i></button>
        </div>`
      : '<span style="color:var(--text-muted); font-size:0.75rem;">-</span>';

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
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Nenhum professor cadastrado.</td></tr>';
    return;
  }

  const isAuth = !!AppState.currentUser;
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;
  const podeGerenciarProfs = isAuth && (role === 'superadmin' || role === 'admin');

  AppState.professores.forEach(p => {
    const turmasVinculadas = AppState.agendamentos.filter(a => a.professor_id === p.id).length;

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
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Nenhum feriado cadastrado.</td></tr>';
    return;
  }

  const isAuth = !!AppState.currentUser;
  const role = AppState.currentUserProfile ? AppState.currentUserProfile.role : null;
  const podeGerenciarFeriados = isAuth && (role === 'superadmin' || role === 'admin');

  AppState.feriados.forEach(f => {
    const isAnual = f.recorrencia === 'anual';
    const partesData = (f.data || '').split('/');
    const dataExibicao = (isAnual && partesData.length >= 2)
      ? `<strong>${partesData[0]}/${partesData[1]}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Todo ano)</span>`
      : (f.data || '-');

    const badgeRecorrencia = isAnual
      ? `<span class="badge-tag" style="background: rgba(16,185,129,0.15); color: var(--accent-emerald);"><i class="fa-solid fa-rotate"></i> Repete todos os anos</span>`
      : `<span class="badge-tag" style="background: rgba(245,158,11,0.15); color: var(--accent-amber);"><i class="fa-regular fa-calendar-check"></i> 1 vez por ano (${partesData[2] || 'Data única'})</span>`;

    const acoesHtml = podeGerenciarFeriados
      ? `<div style="display:flex; gap:0.35rem;">
          <button class="btn btn-secondary" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="abrirModalEditarFeriado('${f.id}')" title="Editar feriado"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="excluirFeriado('${f.id}')" title="Excluir feriado"><i class="fa-solid fa-trash"></i></button>
        </div>`
      : '<span style="color:var(--text-muted); font-size:0.75rem;">-</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="font-size:0.75rem; color:var(--text-muted);">${(f.id || '').substring(0, 8)}...</code></td>
      <td><strong>${f.nome}</strong></td>
      <td>${dataExibicao}</td>
      <td>${badgeRecorrencia}</td>
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

  const formIdentAluno = document.getElementById('form-identificacao-aluno');
  if (formIdentAluno) formIdentAluno.onsubmit = confirmarIdentificacaoAluno;

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.onclick = (e) => {
      if (e.target === modal) fecharModal(modal.id);
    };
  });
}

// ============================================================================
// IDENTIFICAÇÃO DO ALUNO (NOME COMPLETO PARA GRAVAÇÃO NO FIREBASE)
// ============================================================================
function abrirModalIdentificacaoAluno(apenasAlterar = false, callback = null) {
  AppState.aulaContexto.callbackAposIdentificacao = callback;
  const ctx = AppState.aulaContexto;
  const infoBox = document.getElementById('identificacao-aluno-contexto-info');
  if (infoBox) {
    infoBox.innerHTML = `
      <div><strong>Curso:</strong> ${ctx.cursoNome || 'Marketing Digital com IA'}</div>
      <div><strong>Turma:</strong> ${ctx.turmaNome || 'Geral'} • <strong>Professor(a):</strong> ${ctx.professorNome || 'Docente'}</div>
    `;
  }

  const inputNome = document.getElementById('input-aluno-nome-completo');
  if (inputNome) {
    inputNome.value = AppState.alunoNomeCompleto || '';
    setTimeout(() => inputNome.focus(), 100);
  }

  abrirModal('aluno-identificacao-modal');
}

function confirmarIdentificacaoAluno(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inputNome = document.getElementById('input-aluno-nome-completo');
  const nome = inputNome ? inputNome.value.trim().replace(/\s+/g, ' ') : '';

  if (!nome || nome.length < 4 || !nome.includes(' ')) {
    mostrarToast("Por favor, digite seu NOME COMPLETO (nome e sobrenome).", "error");
    if (inputNome) inputNome.focus();
    return;
  }

  AppState.alunoNomeCompleto = nome;
  localStorage.setItem('aulaflux_aluno_nome_completo', nome);
  sessionStorage.setItem('aulaflux_aluno_identificado_sessao', '1');

  const displayEl = document.getElementById('aula-aluno-nome-display');
  if (displayEl) displayEl.textContent = nome;

  fecharModal('aluno-identificacao-modal');
  mostrarToast(`Bem-vindo(a), ${nome}!`, "success");

  // Enviar contexto atualizado para o iframe do Game se estiver aberto
  enviarContextoParaGameIframe();

  if (typeof AppState.aulaContexto.callbackAposIdentificacao === 'function') {
    const cb = AppState.aulaContexto.callbackAposIdentificacao;
    AppState.aulaContexto.callbackAposIdentificacao = null;
    cb();
  }
}

// ============================================================================
// ACESSO ÀS AULAS (POR TURMA OU POR CURSO)
// ============================================================================
function iniciarAcessoAulasTurma(agendamentoId, numeroAulaInicial = 1) {
  const ag = AppState.agendamentos.find(a => a.id === agendamentoId);
  if (!ag) {
    mostrarToast("Turma não encontrada.", "error");
    return;
  }

  const totalAulasCronograma = (ag.aulas_geradas && ag.aulas_geradas.length > 0)
    ? ag.aulas_geradas.length
    : 6;

  AppState.aulaContexto = {
    ...AppState.aulaContexto,
    turmaId: ag.id,
    turmaNome: ag.turma_nome || 'Geral',
    cursoId: ag.curso_id || '',
    cursoNome: ag.curso_nome || 'Marketing Digital com IA',
    professorId: ag.professor_id || '',
    professorNome: ag.professor_nome || 'Professor',
    totalAulasCronograma: totalAulasCronograma,
    aulaAtualNumero: numeroAulaInicial || 1
  };

  const abrirDireto = () => {
    exibirSecaoPaginaAula();
    abrirPaginaAula(AppState.aulaContexto.aulaAtualNumero);
  };

  if (!AppState.alunoNomeCompleto || !sessionStorage.getItem('aulaflux_aluno_identificado_sessao')) {
    abrirModalIdentificacaoAluno(false, abrirDireto);
  } else {
    abrirDireto();
  }
}

function acessarAulasPorCurso(cursoId) {
  const curso = AppState.cursos.find(c => c.id === cursoId) || DEFAULT_LEGACY_DATA.cursos[0];
  if (!curso) return;

  // Verificar se há alguma turma ativa deste curso (priorizando professor selecionado)
  let turmasCurso = AppState.agendamentos.filter(a => a.curso_id === curso.id || a.curso_nome === curso.nome);
  if (AppState.selectedProfessorId) {
    const turmasProf = turmasCurso.filter(a => a.professor_id === AppState.selectedProfessorId);
    if (turmasProf.length > 0) turmasCurso = turmasProf;
  }

  if (turmasCurso.length > 0) {
    iniciarAcessoAulasTurma(turmasCurso[0].id, 1);
    return;
  }

  const profSelecionado = AppState.professores.find(p => p.id === AppState.selectedProfessorId) || AppState.professores[0] || { id: 'prof-padrao', nome: 'Docente' };
  const totalAulasEstimado = Math.max(6, Math.ceil((curso.duracao_horas || 48) / 8));

  AppState.aulaContexto = {
    ...AppState.aulaContexto,
    turmaId: 'turma-geral-' + curso.id,
    turmaNome: 'Geral',
    cursoId: curso.id,
    cursoNome: curso.nome,
    professorId: profSelecionado.id,
    professorNome: profSelecionado.nome,
    totalAulasCronograma: totalAulasEstimado,
    aulaAtualNumero: 1
  };

  const abrirDireto = () => {
    exibirSecaoPaginaAula();
    abrirPaginaAula(1);
  };

  if (!AppState.alunoNomeCompleto || !sessionStorage.getItem('aulaflux_aluno_identificado_sessao')) {
    abrirModalIdentificacaoAluno(false, abrirDireto);
  } else {
    abrirDireto();
  }
}

function exibirSecaoPaginaAula() {
  AppState.modoPainel = 'aula';
  const secPortal = document.getElementById('secao-portal-aluno');
  const secAula = document.getElementById('secao-pagina-aula');
  const secAdmin = document.getElementById('secao-painel-admin');

  if (secPortal) secPortal.style.display = 'none';
  if (secAdmin) secAdmin.style.display = 'none';
  if (secAula) secAula.style.display = 'block';

  const displayEl = document.getElementById('aula-aluno-nome-display');
  if (displayEl) displayEl.textContent = AppState.alunoNomeCompleto || 'Não identificado';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fecharPaginaAula() {
  const videoEl = document.getElementById('aula-video-player');
  if (videoEl && typeof videoEl.pause === 'function') {
    videoEl.pause();
  }
  const secPortal = document.getElementById('secao-portal-aluno');
  const secAula = document.getElementById('secao-pagina-aula');
  if (secAula) secAula.style.display = 'none';
  if (secPortal) secPortal.style.display = 'block';
  AppState.modoPainel = 'portal';
}

// ============================================================================
// CONEXÃO GOOGLE APPS SCRIPT + VERIFICAÇÃO DE ARQUIVOS DA AULA
// Projeto GAS: 1e5YFYxP8hzvWt5ZkJ-Ia9st8DVjowKFJp0aJIuIsY2kAOgJo7EiIKyPb
// ============================================================================
function obterUrlGasAtiva() {
  return AppState.gasWebAppUrl || ((typeof GAS_CONFIG !== 'undefined' && GAS_CONFIG.webAppUrl) ? GAS_CONFIG.webAppUrl : '');
}

/**
 * Executa requisição GET ao Google Apps Script via JSONP (<script>),
 * eliminando bloqueios de CORS (Access-Control-Allow-Origin) no domínio https://aulaflux.web.app.
 */
function chamarGasJsonp(urlBase, paramsObj = {}, timeoutMs = 6500) {
  return new Promise((resolve) => {
    if (!urlBase) {
      resolve(null);
      return;
    }

    const cbName = '__aulafluxGasCb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    let finalizado = false;
    let scriptEl = null;

    const limpar = () => {
      try {
        delete window[cbName];
      } catch (_) {
        window[cbName] = undefined;
      }
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };

    const timer = setTimeout(() => {
      if (finalizado) return;
      finalizado = true;
      limpar();
      resolve(null);
    }, timeoutMs);

    window[cbName] = (dados) => {
      if (finalizado) return;
      finalizado = true;
      clearTimeout(timer);
      limpar();
      resolve(dados || null);
    };

    const queryParams = new URLSearchParams({
      ...paramsObj,
      origin: window.location.origin || 'https://aulaflux.web.app',
      callback: cbName,
      _ts: String(Date.now())
    });

    const sep = urlBase.includes('?') ? '&' : '?';
    scriptEl = document.createElement('script');
    scriptEl.src = `${urlBase}${sep}${queryParams.toString()}`;
    scriptEl.async = true;
    scriptEl.onerror = () => {
      if (finalizado) return;
      finalizado = true;
      clearTimeout(timer);
      limpar();
      resolve(null);
    };

    document.head.appendChild(scriptEl);
  });
}

/**
 * Executa requisição POST ao Google Apps Script compatível com CORS para https://aulaflux.web.app.
 * Usa Simple Request (text/plain;charset=utf-8 sem credenciais) e fallback automático no-cors.
 */
async function chamarGasPost(gasUrl, payloadObj) {
  const bodyStr = JSON.stringify({
    ...payloadObj,
    origin: window.location.origin || 'https://aulaflux.web.app'
  });

  try {
    const resp = await fetch(gasUrl, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: bodyStr
    });
    const json = await resp.json().catch(() => null);
    if (json) return json;
  } catch (_) {
    // Fallback mode: 'no-cors' garante que o POST chegue ao Google Apps Script mesmo sem header CORS no redirect
    try {
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        credentials: 'omit',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: bodyStr
      });
      return { ok: true, opaque: true };
    } catch (errNoCors) {
      return { ok: false, error: errNoCors.message };
    }
  }
  return { ok: true };
}

function salvarUrlGasWebApp() {
  const input = document.getElementById('gas-webapp-url-input') || document.getElementById('input-gas-webapp-url');
  const url = input ? input.value.trim() : '';
  if (!url) {
    mostrarToast("Informe a URL do Web App do Google Apps Script.", "error");
    return;
  }
  AppState.gasWebAppUrl = url;
  localStorage.setItem('aulaflux_gas_webapp_url', url);
  if (typeof GAS_CONFIG !== 'undefined') {
    GAS_CONFIG.webAppUrl = url;
  }
  mostrarToast("URL do Google Apps Script salva com sucesso!", "success");
}

async function testarConexaoGasDrive() {
  const statusBox = document.getElementById('gas-connection-status-msg');
  const gasUrl = obterUrlGasAtiva();
  if (!gasUrl) {
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = `<span style="color: var(--accent-rose);"><i class="fa-solid fa-triangle-exclamation"></i> URL do Web App não configurada.</span>`;
    }
    return;
  }

  if (statusBox) {
    statusBox.style.display = 'block';
    statusBox.innerHTML = `<span style="color: var(--accent-cyan);"><i class="fa-solid fa-spinner fa-spin"></i> Testando conexão com o projeto Google Apps Script (sem bloqueio CORS)...</span>`;
  }

  const json = await chamarGasJsonp(gasUrl, {
    action: 'verificarCurso',
    curso: 'Marketing Digital com IA'
  });

  if (json && json.ok) {
    if (statusBox) {
      statusBox.innerHTML = `<span style="color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> Conectado com sucesso ao Google Drive! Curso "${json.courseName || json.curso}" localizado (${json.totalLessonFolders || json.totalPastas || 0} pastas de aulas numeradas).</span>`;
    }
    mostrarToast("Conexão com Google Apps Script / Drive validada com sucesso!", "success");
  } else {
    if (statusBox) {
      statusBox.innerHTML = `
        <div style="color: var(--accent-amber); display: flex; flex-direction: column; gap: 0.5rem;">
          <span><i class="fa-solid fa-key"></i> <strong>Autorização OAuth Pendente no Google Apps Script:</strong></span>
          <span>O Google bloqueia respostas da Web App até que o proprietário autorize o acesso ao Google Drive uma única vez.</span>
          <div>
            <a href="${gasUrl}?action=status" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-unlock-keyhole"></i> Clique aqui para Autorizar o Script no Google ("Review Permissions")
            </a>
          </div>
        </div>
      `;
    }
    mostrarToast("Abra o link de autorização do Google Apps Script para liberar o acesso ao Drive.", "info");
  }
}

async function verificarArquivoLocalExiste(url, tipoEsperado) {
  try {
    if (tipoEsperado === 'text' || tipoEsperado === 'json' || tipoEsperado === 'html') {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) return { exists: false };
      const txt = await r.text();
      // Evitar falso positivo caso servidor retorne index.html em rota inexistente
      if (tipoEsperado !== 'html' && (txt.trim().startsWith('<!DOCTYPE html') || txt.includes('id="secao-portal-aluno"'))) {
        return { exists: false };
      }
      if (tipoEsperado === 'html' && txt.includes('id="secao-portal-aluno"')) {
        return { exists: false };
      }
      if (tipoEsperado === 'json') {
        try {
          const parsed = JSON.parse(txt);
          return { exists: true, url, jsonContent: parsed };
        } catch (_) {
          return { exists: false };
        }
      }
      return { exists: true, url, textContent: txt };
    } else {
      const r = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
      if (!r.ok) return { exists: false };
      const ct = (r.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('text/html')) return { exists: false };
      return { exists: true, url };
    }
  } catch (_) {
    return { exists: false };
  }
}

async function verificarArquivosAula(cursoNome, numeroAula) {
  const basePathLocal = `Aulas/${encodeURIComponent(cursoNome)}/${encodeURIComponent(numeroAula)}`;
  const resultado = {
    folderExists: false,
    totalFolders: 6,
    origem: 'local',
    header: {
      aulaLabel: `Aula ${numeroAula}`,
      titulo: `Aula ${numeroAula}`
    },
    files: {
      dadosTxt: { exists: false },
      mapaPng: { exists: false },
      aulaPdf: { exists: false },
      apresentacaoPdf: { exists: false },
      videoMp4: { exists: false },
      gameHtml: { exists: false },
      infograficoPng: { exists: false },
      quizJson: { exists: false }
    }
  };

  // 1. Consultar conexão Google Apps Script (via JSONP livre de CORS para https://aulaflux.web.app)
  const gasUrl = obterUrlGasAtiva();
  const promessaGas = gasUrl
    ? chamarGasJsonp(gasUrl, {
        action: 'obterAula',
        curso: cursoNome,
        aula: String(numeroAula)
      }, 3500)
    : Promise.resolve(null);

  // Verificar primeiro Dados.txt local para evitar requisições HEAD 404 em aulas que não têm pasta local
  const locDados = await verificarArquivoLocalExiste(`${basePathLocal}/Dados.txt`, 'text');

  let locMapa = { exists: false };
  let locAulaPdf = { exists: false };
  let locApresPdf = { exists: false };
  let locVideo = { exists: false };
  let locGame = { exists: false };
  let locInfo = { exists: false };
  let locQuiz = { exists: false };

  if (locDados.exists) {
    [
      locMapa,
      locAulaPdf,
      locApresPdf,
      locVideo,
      locGame,
      locInfo,
      locQuiz
    ] = await Promise.all([
      verificarArquivoLocalExiste(`${basePathLocal}/Mapa.png`, 'image'),
      verificarArquivoLocalExiste(`${basePathLocal}/Aula.pdf`, 'pdf'),
      verificarArquivoLocalExiste(`${basePathLocal}/Apresentação.pdf`, 'pdf'),
      verificarArquivoLocalExiste(`${basePathLocal}/Vídeo.mp4`, 'video'),
      verificarArquivoLocalExiste(`${basePathLocal}/Game.html`, 'html'),
      verificarArquivoLocalExiste(`${basePathLocal}/Infográfico.png`, 'image'),
      verificarArquivoLocalExiste(`${basePathLocal}/Quiz.json`, 'json')
    ]);
  }

  const dadosGas = await promessaGas;

  // 2. Se o Google Apps Script retornou dados válidos do Google Drive, mesclar
  if (dadosGas && dadosGas.ok) {
    resultado.origem = 'drive';
    if (typeof dadosGas.totalFolders === 'number' && dadosGas.totalFolders > 0) {
      resultado.totalFolders = dadosGas.totalFolders;
    }
    if (dadosGas.folderExists) {
      resultado.folderExists = true;
      if (dadosGas.header) {
        resultado.header.aulaLabel = dadosGas.header.aulaLabel || resultado.header.aulaLabel;
        resultado.header.titulo = dadosGas.header.titulo || resultado.header.titulo;
      }
      const gf = dadosGas.files || {};
      if (gf.dadosTxt && gf.dadosTxt.exists) {
        resultado.files.dadosTxt = { ...gf.dadosTxt };
      }
      if (gf.mapaPng && gf.mapaPng.exists) {
        resultado.files.mapaPng = {
          exists: true,
          url: locMapa.exists ? locMapa.url : `https://drive.google.com/thumbnail?id=${gf.mapaPng.id}&sz=w2000`,
          driveViewUrl: gf.mapaPng.viewUrl,
          driveDownloadUrl: gf.mapaPng.downloadUrl
        };
      }
      if (gf.aulaPdf && gf.aulaPdf.exists) {
        resultado.files.aulaPdf = {
          exists: true,
          url: locAulaPdf.exists ? locAulaPdf.url : gf.aulaPdf.downloadUrl,
          previewUrl: locAulaPdf.exists ? locAulaPdf.url : gf.aulaPdf.previewUrl,
          driveViewUrl: gf.aulaPdf.viewUrl
        };
      }
      if (gf.apresentacaoPdf && gf.apresentacaoPdf.exists) {
        resultado.files.apresentacaoPdf = {
          exists: true,
          url: locApresPdf.exists ? locApresPdf.url : gf.apresentacaoPdf.downloadUrl,
          previewUrl: locApresPdf.exists ? locApresPdf.url : gf.apresentacaoPdf.previewUrl,
          driveViewUrl: gf.apresentacaoPdf.viewUrl
        };
      }
      if (gf.videoMp4 && gf.videoMp4.exists) {
        resultado.files.videoMp4 = {
          exists: true,
          localUrl: locVideo.exists ? locVideo.url : null,
          drivePreviewUrl: gf.videoMp4.previewUrl,
          driveDownloadUrl: gf.videoMp4.downloadUrl
        };
      }
      if (gf.gameHtml && gf.gameHtml.exists) {
        resultado.files.gameHtml = {
          exists: true,
          url: locGame.exists ? locGame.url : null,
          htmlContent: gf.gameHtml.htmlContent || null
        };
      }
      if (gf.infograficoPng && gf.infograficoPng.exists) {
        resultado.files.infograficoPng = {
          exists: true,
          url: locInfo.exists ? locInfo.url : `https://drive.google.com/thumbnail?id=${gf.infograficoPng.id}&sz=w2000`,
          driveViewUrl: gf.infograficoPng.viewUrl
        };
      }
      if (gf.quizJson && gf.quizJson.exists) {
        const gasQuizValido = gf.quizJson.jsonContent && (
          (Array.isArray(gf.quizJson.jsonContent) && gf.quizJson.jsonContent.length > 0) ||
          (Array.isArray(gf.quizJson.jsonContent.questions) && gf.quizJson.jsonContent.questions.length > 0) ||
          (Array.isArray(gf.quizJson.jsonContent.perguntas) && gf.quizJson.jsonContent.perguntas.length > 0)
        );
        resultado.files.quizJson = {
          exists: true,
          jsonContent: gasQuizValido
            ? gf.quizJson.jsonContent
            : (locQuiz.exists ? locQuiz.jsonContent : gf.quizJson.jsonContent)
        };
      }
    }
  }

  // 3. Complementar com verificação dos arquivos locais (garante funcionamento 100% imediato)
  const algumArquivoLocalExiste =
    locDados.exists || locMapa.exists || locAulaPdf.exists || locApresPdf.exists ||
    locVideo.exists || locGame.exists || locInfo.exists || locQuiz.exists;

  if (algumArquivoLocalExiste) {
    resultado.folderExists = true;

    if (locDados.exists && !resultado.files.dadosTxt.exists) {
      resultado.files.dadosTxt = { exists: true, textContent: locDados.textContent };
      const linhas = (locDados.textContent || '')
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean);
      if (linhas.length >= 1) resultado.header.aulaLabel = linhas[0];
      if (linhas.length >= 2) resultado.header.titulo = linhas.slice(1).join(' - ');
    }

    if (locMapa.exists && !resultado.files.mapaPng.exists) {
      resultado.files.mapaPng = { exists: true, url: locMapa.url };
    }
    if (locAulaPdf.exists && !resultado.files.aulaPdf.exists) {
      resultado.files.aulaPdf = { exists: true, url: locAulaPdf.url, previewUrl: locAulaPdf.url };
    }
    if (locApresPdf.exists && !resultado.files.apresentacaoPdf.exists) {
      resultado.files.apresentacaoPdf = { exists: true, url: locApresPdf.url, previewUrl: locApresPdf.url };
    }
    if (locVideo.exists && !resultado.files.videoMp4.exists) {
      resultado.files.videoMp4 = { exists: true, localUrl: locVideo.url };
    }
    if (locGame.exists && !resultado.files.gameHtml.exists) {
      resultado.files.gameHtml = { exists: true, url: locGame.url };
    }
    if (locInfo.exists && !resultado.files.infograficoPng.exists) {
      resultado.files.infograficoPng = { exists: true, url: locInfo.url };
    }
    if (locQuiz.exists && !resultado.files.quizJson.exists) {
      resultado.files.quizJson = { exists: true, jsonContent: locQuiz.jsonContent };
    }
  }

  return resultado;
}

// ============================================================================
// RENDERIZAÇÃO DA PÁGINA DA AULA (ORDEM EXATA E OCULTAÇÃO DINÂMICO)
// ============================================================================
function renderizarBotoesNavegacaoAulas(totalAulas, aulaAtiva, totalPastasExistentes) {
  const navBar = document.getElementById('aula-seletor-tabs') || document.getElementById('aula-lessons-nav-bar');
  if (!navBar) return;

  navBar.innerHTML = '';
  const qtdBotoes = Math.max(totalAulas || 6, totalPastasExistentes || 6);

  for (let i = 1; i <= qtdBotoes; i++) {
    const btn = document.createElement('button');
    const isAtiva = i === Number(aulaAtiva);
    const isSomenteEnvio = i > (totalPastasExistentes || 6);

    btn.className = `lesson-tab-pill ${isAtiva ? 'active' : ''} ${isSomenteEnvio ? 'only-upload' : ''}`;
    btn.innerHTML = isSomenteEnvio
      ? `<i class="fa-solid fa-cloud-arrow-up"></i> <span>Aula ${i} (Envio)</span>`
      : `<i class="fa-solid fa-book-open"></i> <span>Aula ${i}</span>`;
    btn.onclick = () => abrirPaginaAula(i);
    navBar.appendChild(btn);
  }
}

async function abrirPaginaAula(numeroAula) {
  const ctx = AppState.aulaContexto;
  ctx.aulaAtualNumero = Number(numeroAula) || 1;

  // Pausar vídeo anterior se estiver tocando
  const videoEl = document.getElementById('aula-video-player');
  if (videoEl && typeof videoEl.pause === 'function') {
    videoEl.pause();
  }

  // Exibir loading e ocultar seções enquanto verifica os arquivos da pasta da aula
  const loadingBox = document.getElementById('aula-loading-box') || document.getElementById('aula-loading-state');
  const secCabecalho = document.getElementById('aula-sec-cabecalho');
  const secPdfs = document.getElementById('aula-sec-pdfs');
  const secVideo = document.getElementById('aula-sec-video');
  const secGame = document.getElementById('aula-sec-game');
  const secInfografico = document.getElementById('aula-sec-infografico');
  const secQuiz = document.getElementById('aula-sec-quiz');
  const secUpload = document.getElementById('aula-sec-upload');
  const avisoSomenteEnvio = document.getElementById('aula-aviso-somente-envio');

  if (loadingBox) loadingBox.style.display = 'block';
  if (secCabecalho) secCabecalho.style.display = 'none';
  if (secPdfs) secPdfs.style.display = 'none';
  if (secVideo) secVideo.style.display = 'none';
  if (secGame) secGame.style.display = 'none';
  if (secInfografico) secInfografico.style.display = 'none';
  if (secQuiz) secQuiz.style.display = 'none';
  if (secUpload) secUpload.style.display = 'none';

  // Atualizar badges de contexto superior (Curso, Turma, Professor)
  const contextBadges = document.getElementById('aula-context-badges');
  if (contextBadges) {
    contextBadges.innerHTML = `
      <span class="badge-tag"><i class="fa-solid fa-graduation-cap"></i> ${ctx.cursoNome || 'Marketing Digital com IA'}</span>
      <span class="badge-tag"><i class="fa-solid fa-users"></i> Turma: ${ctx.turmaNome || 'Geral'}</span>
      <span class="badge-tag"><i class="fa-solid fa-chalkboard-user"></i> Prof. ${ctx.professorNome || 'Docente'}</span>
    `;
  }

  // Atualizar caminho da pasta de envio para a turma atual
  const caminhoDriveStr = `Aula Flux/Aulas/${ctx.cursoNome || 'Marketing Digital com IA'}/envios/${ctx.turmaNome || 'Geral'}`;
  const pathDisplay = document.getElementById('aula-upload-drive-path') || document.getElementById('aula-upload-drive-path-display');
  if (pathDisplay) {
    pathDisplay.innerHTML = `<i class="fa-solid fa-folder-tree"></i> ${caminhoDriveStr}`;
  }

  // Limpar seleção de arquivos de envio anterior ao trocar de aula
  ctx.arquivosSelecionadosUpload = [];
  const inputUpload = document.getElementById('aula-upload-file-input');
  if (inputUpload) inputUpload.value = '';
  renderizarListaArquivosSelecionadosUpload();
  const statusUpload = document.getElementById('aula-upload-status-msg');
  if (statusUpload) statusUpload.textContent = '';

  // Verificar existência dos arquivos via Google Apps Script + pasta local
  const infoAula = await verificarArquivosAula(ctx.cursoNome || 'Marketing Digital com IA', ctx.aulaAtualNumero);
  ctx.dadosAulaAtual = infoAula;

  if (loadingBox) loadingBox.style.display = 'none';

  // Renderizar barra de botões de aulas (Aula 1, Aula 2, ...)
  renderizarBotoesNavegacaoAulas(ctx.totalAulasCronograma, ctx.aulaAtualNumero, infoAula.totalFolders);

  // Configurar Cabeçalho (Dados.txt + Mapa.png)
  if (secCabecalho) secCabecalho.style.display = 'block';
  const numLabelEl = document.getElementById('aula-header-numero-badge') || document.getElementById('aula-header-numero-label');
  const tituloEl = document.getElementById('aula-header-titulo');
  const subtituloEl = document.getElementById('aula-header-subtitulo');
  const btnMapa = document.getElementById('btn-aula-mapa-mental');

  if (subtituloEl) {
    subtituloEl.textContent = `${ctx.cursoNome || 'Marketing Digital com IA'} • Turma ${ctx.turmaNome || 'Geral'} • Prof. ${ctx.professorNome || 'Docente'}`;
  }

  // CASO HAJA MAIS AULAS QUE AS PASTAS NUMERADAS:
  // "No caso de haver mais aulas que as pastas, estas aulas devem apenas exibir a caixa para envio dos arquivos."
  if (!infoAula.folderExists) {
    if (numLabelEl) numLabelEl.textContent = `Aula ${ctx.aulaAtualNumero}`;
    if (tituloEl) tituloEl.textContent = `Aula ${ctx.aulaAtualNumero} — Entrega de Atividades e Projeto Prático`;
    if (btnMapa) btnMapa.style.display = 'none';
    if (avisoSomenteEnvio) avisoSomenteEnvio.style.display = 'flex';
    if (secUpload) secUpload.style.display = 'block';
    return;
  }

  if (avisoSomenteEnvio) avisoSomenteEnvio.style.display = 'none';

  // 1. Dados.txt (Cabeçalho)
  if (numLabelEl) numLabelEl.textContent = infoAula.header.aulaLabel || `Aula ${ctx.aulaAtualNumero}`;
  if (tituloEl) tituloEl.textContent = infoAula.header.titulo || `Conteúdo da Aula ${ctx.aulaAtualNumero}`;

  // 2. Mapa.png (Ícone do Mapa Mental no cabeçalho -> abre em janela flutuante)
  if (btnMapa) {
    btnMapa.style.display = infoAula.files.mapaPng.exists ? 'inline-flex' : 'none';
  }

  // 3. Aula.pdf & 4. Apresentação.pdf
  const temAulaPdf = infoAula.files.aulaPdf.exists;
  const temApresPdf = infoAula.files.apresentacaoPdf.exists;
  const cardAulaPdf = document.getElementById('card-arquivo-aula-pdf');
  const cardApresPdf = document.getElementById('card-arquivo-apresentacao-pdf');

  if (temAulaPdf || temApresPdf) {
    if (secPdfs) secPdfs.style.display = 'grid';

    if (cardAulaPdf) {
      cardAulaPdf.style.display = temAulaPdf ? 'flex' : 'none';
      if (temAulaPdf) {
        const linkDown = document.getElementById('link-download-aula-pdf');
        const btnLer = document.getElementById('btn-ler-aula-pdf');
        if (linkDown) {
          linkDown.href = infoAula.files.aulaPdf.url;
          linkDown.setAttribute('download', `Aula_${ctx.aulaAtualNumero}_${ctx.cursoNome}.pdf`);
        }
        if (btnLer) {
          btnLer.onclick = () => abrirPdfFlutuante(
            `Apostila da Aula (${infoAula.header.aulaLabel}) — ${infoAula.header.titulo}`,
            infoAula.files.aulaPdf.previewUrl || infoAula.files.aulaPdf.url,
            infoAula.files.aulaPdf.url
          );
        }
      }
    }

    if (cardApresPdf) {
      cardApresPdf.style.display = temApresPdf ? 'flex' : 'none';
      if (temApresPdf) {
        const linkDownAp = document.getElementById('link-download-apresentacao-pdf');
        const btnVerAp = document.getElementById('btn-ver-apresentacao-pdf');
        if (linkDownAp) {
          linkDownAp.href = infoAula.files.apresentacaoPdf.url;
          linkDownAp.setAttribute('download', `Apresentacao_Aula_${ctx.aulaAtualNumero}.pdf`);
        }
        if (btnVerAp) {
          btnVerAp.onclick = () => abrirPdfFlutuante(
            `Apresentação de Slides (${infoAula.header.aulaLabel}) — ${infoAula.header.titulo}`,
            infoAula.files.apresentacaoPdf.previewUrl || infoAula.files.apresentacaoPdf.url,
            infoAula.files.apresentacaoPdf.url
          );
        }
      }
    }
  } else {
    if (secPdfs) secPdfs.style.display = 'none';
  }

  // 5. Vídeo.mp4 (Expandido na horizontal e proporcional 16:9)
  if (infoAula.files.videoMp4.exists) {
    if (secVideo) secVideo.style.display = 'block';
    const videoPlayer = document.getElementById('aula-video-player');
    const videoSource = document.getElementById('aula-video-source');
    const videoDriveIframe = document.getElementById('aula-video-drive-iframe');

    if (infoAula.files.videoMp4.localUrl) {
      if (videoDriveIframe) {
        videoDriveIframe.style.display = 'none';
        videoDriveIframe.src = 'about:blank';
      }
      if (videoPlayer && videoSource) {
        videoPlayer.style.display = 'block';
        videoSource.src = infoAula.files.videoMp4.localUrl;
        videoPlayer.load();
      }
    } else if (infoAula.files.videoMp4.drivePreviewUrl) {
      if (videoPlayer) videoPlayer.style.display = 'none';
      if (videoDriveIframe) {
        videoDriveIframe.style.display = 'block';
        videoDriveIframe.src = infoAula.files.videoMp4.drivePreviewUrl;
      }
    }
  } else {
    if (secVideo) secVideo.style.display = 'none';
  }

  // 6. Game.html (Aula gamificada exibida abaixo do vídeo para interação com o aluno)
  const gameSavedBadge = document.getElementById('aula-game-saved-badge');
  if (gameSavedBadge) gameSavedBadge.style.display = 'none';

  if (infoAula.files.gameHtml.exists) {
    if (secGame) secGame.style.display = 'block';
    const gameIframe = document.getElementById('aula-game-iframe');
    if (gameIframe) {
      gameIframe.style.height = '850px';
      if (infoAula.files.gameHtml.url) {
        gameIframe.removeAttribute('srcdoc');
        gameIframe.src = infoAula.files.gameHtml.url;
      } else if (infoAula.files.gameHtml.htmlContent) {
        gameIframe.srcdoc = infoAula.files.gameHtml.htmlContent;
      }
      gameIframe.onload = () => {
        enviarContextoParaGameIframe();
      };
    }
  } else {
    if (secGame) secGame.style.display = 'none';
  }

  // 7. Infográfico.png (Exibido abaixo do game)
  if (infoAula.files.infograficoPng.exists) {
    if (secInfografico) secInfografico.style.display = 'block';
    const imgInfo = document.getElementById('aula-infografico-img');
    const linkDownInfo = document.getElementById('link-download-infografico');
    if (imgInfo) {
      imgInfo.src = infoAula.files.infograficoPng.url;
    }
    if (linkDownInfo) {
      linkDownInfo.href = infoAula.files.infograficoPng.url;
      linkDownInfo.setAttribute('download', `Infografico_Aula_${ctx.aulaAtualNumero}.png`);
    }
  } else {
    if (secInfografico) secInfografico.style.display = 'none';
  }

  // 8. Quiz.json (Quiz interativo exibido abaixo do infográfico)
  if (infoAula.files.quizJson.exists && infoAula.files.quizJson.jsonContent) {
    if (secQuiz) secQuiz.style.display = 'block';
    renderizarQuizInterativoAula(infoAula.files.quizJson.jsonContent);
  } else {
    if (secQuiz) secQuiz.style.display = 'none';
  }

  // 9. Caixa de envio de arquivos pelos alunos no fim de todas as aulas
  if (secUpload) secUpload.style.display = 'block';
}

// ============================================================================
// JANELA FLUTUANTE (MODAL) PARA MAPA.PNG, INFOGRÁFICO.PNG E PDFS
// ============================================================================
function abrirMapaMentalFlutuante() {
  const info = AppState.aulaContexto.dadosAulaAtual;
  if (!info || !info.files || !info.files.mapaPng || !info.files.mapaPng.exists) {
    mostrarToast("Mapa mental não disponível para esta aula.", "info");
    return;
  }

  const tituloModal = document.getElementById('flutuante-modal-title') || document.getElementById('modal-flutuante-titulo');
  const subtituloModal = document.getElementById('flutuante-modal-subtitle');
  const bodyModal = document.getElementById('flutuante-modal-body') || document.getElementById('modal-flutuante-body');
  const linkDown = document.getElementById('flutuante-modal-download-btn') || document.getElementById('modal-flutuante-download-link');

  if (tituloModal) {
    tituloModal.innerHTML = `<i class="fa-solid fa-sitemap" style="color: var(--accent-cyan);"></i> <span>Mapa Mental — ${info.header.aulaLabel}: ${info.header.titulo}</span>`;
  }
  if (subtituloModal) {
    subtituloModal.textContent = `Visualização em janela flutuante • ${AppState.aulaContexto.cursoNome}`;
  }
  if (bodyModal) {
    bodyModal.innerHTML = `
      <img src="${info.files.mapaPng.url}" alt="Mapa Mental da Aula" style="max-width: 100%; max-height: 75vh; height: auto; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
    `;
  }
  if (linkDown) {
    linkDown.href = info.files.mapaPng.driveDownloadUrl || info.files.mapaPng.url;
    linkDown.setAttribute('download', `Mapa_Mental_Aula_${AppState.aulaContexto.aulaAtualNumero}.png`);
    linkDown.style.display = 'inline-flex';
  }

  abrirModal('modal-janela-flutuante');
}

function ampliarInfograficoAula() {
  const info = AppState.aulaContexto.dadosAulaAtual;
  if (!info || !info.files || !info.files.infograficoPng || !info.files.infograficoPng.exists) return;

  const tituloModal = document.getElementById('flutuante-modal-title') || document.getElementById('modal-flutuante-titulo');
  const subtituloModal = document.getElementById('flutuante-modal-subtitle');
  const bodyModal = document.getElementById('flutuante-modal-body') || document.getElementById('modal-flutuante-body');
  const linkDown = document.getElementById('flutuante-modal-download-btn') || document.getElementById('modal-flutuante-download-link');

  if (tituloModal) {
    tituloModal.innerHTML = `<i class="fa-solid fa-chart-pie" style="color: var(--accent-amber);"></i> <span>Infográfico — ${info.header.aulaLabel}: ${info.header.titulo}</span>`;
  }
  if (subtituloModal) {
    subtituloModal.textContent = `Resumo visual da aula • ${AppState.aulaContexto.cursoNome}`;
  }
  if (bodyModal) {
    bodyModal.innerHTML = `
      <img src="${info.files.infograficoPng.url}" alt="Infográfico da Aula" style="max-width: 100%; max-height: 75vh; height: auto; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);" />
    `;
  }
  if (linkDown) {
    linkDown.href = info.files.infograficoPng.url;
    linkDown.setAttribute('download', `Infografico_Aula_${AppState.aulaContexto.aulaAtualNumero}.png`);
    linkDown.style.display = 'inline-flex';
  }

  abrirModal('modal-janela-flutuante');
}

function abrirPdfFlutuante(titulo, previewUrl, downloadUrl) {
  const tituloModal = document.getElementById('flutuante-modal-title') || document.getElementById('modal-flutuante-titulo');
  const subtituloModal = document.getElementById('flutuante-modal-subtitle');
  const bodyModal = document.getElementById('flutuante-modal-body') || document.getElementById('modal-flutuante-body');
  const linkDown = document.getElementById('flutuante-modal-download-btn') || document.getElementById('modal-flutuante-download-link');

  if (tituloModal) {
    tituloModal.innerHTML = `<i class="fa-solid fa-file-pdf" style="color: var(--accent-rose);"></i> <span>${titulo}</span>`;
  }
  if (subtituloModal) {
    subtituloModal.textContent = `Leitura de documento PDF`;
  }
  if (bodyModal) {
    bodyModal.innerHTML = `
      <iframe src="${previewUrl}" style="width: 100%; height: 75vh; border: none; border-radius: 8px; background: #fff;"></iframe>
    `;
  }
  if (linkDown) {
    linkDown.href = downloadUrl || previewUrl;
    linkDown.setAttribute('download', '');
    linkDown.style.display = 'inline-flex';
  }

  abrirModal('modal-janela-flutuante');
}

function alternarTelaCheiaGame() {
  const wrapper = document.getElementById('aula-game-wrapper') || document.getElementById('aula-game-iframe');
  if (!wrapper) return;
  if (!document.fullscreenElement) {
    if (wrapper.requestFullscreen) wrapper.requestFullscreen().catch(() => null);
  } else {
    if (document.exitFullscreen) document.exitFullscreen().catch(() => null);
  }
}

// ============================================================================
// COMUNICAÇÃO COM GAME.HTML E GRAVAÇÃO DE RESULTADOS DO GAME NO FIREBASE
// ============================================================================
function enviarContextoParaGameIframe() {
  const gameIframe = document.getElementById('aula-game-iframe');
  if (!gameIframe || !gameIframe.contentWindow) return;

  const ctx = AppState.aulaContexto;
  gameIframe.contentWindow.postMessage({
    type: 'AULAFLUX_CONTEXT',
    aluno_nome: AppState.alunoNomeCompleto || '',
    professor_id: ctx.professorId || '',
    professor_nome: ctx.professorNome || '',
    turma_id: ctx.turmaId || '',
    turma_nome: ctx.turmaNome || '',
    curso_id: ctx.cursoId || '',
    curso_nome: ctx.cursoNome || '',
    aula_numero: ctx.aulaAtualNumero || 1
  }, '*');
}

function configurarListenerMensagensGame() {
  window.addEventListener('message', async (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    // Ajuste dinâmico de altura do iframe do Game.html
    if (data.type === 'AULAFLUX_GAME_RESIZE' && data.height) {
      const gameIframe = document.getElementById('aula-game-iframe');
      if (gameIframe) {
        gameIframe.style.height = Math.max(650, Number(data.height) + 30) + 'px';
      }
    }

    // Recebimento do resultado do Game.html para gravação no Firebase
    if (data.type === 'AULAFLUX_GAME_RESULT' && data.payload) {
      await salvarResultadoGameFirebase(data.payload);
    }
  });
}

async function salvarResultadoGameFirebase(payload) {
  if (!AppState.alunoNomeCompleto) {
    abrirModalIdentificacaoAluno(false, () => salvarResultadoGameFirebase(payload));
    return;
  }

  const ctx = AppState.aulaContexto;
  const info = ctx.dadosAulaAtual;

  const registroGame = {
    aluno_nome: AppState.alunoNomeCompleto,
    professor_id: ctx.professorId || '',
    professor_nome: ctx.professorNome || 'Professor',
    turma_id: ctx.turmaId || '',
    turma_nome: ctx.turmaNome || 'Geral',
    curso_id: ctx.cursoId || '',
    curso_nome: ctx.cursoNome || 'Marketing Digital com IA',
    aula_numero: Number(payload.aula_numero || ctx.aulaAtualNumero || 1),
    aula_titulo: payload.aula_titulo || (info && info.header ? info.header.titulo : `Aula ${ctx.aulaAtualNumero}`),
    pontuacao: Number(payload.pontuacao ?? 100),
    acertos: Number(payload.acertos ?? 3),
    total_desafios: Number(payload.total_desafios ?? 3),
    detalhes: payload.detalhes || [],
    data_hora: new Date().toLocaleString('pt-BR'),
    criado_em: (typeof firebase !== 'undefined' && firebase.firestore)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('game_resultados').add(registroGame);
    } else {
      AppState.gameResultados.unshift({ id: 'game-' + Date.now(), ...registroGame });
      renderizarTabelasResultados();
    }

    const badgeStatus = document.getElementById('aula-game-saved-badge') || document.getElementById('aula-game-status-badge');
    if (badgeStatus) {
      badgeStatus.style.display = 'inline-flex';
      badgeStatus.style.background = 'rgba(16, 185, 129, 0.18)';
      badgeStatus.style.color = 'var(--accent-emerald)';
      badgeStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Pontuação (${registroGame.pontuacao}%) salva para ${registroGame.aluno_nome}!`;
    }

    mostrarToast(`Resultado do Game (${registroGame.pontuacao}%) gravado no Firebase para ${registroGame.aluno_nome}!`, "success");
  } catch (err) {
    console.error("Erro ao gravar resultado do game no Firebase:", err);
    mostrarToast("Erro ao salvar resultado do game: " + err.message, "error");
  }
}

// ============================================================================
// QUIZ INTERATIVO (QUIZ.JSON) E GRAVAÇÃO NO FIREBASE (QUIZ_RESPOSTAS)
// ============================================================================
function atualizarContadorQuizRespondidas() {
  const quiz = AppState.aulaContexto.quizAtual;
  const counterEl = document.getElementById('aula-quiz-counter');
  if (!quiz || !counterEl) return;
  const total = (quiz.questions || []).length;
  let respondidas = 0;
  for (let i = 0; i < total; i++) {
    if (document.querySelector(`input[name="quiz_aula_q_${i}"]:checked`)) {
      respondidas++;
    }
  }
  counterEl.textContent = `${respondidas} / ${total} respondidas`;
}

function reiniciarQuizAulaAtual() {
  const info = AppState.aulaContexto.dadosAulaAtual;
  if (info && info.files && info.files.quizJson && info.files.quizJson.jsonContent) {
    renderizarQuizInterativoAula(info.files.quizJson.jsonContent);
  }
}

function normalizarQuestoesQuiz(quizJson) {
  let dados = quizJson;
  if (typeof dados === 'string') {
    try {
      dados = JSON.parse(dados);
    } catch (_) {
      dados = [];
    }
  }
  const listaBruta = Array.isArray(dados)
    ? dados
    : (dados && Array.isArray(dados.questions) ? dados.questions
      : (dados && Array.isArray(dados.perguntas) ? dados.perguntas
        : (dados && Array.isArray(dados.questoes) ? dados.questoes : [])));

  return listaBruta.map((q, idx) => {
    const perguntaTexto = q.pergunta || q.question || q.enunciado || `Questão ${idx + 1}`;
    const opcoesBrutas = Array.isArray(q.alternativas)
      ? q.alternativas
      : (Array.isArray(q.options) ? q.options : (Array.isArray(q.opcoes) ? q.opcoes : []));

    const respostaCorretaIdx = (q.respostaCorreta !== undefined)
      ? Number(q.respostaCorreta)
      : ((q.answer !== undefined) ? Number(q.answer) : Number(q.correta || 0));

    const explicacaoTexto = q.explicacao || q.explanation || q.justificativa || '';

    return {
      numero: q.numero || (idx + 1),
      question: perguntaTexto,
      pergunta: perguntaTexto,
      options: opcoesBrutas,
      alternativas: opcoesBrutas,
      answer: respostaCorretaIdx,
      respostaCorreta: respostaCorretaIdx,
      respostaCorretaTexto: q.respostaCorretaTexto || opcoesBrutas[respostaCorretaIdx] || '',
      explanation: explicacaoTexto,
      explicacao: explicacaoTexto
    };
  });
}

function renderizarQuizInterativoAula(quizJson) {
  const container = document.getElementById('aula-quiz-questions-container');
  const counterEl = document.getElementById('aula-quiz-counter');
  const resultadoBox = document.getElementById('aula-quiz-resultado-box');
  const btnSubmeter = document.getElementById('btn-finalizar-quiz') || document.getElementById('btn-submeter-quiz-aula');
  const btnReiniciar = document.getElementById('btn-reiniciar-quiz');

  if (!container) return;

  const perguntas = normalizarQuestoesQuiz(quizJson);

  AppState.aulaContexto.quizAtual = {
    title: (quizJson && (quizJson.title || quizJson.titulo))
      ? (quizJson.title || quizJson.titulo)
      : `Quiz da Aula ${AppState.aulaContexto.aulaAtualNumero}`,
    questions: perguntas
  };

  if (counterEl) {
    counterEl.textContent = `0 / ${perguntas.length} respondidas`;
  }
  if (resultadoBox) {
    resultadoBox.style.display = 'none';
    resultadoBox.innerHTML = '';
  }
  if (btnReiniciar) {
    btnReiniciar.style.display = 'none';
  }
  if (btnSubmeter) {
    btnSubmeter.disabled = false;
    btnSubmeter.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Finalizar e Salvar Resultado do Quiz`;
  }

  container.innerHTML = '';

  perguntas.forEach((q, qIdx) => {
    const card = document.createElement('div');
    card.className = 'quiz-question-card';
    card.id = `quiz-q-card-${qIdx}`;
    card.style.cssText = 'padding: 1.25rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); transition: all 0.2s;';

    const opcoesHtml = (q.options || []).map((optTexto, optIdx) => {
      const letra = String.fromCharCode(65 + optIdx);
      const textoLimpo = String(optTexto || '').replace(/^[A-Za-z][\)\.\-]\s*/, '');
      return `
        <label id="quiz-label-${qIdx}-${optIdx}" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-input); cursor: pointer; transition: all 0.15s; font-size: 0.9rem; color: var(--text-primary);">
          <input type="radio" name="quiz_aula_q_${qIdx}" value="${optIdx}" onchange="atualizarContadorQuizRespondidas()" style="margin-top: 0.25rem; accent-color: var(--accent-cyan);" />
          <span><strong>${letra})</strong> ${textoLimpo}</span>
        </label>
      `;
    }).join('');

    card.innerHTML = `
      <div style="font-weight: 700; font-size: 0.98rem; color: var(--text-primary); margin-bottom: 0.9rem; display: flex; gap: 0.5rem;">
        <span style="color: var(--accent-cyan);">${q.numero || (qIdx + 1)}.</span>
        <span>${q.question}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.55rem;">
        ${opcoesHtml}
      </div>
      <div id="quiz-exp-${qIdx}" style="display: none; margin-top: 0.85rem; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; line-height: 1.5;"></div>
    `;

    container.appendChild(card);
  });
}

async function submeterQuizAulaAtual() {
  if (!AppState.alunoNomeCompleto) {
    abrirModalIdentificacaoAluno(false, () => submeterQuizAulaAtual());
    return;
  }

  const quiz = AppState.aulaContexto.quizAtual;
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) return;

  const perguntas = quiz.questions;
  const respostasAluno = [];

  for (let i = 0; i < perguntas.length; i++) {
    const marcado = document.querySelector(`input[name="quiz_aula_q_${i}"]:checked`);
    if (!marcado) {
      mostrarToast(`Responda a questão ${i + 1} antes de finalizar o Quiz.`, "error");
      const cardEl = document.getElementById(`quiz-q-card-${i}`);
      if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    respostasAluno.push(parseInt(marcado.value, 10));
  }

  let acertos = 0;
  const detalhesRespostas = [];

  perguntas.forEach((q, i) => {
    const escolhida = respostasAluno[i];
    const correta = Number(q.answer);
    const acertou = escolhida === correta;
    if (acertou) acertos++;

    detalhesRespostas.push({
      questao_numero: i + 1,
      pergunta: q.question,
      resposta_aluno: escolhida,
      resposta_correta: correta,
      acertou: acertou
    });

    // Destacar visualmente alternativa correta e escolhida
    (q.options || []).forEach((_, optIdx) => {
      const lbl = document.getElementById(`quiz-label-${i}-${optIdx}`);
      if (!lbl) return;
      if (optIdx === correta) {
        lbl.style.borderColor = 'var(--accent-emerald)';
        lbl.style.background = 'rgba(16, 185, 129, 0.14)';
      } else if (optIdx === escolhida && !acertou) {
        lbl.style.borderColor = 'var(--accent-rose)';
        lbl.style.background = 'rgba(244, 63, 94, 0.14)';
      }
    });

    // Exibir explicação se houver no Quiz.json
    const expEl = document.getElementById(`quiz-exp-${i}`);
    if (expEl) {
      expEl.style.display = 'block';
      expEl.style.background = acertou ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)';
      expEl.style.border = `1px solid ${acertou ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`;
      expEl.style.color = 'var(--text-primary)';
      expEl.innerHTML = acertou
        ? `<strong style="color: var(--accent-emerald);"><i class="fa-solid fa-check"></i> Correto!</strong> ${q.explanation || ''}`
        : `<strong style="color: var(--accent-rose);"><i class="fa-solid fa-xmark"></i> Incorreto.</strong> ${q.explanation || ''}`;
    }
  });

  const totalQuestoes = perguntas.length;
  const percentual = Math.round((acertos / totalQuestoes) * 100);
  const ctx = AppState.aulaContexto;
  const info = ctx.dadosAulaAtual;

  const btnSubmeter = document.getElementById('btn-finalizar-quiz') || document.getElementById('btn-submeter-quiz-aula');
  const btnReiniciar = document.getElementById('btn-reiniciar-quiz');
  if (btnSubmeter) btnSubmeter.disabled = true;
  if (btnReiniciar) btnReiniciar.style.display = 'inline-flex';

  const registroQuiz = {
    aluno_nome: AppState.alunoNomeCompleto,
    professor_id: ctx.professorId || '',
    professor_nome: ctx.professorNome || 'Professor',
    turma_id: ctx.turmaId || '',
    turma_nome: ctx.turmaNome || 'Geral',
    curso_id: ctx.cursoId || '',
    curso_nome: ctx.cursoNome || 'Marketing Digital com IA',
    aula_numero: Number(ctx.aulaAtualNumero || 1),
    aula_titulo: (info && info.header) ? info.header.titulo : `Aula ${ctx.aulaAtualNumero}`,
    quiz_titulo: quiz.title || `Quiz Aula ${ctx.aulaAtualNumero}`,
    acertos: acertos,
    total_questoes: totalQuestoes,
    percentual: percentual,
    respostas: detalhesRespostas,
    data_hora: new Date().toLocaleString('pt-BR'),
    criado_em: (typeof firebase !== 'undefined' && firebase.firestore)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('quiz_respostas').add(registroQuiz);
    } else {
      AppState.quizRespostas.unshift({ id: 'quiz-' + Date.now(), ...registroQuiz });
      renderizarTabelasResultados();
    }

    const resultadoBox = document.getElementById('aula-quiz-resultado-box');
    if (resultadoBox) {
      resultadoBox.style.display = 'block';
      const corNota = percentual >= 70 ? 'var(--accent-emerald)' : (percentual >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)');
      resultadoBox.style.background = 'var(--bg-surface)';
      resultadoBox.style.border = `2px solid ${corNota}`;
      resultadoBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="text-align: left;">
            <h4 style="font-size: 1.15rem; color: ${corNota}; margin-bottom: 0.25rem;">
              <i class="fa-solid fa-trophy"></i> Resultado do Quiz: ${acertos} de ${totalQuestoes} acertos (${percentual}%)
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
              Nota registrada no Firebase para <strong>${registroQuiz.aluno_nome}</strong> • Turma <strong>${registroQuiz.turma_nome}</strong> • Prof. <strong>${registroQuiz.professor_nome}</strong>.
            </p>
          </div>
          <button class="btn btn-secondary" onclick="reiniciarQuizAulaAtual()">
            <i class="fa-solid fa-rotate-right"></i> Refazer Quiz
          </button>
        </div>
      `;
    }

    mostrarToast(`Quiz finalizado! Você acertou ${acertos}/${totalQuestoes} (${percentual}%). Nota salva no Firebase!`, "success");
  } catch (err) {
    console.error("Erro ao gravar quiz no Firebase:", err);
    mostrarToast("Erro ao salvar nota do Quiz no Firebase: " + err.message, "error");
    if (btnSubmeter) btnSubmeter.disabled = false;
  }
}

// ============================================================================
// ENVIO DE ARQUIVOS PELOS ALUNOS PARA O GOOGLE DRIVE (PASTA DO CURSO/TURMA)
// Exemplo: Aula Flux/Aulas/Marketing Digital com IA/envios/ABC
// ============================================================================
function selecionarArquivosUploadAula(inputOrEvent) {
  let fileList = [];
  if (inputOrEvent && inputOrEvent.target && inputOrEvent.target.files) {
    fileList = Array.from(inputOrEvent.target.files);
  } else if (inputOrEvent && typeof inputOrEvent.length === 'number') {
    fileList = Array.from(inputOrEvent);
  }
  if (fileList.length === 0) return;

  AppState.aulaContexto.arquivosSelecionadosUpload = fileList;
  renderizarListaArquivosSelecionadosUpload();
}

function renderizarListaArquivosSelecionadosUpload() {
  const files = AppState.aulaContexto.arquivosSelecionadosUpload || [];
  const listContainer = document.getElementById('aula-upload-selected-list') || document.getElementById('aula-upload-selected-files');
  const btnEnviar = document.getElementById('btn-enviar-arquivos-drive');

  if (!listContainer) return;

  if (files.length === 0) {
    listContainer.style.display = 'none';
    listContainer.innerHTML = '';
    if (btnEnviar) btnEnviar.disabled = true;
    return;
  }

  listContainer.style.display = 'flex';
  if (btnEnviar) btnEnviar.disabled = false;
  listContainer.innerHTML = '';

  files.forEach((f, idx) => {
    const tamanhoKb = (f.size / 1024).toFixed(1);
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.9rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.85rem;';
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <i class="fa-solid fa-file-arrow-up text-cyan"></i>
        <strong>${f.name}</strong>
        <span style="color: var(--text-muted); font-size: 0.78rem;">(${tamanhoKb} KB)</span>
      </div>
      <button type="button" class="btn btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="removerArquivoUploadLista(${idx})">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    listContainer.appendChild(row);
  });
}

function removerArquivoUploadLista(index) {
  const arr = AppState.aulaContexto.arquivosSelecionadosUpload || [];
  arr.splice(index, 1);
  AppState.aulaContexto.arquivosSelecionadosUpload = arr;
  renderizarListaArquivosSelecionadosUpload();
}

function converterArquivoParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64Clean = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64Clean);
    };
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

async function enviarArquivosAlunoDrive() {
  if (!AppState.alunoNomeCompleto) {
    abrirModalIdentificacaoAluno(false, () => enviarArquivosAlunoDrive());
    return;
  }

  const files = AppState.aulaContexto.arquivosSelecionadosUpload || [];
  if (files.length === 0) {
    mostrarToast("Selecione ao menos um arquivo para enviar.", "error");
    return;
  }

  const ctx = AppState.aulaContexto;
  const cursoNome = ctx.cursoNome || 'Marketing Digital com IA';
  const turmaNome = ctx.turmaNome || 'Geral';
  const caminhoDestinoDrive = `Aula Flux/Aulas/${cursoNome}/envios/${turmaNome}`;

  const btnEnviar = document.getElementById('btn-enviar-arquivos-drive');
  const statusMsg = document.getElementById('aula-upload-status-msg');
  if (btnEnviar) btnEnviar.disabled = true;

  if (statusMsg) {
    statusMsg.style.display = 'inline-block';
    statusMsg.style.color = 'var(--accent-cyan)';
    statusMsg.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Enviando ${files.length} arquivo(s) para <strong>${caminhoDestinoDrive}</strong>...`;
  }

  const gasUrl = obterUrlGasAtiva();
  let enviadosComSucesso = 0;

  try {
    for (const file of files) {
      const base64Data = await converterArquivoParaBase64(file);
      let driveFileUrl = '';
      let driveFileId = '';
      let driveSavedPath = caminhoDestinoDrive;

      // 1. Enviar para o Google Drive via Google Apps Script (doPost -> action: uploadArquivo)
      if (gasUrl) {
        try {
          const payloadDrive = {
            action: 'uploadArquivo',
            curso: cursoNome,
            turma: turmaNome,
            aula: String(ctx.aulaAtualNumero || 1),
            alunoNome: AppState.alunoNomeCompleto,
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            base64Data: base64Data
          };

          const respJson = await chamarGasPost(gasUrl, payloadDrive);
          if (respJson && respJson.ok) {
            driveFileUrl = respJson.fileUrl || respJson.downloadUrl || '';
            driveFileId = respJson.fileId || '';
            driveSavedPath = respJson.folderPath || respJson.caminho || caminhoDestinoDrive;
          }
        } catch (gasErr) {
          console.warn("Aviso no upload direto para GAS:", gasErr);
        }
      }

      // 2. Registrar a entrega no Firebase Firestore (tarefas_entregas) vinculada ao aluno, professor, turma e aula
      const registroEntrega = {
        aluno_nome: AppState.alunoNomeCompleto,
        professor_id: ctx.professorId || '',
        professor_nome: ctx.professorNome || 'Professor',
        turma_id: ctx.turmaId || '',
        turma_nome: turmaNome,
        curso_id: ctx.cursoId || '',
        curso_nome: cursoNome,
        aula_numero: Number(ctx.aulaAtualNumero || 1),
        arquivo_nome: file.name,
        arquivo_tamanho: file.size,
        arquivo_tipo: file.type || 'application/octet-stream',
        pasta_destino_drive: driveSavedPath,
        drive_file_id: driveFileId,
        drive_file_url: driveFileUrl,
        data_hora: new Date().toLocaleString('pt-BR'),
        criado_em: (typeof firebase !== 'undefined' && firebase.firestore)
          ? firebase.firestore.FieldValue.serverTimestamp()
          : new Date().toISOString()
      };

      if (db) {
        await db.collection('tarefas_entregas').add(registroEntrega);
      } else {
        AppState.tarefasEntregas.unshift({ id: 'entrega-' + Date.now(), ...registroEntrega });
      }

      enviadosComSucesso++;
    }

    renderizarTabelasResultados();

    AppState.aulaContexto.arquivosSelecionadosUpload = [];
    const inputUpload = document.getElementById('aula-upload-file-input');
    if (inputUpload) inputUpload.value = '';
    renderizarListaArquivosSelecionadosUpload();

    if (statusMsg) {
      statusMsg.style.color = 'var(--accent-emerald)';
      statusMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>${enviadosComSucesso} arquivo(s) enviado(s) com sucesso!</strong> Destino: <code>${caminhoDestinoDrive}</code>`;
    }

    mostrarToast(`Arquivos enviados com sucesso para ${caminhoDestinoDrive}!`, "success");
  } catch (err) {
    console.error("Erro ao enviar arquivos:", err);
    if (statusMsg) {
      statusMsg.style.color = 'var(--accent-rose)';
      statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Erro ao enviar arquivo: ${err.message}`;
    }
    mostrarToast("Erro ao enviar arquivo: " + err.message, "error");
  } finally {
    if (btnEnviar) btnEnviar.disabled = (AppState.aulaContexto.arquivosSelecionadosUpload || []).length === 0;
  }
}

// ============================================================================
// PAINEL ADMINISTRATIVO: TABELAS DE RESULTADOS (QUIZ, GAMES E ENVIOS DRIVE)
// ============================================================================
function carregarResultadosFirebase() {
  sincronizarComFirestore();
  mostrarToast("Resultados de Quiz, Games e Envios atualizados.", "info");
}

function renderizarTabelasResultados() {
  const tbodyUnificado = document.getElementById('table-resultados-tbody');
  if (!tbodyUnificado) return;

  const isProf = AppState.currentUserProfile && AppState.currentUserProfile.role === 'professor';
  const profIdLogado = isProf ? AppState.currentUserProfile.professor_id : null;

  const buscaInput = document.getElementById('filtro-resultados-aluno');
  const tipoSelect = document.getElementById('filtro-resultados-tipo');
  const termo = buscaInput ? buscaInput.value.trim().toLowerCase() : '';
  const tipoFiltro = tipoSelect ? tipoSelect.value : 'todos';

  const itens = [];

  if (tipoFiltro === 'todos' || tipoFiltro === 'quiz') {
    (AppState.quizRespostas || []).forEach(q => {
      if (profIdLogado && q.professor_id !== profIdLogado) return;
      itens.push({
        tipoBadge: `<span class="badge-tag" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);"><i class="fa-solid fa-clipboard-question"></i> Quiz</span>`,
        aluno: q.aluno_nome || '-',
        curso: q.curso_nome || '-',
        turma: q.turma_nome || '-',
        professor: q.professor_nome || '-',
        aula: `Aula ${q.aula_numero || 1}`,
        detalhe: `<strong style="color: var(--accent-emerald);">${q.acertos ?? 0}/${q.total_questoes ?? 0} (${q.percentual ?? 0}%)</strong>`,
        dataHora: q.data_hora || '-'
      });
    });
  }

  if (tipoFiltro === 'todos' || tipoFiltro === 'game') {
    (AppState.gameResultados || []).forEach(g => {
      if (profIdLogado && g.professor_id !== profIdLogado) return;
      itens.push({
        tipoBadge: `<span class="badge-tag" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald);"><i class="fa-solid fa-gamepad"></i> Game</span>`,
        aluno: g.aluno_nome || '-',
        curso: g.curso_nome || '-',
        turma: g.turma_nome || '-',
        professor: g.professor_nome || '-',
        aula: `Aula ${g.aula_numero || 1}`,
        detalhe: `<strong style="color: var(--accent-amber);">${g.pontuacao ?? 0}% (${g.acertos ?? 0}/${g.total_desafios ?? 3})</strong>`,
        dataHora: g.data_hora || '-'
      });
    });
  }

  if (tipoFiltro === 'todos' || tipoFiltro === 'envio') {
    (AppState.tarefasEntregas || []).forEach(e => {
      if (profIdLogado && e.professor_id !== profIdLogado) return;
      const linkHtml = e.drive_file_url
        ? `<a href="${e.drive_file_url}" target="_blank" rel="noopener" style="color: var(--accent-cyan); font-weight: 600;"><i class="fa-solid fa-up-right-from-square"></i> ${e.arquivo_nome}</a>`
        : `<strong>${e.arquivo_nome || 'Arquivo'}</strong>`;
      itens.push({
        tipoBadge: `<span class="badge-tag" style="background: rgba(245, 158, 11, 0.15); color: var(--accent-amber);"><i class="fa-brands fa-google-drive"></i> Envio Drive</span>`,
        aluno: e.aluno_nome || '-',
        curso: e.curso_nome || '-',
        turma: e.turma_nome || '-',
        professor: e.professor_nome || '-',
        aula: `Aula ${e.aula_numero || 1}`,
        detalhe: `${linkHtml} <div style="font-size:0.72rem; color:var(--text-muted);">${e.pasta_destino_drive || ''}</div>`,
        dataHora: e.data_hora || '-'
      });
    });
  }

  const filtrados = termo
    ? itens.filter(i =>
        i.aluno.toLowerCase().includes(termo) ||
        i.turma.toLowerCase().includes(termo) ||
        i.curso.toLowerCase().includes(termo) ||
        i.professor.toLowerCase().includes(termo)
      )
    : itens;

  if (filtrados.length === 0) {
    tbodyUnificado.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhum resultado registrado ainda.</td></tr>`;
    return;
  }

  tbodyUnificado.innerHTML = filtrados.map(item => `
    <tr>
      <td>${item.tipoBadge}</td>
      <td><strong>${item.aluno}</strong></td>
      <td>${item.curso}</td>
      <td><span class="badge-tag">${item.turma}</span></td>
      <td>${item.professor}</td>
      <td>${item.aula}</td>
      <td>${item.detalhe}</td>
      <td style="font-size: 0.78rem; color: var(--text-muted);">${item.dataHora}</td>
    </tr>
  `).join('');
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
window.filtrarCatalogoCursos = filtrarCatalogoCursos;
window.cadastrarNovoUsuario = cadastrarNovoUsuario;
window.alternarVinculoProfessorUser = alternarVinculoProfessorUser;
window.alternarVinculoProfessorEditUser = alternarVinculoProfessorEditUser;
window.abrirModalEditarUsuario = abrirModalEditarUsuario;
window.submeterEdicaoUsuario = submeterEdicaoUsuario;
window.alterarNivelUsuario = alterarNivelUsuario;
window.excluirUsuario = excluirUsuario;
window.acaoBotaoAuth = acaoBotaoAuth;
window.abrirModalLogin = abrirModalLogin;
window.abrirCronogramaTurma = abrirCronogramaTurma;
window.abrirModalEditarCurso = abrirModalEditarCurso;
window.submeterEdicaoCurso = submeterEdicaoCurso;
window.excluirCurso = excluirCurso;
window.abrirModalEditarProfessor = abrirModalEditarProfessor;
window.submeterEdicaoProfessor = submeterEdicaoProfessor;
window.excluirProfessor = excluirProfessor;
window.abrirModalEditarFeriado = abrirModalEditarFeriado;
window.submeterEdicaoFeriado = submeterEdicaoFeriado;
window.excluirFeriado = excluirFeriado;
window.abrirModalEditarAgendamento = abrirModalEditarAgendamento;
window.submeterEdicaoAgendamento = submeterEdicaoAgendamento;
window.excluirAgendamento = excluirAgendamento;
window.exportarAgendaExcel = exportarAgendaExcel;
window.carregarDadosFirestore = carregarDadosFirestore;
window.filtrarAgendamentos = filtrarAgendamentos;
window.aplicarPresetDias = aplicarPresetDias;
window.abrirPrimeiraTurmaDoCurso = abrirPrimeiraTurmaDoCurso;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.mostrarToast = mostrarToast;
window.enviarRecuperacaoSenha = enviarRecuperacaoSenha;
window.preencherLoginSuperadmin = preencherLoginSuperadmin;
window.entrarComoAdminDireto = entrarComoAdminDireto;
window.abrirModalIdentificacaoAluno = abrirModalIdentificacaoAluno;
window.confirmarIdentificacaoAluno = confirmarIdentificacaoAluno;
window.iniciarAcessoAulasTurma = iniciarAcessoAulasTurma;
window.acessarAulasPorCurso = acessarAulasPorCurso;
window.fecharPaginaAula = fecharPaginaAula;
window.abrirPaginaAula = abrirPaginaAula;
window.abrirMapaMentalFlutuante = abrirMapaMentalFlutuante;
window.ampliarInfograficoAula = ampliarInfograficoAula;
window.abrirPdfFlutuante = abrirPdfFlutuante;
window.alternarTelaCheiaGame = alternarTelaCheiaGame;
window.atualizarContadorQuizRespondidas = atualizarContadorQuizRespondidas;
window.reiniciarQuizAulaAtual = reiniciarQuizAulaAtual;
window.submeterQuizAulaAtual = submeterQuizAulaAtual;
window.renderizarQuizInterativoAula = renderizarQuizInterativoAula;
window.selecionarArquivosUploadAula = selecionarArquivosUploadAula;
window.removerArquivoUploadLista = removerArquivoUploadLista;
window.enviarArquivosAlunoDrive = enviarArquivosAlunoDrive;
window.salvarUrlGasWebApp = salvarUrlGasWebApp;
window.testarConexaoGasDrive = testarConexaoGasDrive;
window.carregarResultadosFirebase = carregarResultadosFirebase;
window.renderizarTabelasResultados = renderizarTabelasResultados;
