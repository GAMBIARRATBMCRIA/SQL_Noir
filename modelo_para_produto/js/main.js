// ========================================
// SQL Noir — Main Module
// Application entry point, orchestration, intro screen, case hub
// ========================================

import { initDatabase } from './database.js';
import { initTerminal, resetTerminal } from './terminal.js';
import { initEvidence, checkEvidence, getAllEvidence, getEvidenceCount, getProgress, isAllEvidenceFound, resetEvidence } from './evidence.js';
import { initNarrative, onEvidenceFound as narrativeOnEvidence, resetNarrative } from './narrative.js';
import { initFeedback } from './feedback.js';
import { case01 } from './cases/case_01.js';
import { case02 } from './cases/case_02.js';
import { case03 } from './cases/case_03.js';
import { case04 } from './cases/case_04.js';
import { case05 } from './cases/case05_chat.js';
import { case06 } from './cases/case06_chat.js';


// ---- App State ----
let gameStarted = false;
let currentCase = null;

// Mock list of cases available in the game
const availableCases = [
  case01,
  case02,
  case03,
  case04,
  case05,
  case06,
];

// ---- Entry Point ----
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initCaseHub();

  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', resetGame);
  }
});

/**
 * Initialize the Case Selection Hub
 */
function initCaseHub() {
  const hub = document.getElementById('case-selection-screen');
  const list = document.getElementById('case-list');

  list.innerHTML = availableCases.map(c => `
    <div class="case-card" data-id="${c.id}">
      <div class="case-card-header">
        <div class="case-card-title">${c.title}</div>
        <div class="case-card-diff">${c.difficulty}</div>
      </div>
      <div class="case-card-desc">${c.briefing}</div>
    </div>
  `).join('');

  list.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('click', () => {
      const caseId = card.dataset.id;
      const selected = availableCases.find(c => c.id === caseId);
      loadCase(selected);
    });
  });
}

/**
 * Load a specific case and show intro screen
 */
function loadCase(caseData) {
  currentCase = caseData;

  // Hide hub, show intro
  document.getElementById('case-selection-screen').classList.add('hidden');
  document.getElementById('intro-screen').classList.remove('hidden');
  document.getElementById('intro-screen').classList.add('visible');

  // Populate intro
  document.getElementById('intro-briefing-text').textContent = caseData.briefing;
  document.getElementById('intro-briefing-details').innerHTML = `
    <div class="briefing-line">
      &gt; <span class="highlight">CASO</span> — ${caseData.title}
    </div>
    <div class="briefing-line">
      &gt; Dificuldade: ${caseData.difficulty}
    </div>
  `;

  // Update game header
  document.getElementById('header-case-title').textContent = caseData.title;
  document.getElementById('terminal-title').textContent = `Terminal SQL — ${caseData.feedbackConfig.systemName}`;

  initIntro();
}

/**
 * Initialize the intro screen animations and start button
 */
function initIntro() {
  const startBtn = document.getElementById('intro-start-btn');
  const loadingEl = document.getElementById('intro-loading');

  // Reset lines
  const lines = document.querySelectorAll('.briefing-line');
  lines.forEach(l => l.classList.remove('visible'));

  // Typewriter effect for briefing lines
  lines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('visible');
    }, 800 + (i * 400));
  });

  // Remove old listeners to avoid multiple fires if returning to hub (not implemented yet)
  const newBtn = startBtn.cloneNode(true);
  startBtn.parentNode.replaceChild(newBtn, startBtn);

  newBtn.addEventListener('click', async () => {
    newBtn.style.display = 'none';
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
  // Initialize feedback with case config
  initFeedback(currentCase.feedbackConfig);

  // Load SQL.js and create database
  await initDatabase(currentCase.schemaDdl, currentCase.seedData);

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
  }, currentCase.evidenceDefinitions);

  // Initialize terminal with query callback
  initTerminal((result, sql) => {
    if (result.success && result.values && result.values.length > 0) {
      checkEvidence(result);
    }
  });

  // Initialize narrative
  initNarrative(currentCase.acts, currentCase.evidenceNarratives);

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

  intro.classList.remove('visible');
  intro.classList.add('hidden'); // Ensure it is fully hidden
  game.classList.add('active');

  // Focus the SQL input after transition
  setTimeout(() => {
    const input = document.getElementById('sql-input');
    if (input) input.focus();
  }, 800);
}

/**
 * Reset game state and return to hub
 */
function resetGame() {
  if (!gameStarted) return;
  gameStarted = false;
  currentCase = null;

  // Reset modules
  resetEvidence();
  resetNarrative();
  resetTerminal();

  // Reset UI
  document.getElementById('game-container').classList.remove('active');
  document.getElementById('case-selection-screen').classList.remove('hidden');
  document.getElementById('intro-screen').classList.add('hidden');
  document.getElementById('intro-screen').classList.remove('visible');

  // Reset progress and badges
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-text').textContent = '0/0';
  document.getElementById('evidence-badge').textContent = '0';

  // Close any overlays
  document.getElementById('evidence-overlay').classList.remove('visible');
  document.getElementById('accusation-modal').classList.remove('visible');

  // Clear schema bar
  const bar = document.getElementById('schema-bar');
  if (bar) bar.querySelectorAll('.schema-table-btn').forEach(btn => btn.remove());
}

/**
 * Initialize the schema explorer in the footer
 */
function initSchemaExplorer() {
  const bar = document.getElementById('schema-bar');
  const detail = document.getElementById('schema-detail');
  let activeTable = null;

  // Clear existing buttons
  bar.querySelectorAll('.schema-table-btn').forEach(btn => btn.remove());

  // Create table buttons
  currentCase.tableInfo.forEach(table => {
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
      <td>${col.type || 'TEXT'}</td>
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

  const suspects = currentCase.verdict.suspects;

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
          ${currentCase.verdict.correctText}
          <p style="margin-top: 24px; color: var(--accent-primary); font-style: italic;">
            Você seguiu as evidências, cruzou os dados e encontrou a verdade.<br>
            O caso está encerrado.
          </p>
        </div>
        <button class="btn-restart" onclick="location.reload()">↻ Voltar aos Arquivos</button>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="verdict wrong">
        <div class="verdict-icon">❌</div>
        <div class="verdict-title">Acusação Incorreta</div>
        <div class="verdict-text">
          <p><strong>${accusedName}</strong> ${currentCase.verdict.wrongText}</p>
        </div>
        <button class="btn-restart" id="btn-retry-accusation">
          ← Voltar e Investigar
        </button>
      </div>
    `;

    document.getElementById('btn-retry-accusation').addEventListener('click', () => {
      rebuildAccusationModal();
      showAccusationModal();
    });
  }
}

/**
 * Rebuild accusation modal after wrong answer
 */
function rebuildAccusationModal() {
  const card = document.querySelector('.accusation-card');
  card.innerHTML = `
    <div class="accusation-title">⚖️ Acusação Final</div>
    <div class="accusation-question" id="accusation-question">
      Com base nas evidências coletadas, quem é o responsável?
    </div>
    <div class="accusation-suspects" id="accusation-suspects"></div>
  `;

  // Need to re-populate the suspects list when they reopen
  // Which means it will be populated by showAccusationModal when clicked again
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
