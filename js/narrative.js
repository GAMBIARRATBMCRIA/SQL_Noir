// ========================================
// SQL Noir — Narrative Engine
// Story progression, typewriter effect, act management
// ========================================

import { getHint } from './feedback.js';
import { insertQuery } from './terminal.js';

// ---- Act Narratives ----
const ACTS = {
  0: {
    label: 'Briefing',
    title: 'O Caso',
    narrative: [
      'Você é um analista forense digital contratado pela seguradora da Nexus Systems.',
      'Daniel Moreira, engenheiro sênior, foi encontrado morto em sua estação de trabalho na manhã de sexta-feira, 14 de março de 2025.',
      'A polícia classificou como causa natural. A seguradora discorda.',
      'Você tem acesso total ao banco de dados corporativo da Nexus. Use-o.',
      '<strong>Comece investigando a vítima.</strong>'
    ]
  },
  1: {
    label: 'Ato I',
    title: 'Quem era Daniel Moreira?',
    narrative: [
      'Daniel Moreira, 34 anos. Engenheiro sênior no departamento de Engenharia.',
      'Trabalhava na Nexus desde 2019. Responsável pelo <strong>Projeto Helix</strong>, o principal produto da empresa.',
      'Salário de R$ 18.500 — compatível com o cargo. Subordinado a Ricardo Almeida, gerente de engenharia.',
      'Colegas descrevem Daniel como meticuloso. Ele frequentemente trabalhava até tarde.',
      '<strong>O que aconteceu na noite em que ele morreu?</strong>'
    ]
  },
  2: {
    label: 'Ato II',
    title: 'A Noite do Incidente',
    narrative: [
      'Os registros de acesso revelam a movimentação daquela noite.',
      'Daniel entrou no prédio às <strong>07:45</strong> do dia 13 e nunca registrou saída.',
      'Eduardo Nunes, segurança patrimonial, iniciou o turno noturno às <strong>22:00</strong>.',
      'Mas o dado mais perturbador: <strong>Ricardo Almeida</strong> — o supervisor de Daniel — entrou no prédio às <strong>23:47</strong> e saiu às <strong>01:15</strong>.',
      'O que o gerente de engenharia fazia no escritório quase à meia-noite?',
      '<strong>Investigue as comunicações entre eles.</strong>'
    ]
  },
  3: {
    label: 'Ato III',
    title: 'Conexões Perigosas',
    narrative: [
      'Os emails revelam uma escalada de tensão.',
      'Daniel havia descoberto irregularidades no <strong>Projeto Phantom</strong> — um projeto sob responsabilidade direta de Ricardo.',
      'No dia 12 de março, Daniel escreveu: <em>"Isso não vai ficar assim, Ricardo."</em>',
      'Uma ligação de 9 minutos entre os dois aconteceu na noite do dia 12.',
      'E na madrugada do dia 14, às <strong>01:32</strong> — apenas 17 minutos após sair do prédio — Ricardo ligou para <strong>Marcos Oliveira</strong>, o diretor financeiro.',
      'Por que ligar para o CFO de madrugada?',
      '<strong>Siga o dinheiro.</strong>'
    ]
  },
  4: {
    label: 'Ato IV',
    title: 'Siga o Dinheiro',
    narrative: [
      'O Projeto Phantom é uma fraude.',
      'R$ 380.000 em orçamento alocado. Zero entregáveis. Nenhum repositório de código. Nenhum servidor.',
      'Mais de <strong>R$ 167.500</strong> em transferências e reembolsos — todos vinculados a Ricardo Almeida.',
      '"Consultoria externa" sem contrato. "Viagem técnica" sem comprovante. "Treinamento especializado" sem certificado.',
      'Daniel descobriu tudo. Documentou as evidências em um email para si mesmo e planejava reportar à diretoria na segunda-feira.',
      'Ele não chegou até segunda-feira.',
      '<strong>Você tem todas as evidências. Está pronto para fazer a acusação?</strong>'
    ]
  }
};

