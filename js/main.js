// ========================================
// SQL Noir — Main Module
// Application entry point, orchestration, intro screen
// ========================================

import { initDatabase } from './database.js';
import { initTerminal } from './terminal.js';
import { initEvidence, checkEvidence, getAllEvidence, getEvidenceCount, getProgress, isAllEvidenceFound } from './evidence.js';
import { initNarrative, onEvidenceFound as narrativeOnEvidence } from './narrative.js';
import { TABLE_INFO } from './schema.js';

// ---- App State ----
let gameStarted = false;

// ---- Entry Point ----
document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  createParticles();
});

/**
 * Initialize the intro screen
 */
function initIntro() {
  const startBtn = document.getElementById('intro-start-btn');
  const loadingEl = document.getElementById('intro-loading');

  // Typewriter effect for briefing lines
  const lines = document.querySelectorAll('.briefing-line');
  lines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('visible');
    }, 1800 + (i * 400));
  });

  startBtn.addEventListener('click', async () => {
    startBtn.style.display = 'none';
    loadingEl.classList.add('visible');

    try {
      await startGame();
    } catch (error) {
      loadingEl.textContent = 'Erro ao carregar o banco de dados. Recarregue a página.';
      console.error('[SQL Noir] Init error:', error);
    }
  });
}

/**
 * Start the game: load DB, initialize modules, transition to game
 */
async function startGame() {
  // Load SQL.js and create database
  await initDatabase();

  // Initialize evidence system
  initEvidence((evidence) => {
    // When evidence is found:
    narrativeOnEvidence(evidence);
    showEvidenceToast(evidence);
    updateProgressBar();
    updateEvidenceBadge();

    if (isAllEvidenceFound()) {
      setTimeout(() => showAccusationPrompt(), 3000);
    }
  });

  // Initialize terminal with query callback
  initTerminal((result, sql) => {
    if (result.success && result.values && result.values.length > 0) {
      checkEvidence(result);
    }
  });

  // Initialize narrative
  initNarrative();

  // Initialize schema explorer
  initSchemaExplorer();

  // Initialize evidence board
  initEvidenceBoard();

  // Transition from intro to game
  transitionToGame();

  gameStarted = true;
}

/**
 * Transition from intro screen to game
 */
function transitionToGame() {
  const intro = document.getElementById('intro-screen');
  const game = document.getElementById('game-container');

  intro.classList.add('hidden');
  game.classList.add('active');

  // Focus the SQL input after transition
  setTimeout(() => {
    const input = document.getElementById('sql-input');
    if (input) input.focus();
  }, 800);
}

/**
 * Initialize the schema explorer in the footer
 */
function initSchemaExplorer() {
  const bar = document.getElementById('schema-bar');
  const detail = document.getElementById('schema-detail');
  let activeTable = null;

  // Create table buttons
  TABLE_INFO.forEach(table => {
    const btn = document.createElement('button');
    btn.className = 'schema-table-btn';
    btn.id = `schema-btn-${table.name}`;
    btn.innerHTML = `<span class="icon">${table.icon}</span> ${table.name}`;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (activeTable === table.name) {
        // Toggle off
        detail.classList.remove('visible');
        btn.classList.remove('active');
        activeTable = null;
        return;
      }

      // Show detail
      activeTable = table.name;
      bar.querySelectorAll('.schema-table-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderSchemaDetail(table);
      detail.classList.add('visible');
    });

    bar.appendChild(btn);
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!detail.contains(e.target) && !e.target.closest('.schema-table-btn')) {
      detail.classList.remove('visible');
      bar.querySelectorAll('.schema-table-btn').forEach(b => b.classList.remove('active'));
      activeTable = null;
    }
  });

  // Close button
  const closeBtn = detail.querySelector('.schema-detail-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      detail.classList.remove('visible');
      bar.querySelectorAll('.schema-table-btn').forEach(b => b.classList.remove('active'));
      activeTable = null;
    });
  }
}

