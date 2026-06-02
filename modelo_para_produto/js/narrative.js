// ========================================
// SQL Noir — Narrative Engine
// Story progression, typewriter effect, act management
// ========================================

import { getHint } from './feedback.js';
import { insertQuery } from './terminal.js';

// ---- Act Narratives ----
let ACTS = {};
let EVIDENCE_NARRATIVES = {};

// ---- State ----
let currentAct = 0;
let typingInProgress = false;
let hintTimer = null;

/**
 * Initialize the narrative engine
 * @param {Object} actsData - Narrative data for acts
 * @param {Object} evidenceData - Narrative info for evidence discovery
 */
export function initNarrative(actsData, evidenceData) {
  ACTS = actsData || {};
  EVIDENCE_NARRATIVES = evidenceData || {};
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
 * Reset narrative state
 */
export function resetNarrative() {
  currentAct = 0;
  ACTS = {};
  EVIDENCE_NARRATIVES = {};
  if (hintTimer) {
    clearTimeout(hintTimer);
    hintTimer = null;
  }
  const textContainer = document.getElementById('narrative-text');
  if (textContainer) textContainer.innerHTML = '';
  const content = document.getElementById('narrative-content');
  if (content) {
    content.querySelectorAll('.narrative-divider, .narrative-hint, .narrative-evidence, .narrative-text').forEach(e => {
        if (e.id !== 'narrative-text') e.remove();
    });
  }
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