// Evidence-to-narrative mapping
const EVIDENCE_NARRATIVES = {
  perfil_daniel: {
    text: 'Perfil da vítima identificado nos registros da empresa.',
    transition: 1
  },
  projeto_helix: {
    text: 'Projeto Helix confirmado — Daniel era o responsável técnico principal.',
    transition: null
  },
  acesso_noturno: {
    text: 'Registros de acesso noturno recuperados do sistema de catracas.',
    transition: 2
  },
  ricardo_no_predio: {
    text: 'Presença de Ricardo Almeida confirmada no prédio durante a madrugada.',
    transition: null
  },
  email_ameaca: {
    text: 'Email confrontador encontrado: Daniel sabia de algo e não pretendia calar.',
    transition: 3
  },
  chamada_madrugada: {
    text: 'Chamada de madrugada registrada entre Ricardo e o diretor financeiro.',
    transition: null
  },
  transacoes_phantom: {
    text: 'Fluxo financeiro irregular detectado nas transações do Projeto Phantom.',
    transition: 4
  },
  projeto_fantasma: {
    text: 'Projeto Phantom confirmado como fachada — sem nenhum entregável real.',
    transition: null
  },
  backup_daniel: {
    text: 'Notas pessoais de Daniel recuperadas. Ele documentou tudo antes de morrer.',
    transition: null
  }
};

// ---- State ----
let currentAct = 0;
let typingInProgress = false;
let hintTimer = null;

/**
 * Initialize the narrative engine
 */
export function initNarrative() {
  renderAct(0);
  renderProgressDots();
}

/**
 * Handle new evidence being found
 * @param {Object} evidence - The evidence that was found
 */
export function onEvidenceFound(evidence) {
  const narrativeInfo = EVIDENCE_NARRATIVES[evidence.id];
  if (!narrativeInfo) return;

  // Add evidence card to narrative
  addEvidenceToNarrative(evidence, narrativeInfo.text);

  // Check if this evidence triggers a new act
  if (narrativeInfo.transition !== null && narrativeInfo.transition > currentAct) {
    setTimeout(() => {
      advanceToAct(narrativeInfo.transition);
    }, 1500);
  }

  // Reset hint timer
  resetHintTimer();
}

/**
 * Render an act's narrative
 */
function renderAct(actNumber) {
  currentAct = actNumber;
  const act = ACTS[actNumber];
  if (!act) return;

  // Update header
  const actLabel = document.getElementById('narrative-act-label');
  const actTitle = document.getElementById('narrative-act-title');
  if (actLabel) actLabel.textContent = act.label;
  if (actTitle) actTitle.textContent = act.title;

  // Clear and rebuild narrative content
  const content = document.getElementById('narrative-content');
  const textContainer = document.getElementById('narrative-text');

  // Type out the narrative
  textContainer.innerHTML = '';
  typeNarrative(act.narrative, textContainer);

  // Update progress dots
  renderProgressDots();

  // Scroll to top
  content.scrollTop = 0;

  // Start hint timer
  resetHintTimer();
}

/**
 * Advance to a new act with transition
 */
