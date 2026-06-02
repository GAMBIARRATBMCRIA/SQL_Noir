// ========================================
// SQL Noir — Terminal Module
// SQL editor, query execution, results rendering, history
// ========================================

import { executeQuery } from './database.js';
import { translateError, getEmptyMessage } from './feedback.js';

let queryHistory = [];
let historyPosition = -1;
let onQueryExecuted = null; // callback: (results, columns, sql) => void

/**
 * Initialize the terminal module
 * @param {Function} queryCallback - Called after each query with (result, sql)
 */
export function initTerminal(queryCallback) {
  onQueryExecuted = queryCallback;

  const input = document.getElementById('sql-input');
  const runBtn = document.getElementById('btn-run');
  const historyBtn = document.getElementById('btn-history');
  const historyPanel = document.getElementById('history-panel');

  // Run query on button click
  runBtn.addEventListener('click', () => runQuery());

  // Keyboard shortcuts
  input.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
      return;
    }

    // Arrow up/down for history navigation
    if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      navigateHistory(-1);
      return;
    }
    if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      navigateHistory(1);
      return;
    }

    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = input.selectionStart;
      const end = input.selectionEnd;
      input.value = input.value.substring(0, start) + '  ' + input.value.substring(end);
      input.selectionStart = input.selectionEnd = start + 2;
    }
  });

  // Update line numbers on input
  input.addEventListener('input', updateLineNumbers);
  input.addEventListener('scroll', syncLineScroll);

  // Toggle history panel
  historyBtn.addEventListener('click', () => {
    historyPanel.classList.toggle('visible');
    if (historyPanel.classList.contains('visible')) {
      renderHistory();
    }
  });

  // Close history when clicking outside
  document.addEventListener('click', (e) => {
    if (!historyPanel.contains(e.target) && e.target !== historyBtn) {
      historyPanel.classList.remove('visible');
    }
  });

  // Initial line numbers
  updateLineNumbers();

  // Focus the input
  input.focus();
}

/**
 * Run the current query
 */
function runQuery() {
  const input = document.getElementById('sql-input');
  const sql = input.value.trim();

  if (!sql) return;

  // Add to history
  if (queryHistory.length === 0 || queryHistory[queryHistory.length - 1] !== sql) {
    queryHistory.push(sql);
  }
  historyPosition = queryHistory.length;

  // Execute
  const result = executeQuery(sql);

  // Render results
  renderResult(result, sql);

  // Notify the game engine
  if (onQueryExecuted) {
    onQueryExecuted(result, sql);
  }
}

/**
 * Render query results
 */
function renderResult(result, sql) {
  const container = document.getElementById('terminal-results');

  // Remove welcome message if present
  const welcome = container.querySelector('.results-welcome');
  if (welcome) welcome.remove();

  // Create result block
  const block = document.createElement('div');
  block.className = 'result-block';

  if (!result.success) {
    // Error result
    const translated = translateError(result.rawError);
    block.innerHTML = `
      <div class="result-meta">
        <span class="result-query">${escapeHtml(truncate(sql, 60))}</span>
      </div>
      <div class="result-error">
        <span class="error-icon">⚡</span>
        <div class="error-content">
          <div class="error-message">${translated.message}</div>
          <div class="error-hint">${translated.hint}</div>
        </div>
      </div>
    `;
  } else if (result.rowCount === 0) {
    // Empty result
    const emptyMsg = getEmptyMessage();
    block.innerHTML = `
      <div class="result-meta">
        <span class="result-query">${escapeHtml(truncate(sql, 60))}</span>
        <span class="result-stats"><span class="count">0</span> registros</span>
      </div>
      <div class="result-empty">
        <span class="empty-icon">📭</span>
        <div class="empty-message">${emptyMsg.message}</div>
        <div class="empty-hint">${emptyMsg.hint}</div>
      </div>
    `;
  } else {
    // Success with data
    const tableHtml = buildTable(result.columns, result.values);
    block.innerHTML = `
      <div class="result-meta">
        <span class="result-query">${escapeHtml(truncate(sql, 60))}</span>
        <span class="result-stats"><span class="count">${result.rowCount}</span> registro${result.rowCount !== 1 ? 's' : ''}</span>
      </div>
      ${tableHtml}
    `;
  }

  // Insert at the top of results
  container.insertBefore(block, container.firstChild);

  // Scroll to top
  container.scrollTop = 0;
}