/**
 * Render schema detail popup for a table
 */
function renderSchemaDetail(table) {
  const title = document.getElementById('schema-detail-table-name');
  const body = document.getElementById('schema-detail-body');

  title.textContent = `${table.icon} ${table.name}`;

  body.innerHTML = table.columns.map(col => `
    <tr>
      <td>${col.name}</td>
      <td>${col.type}</td>
      <td>${col.description}</td>
    </tr>
  `).join('');
}

/**
 * Initialize the evidence board sidebar
 */
function initEvidenceBoard() {
  const btn = document.getElementById('btn-evidence');
  const overlay = document.getElementById('evidence-overlay');
  const backdrop = overlay.querySelector('.evidence-backdrop');
  const closeBtn = document.getElementById('evidence-close');

  btn.addEventListener('click', () => {
    renderEvidenceBoard();
    overlay.classList.add('visible');
  });

  backdrop.addEventListener('click', () => {
    overlay.classList.remove('visible');
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('visible');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlay.classList.remove('visible');
    }
  });
}

/**
 * Render the evidence board
 */
function renderEvidenceBoard() {
  const list = document.getElementById('evidence-list');
  const counter = document.getElementById('evidence-counter');
  const accuseBtn = document.getElementById('btn-accuse');
  const evidence = getAllEvidence();
  const count = getEvidenceCount();

  counter.innerHTML = `<span class="found">${count.found}</span> de ${count.total} evidências encontradas`;

  list.innerHTML = evidence.map(e => `
    <div class="evidence-card ${e.found ? 'found' : 'locked'}">
      <div class="evidence-card-content">
        <div class="evidence-card-header">
          <span class="evidence-card-icon">${e.icon}</span>
          <span class="evidence-card-name">${e.found ? e.name : '???'}</span>
          <span class="evidence-card-act">Ato ${e.act}</span>
        </div>
        <div class="evidence-card-description">
          ${e.found ? e.description : 'Evidência ainda não descoberta. Continue investigando.'}
        </div>
      </div>
    </div>
  `).join('');

  // Show accuse button if all evidence found
  if (isAllEvidenceFound()) {
    accuseBtn.classList.remove('hidden');
    accuseBtn.onclick = () => {
      document.getElementById('evidence-overlay').classList.remove('visible');
      showAccusationModal();
    };
  } else {
    accuseBtn.classList.add('hidden');
  }
}

/**
 * Show toast notification when evidence is found
 */
function showEvidenceToast(evidence) {
  const container = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${evidence.icon}</span>
    <div class="toast-content">
      <div class="toast-title">Nova Evidência</div>
      <div class="toast-message">${evidence.name}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

/**
 * Show a prompt in the narrative that the accusation is available
 */
function showAccusationPrompt() {
  const content = document.getElementById('narrative-content');

  const prompt = document.createElement('div');
  prompt.className = 'narrative-evidence';
  prompt.style.borderLeftColor = 'var(--terminal-success)';
  prompt.style.cursor = 'pointer';
  prompt.innerHTML = `
    <div class="evidence-label" style="color: var(--terminal-success);">
      <span>⚖️</span>
      <span>Investigação Completa</span>
    </div>
    <div class="evidence-text">
      Todas as evidências foram encontradas. Você pode abrir o <strong>Painel de Evidências</strong> para fazer a acusação.
    </div>
  `;

  prompt.addEventListener('click', () => {
    showAccusationModal();
  });

  content.appendChild(prompt);
  prompt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Show the accusation modal
 */
function showAccusationModal() {
  const modal = document.getElementById('accusation-modal');
  modal.classList.add('visible');

  const suspects = [
    { id: 3, name: 'Ricardo Almeida', role: 'Gerente de Engenharia', correct: true },
    { id: 5, name: 'Marcos Oliveira', role: 'Diretor Financeiro', correct: false },
    { id: 7, name: 'Lucas Ferreira', role: 'Engenheiro Sênior', correct: false },
    { id: 11, name: 'Eduardo Nunes', role: 'Segurança Patrimonial', correct: false },
  ];

  const suspectList = document.getElementById('accusation-suspects');
  suspectList.innerHTML = suspects.map(s => `
    <button class="suspect-btn" data-id="${s.id}" data-correct="${s.correct}">
      <div>
        <div class="suspect-name">${s.name}</div>
        <div class="suspect-role">${s.role}</div>
      </div>
    </button>
  `).join('');

  // Handle accusation
  suspectList.querySelectorAll('.suspect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isCorrect = btn.dataset.correct === 'true';
      showVerdict(isCorrect, btn.querySelector('.suspect-name').textContent);
    });
  });

  // Close on backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
    }
  });
}