function advanceToAct(actNumber) {
  if (actNumber <= currentAct) return;

  const content = document.getElementById('narrative-content');

  // Add divider
  const divider = document.createElement('div');
  divider.className = 'narrative-divider anim-fade-in';
  divider.innerHTML = '<span class="divider-icon">◆</span>';
  content.appendChild(divider);

  // Render new act content below
  currentAct = actNumber;
  const act = ACTS[actNumber];
  if (!act) return;

  // Update header
  const actLabel = document.getElementById('narrative-act-label');
  const actTitle = document.getElementById('narrative-act-title');
  if (actLabel) {
    actLabel.textContent = act.label;
    actLabel.classList.add('anim-fade-in');
  }
  if (actTitle) {
    actTitle.textContent = act.title;
    actTitle.classList.add('anim-fade-in');
  }

  // Add narrative paragraphs with typewriter
  const textContainer = document.createElement('div');
  textContainer.className = 'narrative-text';
  content.appendChild(textContainer);

  typeNarrative(act.narrative, textContainer);

  // Update progress dots
  renderProgressDots();

  // Scroll to the new content
  setTimeout(() => {
    divider.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

/**
 * Type out narrative text with typewriter effect
 */
async function typeNarrative(paragraphs, container) {
  typingInProgress = true;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = document.createElement('p');
    p.className = 'typewriter';
    container.appendChild(p);

    await typeText(p, paragraphs[i], 15);
    p.classList.add('done');

    // Small pause between paragraphs
    if (i < paragraphs.length - 1) {
      await delay(200);
    }
  }

  typingInProgress = false;
}

/**
 * Type text character by character (supports HTML tags)
 */
function typeText(element, html, speed = 20) {
  return new Promise((resolve) => {
    // Parse HTML to extract text and tags
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const fullText = temp.innerHTML;

    let i = 0;
    let displayed = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';

    function tick() {
      if (i >= fullText.length) {
        element.innerHTML = fullText;
        resolve();
        return;
      }

      // Handle HTML tags - add them all at once
      if (fullText[i] === '<') {
        const closeIdx = fullText.indexOf('>', i);
        if (closeIdx !== -1) {
          displayed += fullText.substring(i, closeIdx + 1);
          i = closeIdx + 1;
        } else {
          displayed += fullText[i];
          i++;
        }
      } else {
        displayed += fullText[i];
        i++;
      }

      element.innerHTML = displayed;
      element.appendChild(cursor);

      setTimeout(tick, speed + Math.random() * 10);
    }

    tick();
  });
}

/**
 * Add evidence card to narrative panel
 */
function addEvidenceToNarrative(evidence, text) {
  const content = document.getElementById('narrative-content');

  const card = document.createElement('div');
  card.className = 'narrative-evidence';
  card.innerHTML = `
    <div class="evidence-label">
      <span>${evidence.icon}</span>
      <span>Evidência Encontrada</span>
    </div>
    <div class="evidence-text">${text}</div>
  `;

  content.appendChild(card);

  // Scroll to the new evidence
  setTimeout(() => {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/**
 * Show a contextual hint in the narrative panel
 */
function showHint() {
  const hint = getHint(currentAct);
  if (!hint) return;

  const content = document.getElementById('narrative-content');

  // Remove previous hints
  content.querySelectorAll('.narrative-hint').forEach(h => h.remove());

  const hintEl = document.createElement('div');
  hintEl.className = 'narrative-hint';
  hintEl.innerHTML = `
    <span class="hint-icon">💡</span>
    <div class="hint-text">
      ${hint.text}
      ${hint.sql ? `<br><code>${hint.sql}</code>` : ''}
    </div>
  `;

  // If there's a sql suggestion, make it clickable
  if (hint.sql) {
    hintEl.style.cursor = 'pointer';
    hintEl.addEventListener('click', () => {
      insertQuery(hint.sql);
    });
  }

  content.appendChild(hintEl);
  hintEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Render act progress dots
 */
function renderProgressDots() {
  const container = document.getElementById('narrative-progress');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i <= 4; i++) {
    if (i > 0) {
      const line = document.createElement('div');
      line.className = 'progress-line' + (i <= currentAct ? ' completed' : '');
      container.appendChild(line);
    }

    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i < currentAct) dot.classList.add('completed');
    if (i === currentAct) dot.classList.add('active');
    container.appendChild(dot);
  }
}

/**
 * Reset the hint timer (shows hint after 45 seconds of inactivity)
 */
function resetHintTimer() {
  if (hintTimer) clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    showHint();
  }, 45000);
}

/**
 * Get current act number
 */
export function getActNumber() {
  return currentAct;
}

// ---- Utilities ----
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