/**
 * Build an HTML table from columns and values
 */
function buildTable(columns, values) {
  const maxRows = 100; // Cap for performance
  const displayValues = values.slice(0, maxRows);

  let html = '<div class="result-table-wrapper"><table class="result-table"><thead><tr>';

  // Headers
  for (const col of columns) {
    html += `<th>${escapeHtml(col)}</th>`;
  }
  html += '</tr></thead><tbody>';

  // Rows
  for (const row of displayValues) {
    html += '<tr>';
    for (const cell of row) {
      if (cell === null || cell === undefined) {
        html += '<td><span class="null-value">NULL</span></td>';
      } else {
        html += `<td>${escapeHtml(String(cell))}</td>`;
      }
    }
    html += '</tr>';
  }

  html += '</tbody></table></div>';

  if (values.length > maxRows) {
    html += `<div class="result-meta" style="margin-top:8px;"><span class="result-stats">Mostrando ${maxRows} de ${values.length} registros</span></div>`;
  }

  return html;
}

/**
 * Navigate through query history
 */
function navigateHistory(direction) {
  const input = document.getElementById('sql-input');

  if (queryHistory.length === 0) return;

  historyPosition += direction;

  if (historyPosition < 0) historyPosition = 0;
  if (historyPosition >= queryHistory.length) {
    historyPosition = queryHistory.length;
    input.value = '';
    updateLineNumbers();
    return;
  }

  input.value = queryHistory[historyPosition];
  updateLineNumbers();
  input.focus();
}

/**
 * Render the history panel
 */
function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  if (queryHistory.length === 0) {
    list.innerHTML = '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:20px;">Nenhuma consulta executada ainda.</div>';
    return;
  }

  list.innerHTML = queryHistory
    .slice()
    .reverse()
    .map((sql, i) => `
      <div class="history-item" data-index="${queryHistory.length - 1 - i}">
        <code>${escapeHtml(truncate(sql, 50))}</code>
      </div>
    `)
    .join('');

  // Click to re-use query
  list.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index);
      const input = document.getElementById('sql-input');
      input.value = queryHistory[idx];
      updateLineNumbers();
      input.focus();
      document.getElementById('history-panel').classList.remove('visible');
    });
  });
}

/**
 * Update line numbers display
 */
function updateLineNumbers() {
  const input = document.getElementById('sql-input');
  const lineNumbers = document.getElementById('sql-line-numbers');
  if (!lineNumbers) return;

  const lines = input.value.split('\n').length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

/**
 * Sync line number scroll with textarea
 */
function syncLineScroll() {
  const input = document.getElementById('sql-input');
  const lineNumbers = document.getElementById('sql-line-numbers');
  if (lineNumbers) {
    lineNumbers.scrollTop = input.scrollTop;
  }
}

/**
 * Insert a query into the editor (used by hints)
 */
export function insertQuery(sql) {
  const input = document.getElementById('sql-input');
  input.value = sql;
  updateLineNumbers();
  input.focus();
}

// ---- Utility Functions ----

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncate(str, max) {
  return str.length > max ? str.substring(0, max) + '...' : str;
}

/**
 * Reset terminal state
 */
export function resetTerminal() {
  queryHistory = [];
  historyPosition = -1;
  onQueryExecuted = null;
  const input = document.getElementById('sql-input');
  if (input) {
    input.value = '';
    updateLineNumbers();
  }
  const resultsContainer = document.getElementById('terminal-results');
  if (resultsContainer) {
    resultsContainer.querySelectorAll('.result-block').forEach(e => e.remove());
    const welcome = document.getElementById('results-welcome');
    if (welcome) welcome.style.display = 'flex';
  }
}