/**
 * Show the final verdict
 */
function showVerdict(isCorrect, accusedName) {
  const card = document.querySelector('.accusation-card');

  if (isCorrect) {
    card.innerHTML = `
      <div class="verdict correct">
        <div class="verdict-icon">🏆</div>
        <div class="verdict-title">Caso Encerrado</div>
        <div class="verdict-text">
          <p><strong>Ricardo Almeida</strong> é o responsável.</p>
          <p>Ele criou o Projeto Phantom como fachada para desviar mais de R$ 167.500 da empresa. Quando Daniel Moreira descobriu a fraude e ameaçou expor tudo, Ricardo foi até o escritório na calada da noite.</p>
          <p>Daniel nunca saiu do prédio.</p>
          <p>A ligação desesperada para o diretor financeiro às 01:32 da manhã foi o último erro de Ricardo.</p>
          <p style="margin-top: 24px; color: var(--accent-primary); font-style: italic;">
            Você seguiu as evidências, cruzou os dados e encontrou a verdade.<br>
            O caso está encerrado.
          </p>
        </div>
        <button class="btn-restart" onclick="location.reload()">↻ Jogar Novamente</button>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="verdict wrong">
        <div class="verdict-icon">❌</div>
        <div class="verdict-title">Acusação Incorreta</div>
        <div class="verdict-text">
          <p><strong>${accusedName}</strong> não é o responsável.</p>
          <p>Revise as evidências com mais cuidado. Quem tinha motivo, oportunidade e meios?</p>
          <p>Cruze os dados: registros de acesso, emails, chamadas e transações financeiras.</p>
        </div>
        <button class="btn-restart" onclick="document.getElementById('accusation-modal').classList.remove('visible'); document.querySelector('.accusation-card').innerHTML = document.querySelector('.accusation-card').dataset.original;">
          ← Voltar e Investigar
        </button>
      </div>
    `;

    // Allow retrying
    setTimeout(() => {
      const modal = document.getElementById('accusation-modal');
      modal.classList.remove('visible');
      // Rebuild the modal for next attempt
      rebuildAccusationModal();
    }, 5000);
  }
}

/**
 * Rebuild accusation modal after wrong answer
 */
function rebuildAccusationModal() {
  const card = document.querySelector('.accusation-card');
  card.innerHTML = `
    <div class="accusation-title">⚖️ Acusação Final</div>
    <div class="accusation-question">
      Com base nas evidências coletadas, quem é o responsável pela morte de Daniel Moreira?
    </div>
    <div class="accusation-suspects" id="accusation-suspects"></div>
  `;
}

/**
 * Update the progress bar in header
 */
function updateProgressBar() {
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  const progress = getProgress();
  const count = getEvidenceCount();

  fill.style.width = `${progress * 100}%`;
  text.textContent = `${count.found}/${count.total}`;
}

/**
 * Update evidence badge count in header
 */
function updateEvidenceBadge() {
  const badge = document.getElementById('evidence-badge');
  const count = getEvidenceCount();
  badge.textContent = count.found;
}

/**
 * Create ambient particles in background
 */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 25; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${8 + Math.random() * 15}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.width = `${1 + Math.random() * 2}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}
