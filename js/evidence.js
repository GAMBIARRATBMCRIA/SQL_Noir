// ========================================
// SQL Noir — Evidence Detection Module
// Detects evidence from query results and manages the evidence board
// ========================================

/**
 * Evidence definitions: each has an ID, act, display info, and a detection function.
 * Detection functions analyze query RESULTS (not the SQL itself),
 * so players can reach evidence through ANY valid SQL path.
 */
const EVIDENCE_DEFINITIONS = [
  // === ACT 1: Who was Daniel? ===
  {
    id: 'perfil_daniel',
    act: 1,
    icon: '👤',
    name: 'Perfil da Vítima',
    description: 'Daniel Moreira, Engenheiro Sênior da Nexus Systems. Status: falecido.',
    narrativeUnlock: 'perfil_daniel',
    detect: (columns, values) => {
      return hasRowContaining(values, columns, 'nome', 'Daniel Moreira');
    }
  },
  {
    id: 'projeto_helix',
    act: 1,
    icon: '📁',
    name: 'Projeto Helix',
    description: 'Daniel era responsável pelo Projeto Helix, com orçamento de R$ 450.000.',
    narrativeUnlock: 'projeto_helix',
    detect: (columns, values) => {
      // Detect when results show Helix project info
      return hasRowContaining(values, columns, 'nome', 'Helix') &&
             columnsInclude(columns, ['orcamento', 'responsavel_id']);
    }
  },

  // === ACT 2: The Night ===
  {
    id: 'acesso_noturno',
    act: 2,
    icon: '🌙',
    name: 'Acessos Noturnos',
    description: 'Na noite de 13 de março, três pessoas estavam no prédio: Daniel, Ricardo e Eduardo (segurança).',
    narrativeUnlock: 'acesso_noturno',
    detect: (columns, values) => {
      // Detect access records from the night of the incident
      if (!columnsInclude(columns, ['data_hora'])) return false;
      const dateColIdx = columns.indexOf('data_hora');
      return values.some(row => {
        const val = String(row[dateColIdx]);
        return (val.includes('2025-03-13 2') || val.includes('2025-03-14 0'));
      });
    }
  },
  {
    id: 'ricardo_no_predio',
    act: 2,
    icon: '🚪',
    name: 'Visita Suspeita',
    description: 'Ricardo Almeida entrou no prédio às 23:47 e saiu às 01:15. O que ele fazia lá naquele horário?',
    narrativeUnlock: 'ricardo_no_predio',
    detect: (columns, values) => {
      // Detect Ricardo's late-night access specifically
      if (!columnsInclude(columns, ['data_hora'])) return false;
      const dateColIdx = columns.indexOf('data_hora');
      return values.some(row => {
        const val = String(row[dateColIdx]);
        return val.includes('2025-03-13 23:47');
      });
    }
  },

  // === ACT 3: Connections ===
  {
    id: 'email_ameaca',
    act: 3,
    icon: '📧',
    name: 'Email Ameaçador',
    description: '"Isso não vai ficar assim, Ricardo." — Daniel descobriu algo e estava furioso.',
    narrativeUnlock: 'email_ameaca',
    detect: (columns, values) => {
      return values.some(row =>
        row.some(cell => String(cell).includes('Isso não vai ficar assim'))
      );
    }
  },
  {
    id: 'chamada_madrugada',
    act: 3,
    icon: '📞',
    name: 'Chamada de Madrugada',
    description: 'Ricardo ligou para Marcos Oliveira (CFO) às 01:32 da manhã. Logo após sair do prédio.',
    narrativeUnlock: 'chamada_madrugada',
    detect: (columns, values) => {
      if (!columnsInclude(columns, ['data_hora'])) return false;
      const dateColIdx = columns.indexOf('data_hora');
      return values.some(row => {
        const val = String(row[dateColIdx]);
        return val.includes('2025-03-14 01:32');
      });
    }
  },

  // === ACT 4: Follow the Money ===
  {
    id: 'transacoes_phantom',
    act: 4,
    icon: '💰',
    name: 'Dinheiro Fantasma',
    description: 'Mais de R$ 167.500 em transferências e reembolsos vinculados ao Projeto Phantom — sem nenhum entregável real.',
    narrativeUnlock: 'transacoes_phantom',
    detect: (columns, values) => {
      return values.some(row =>
        row.some(cell => String(cell).toLowerCase().includes('phantom'))
      ) && columnsInclude(columns, ['valor']);
    }
  },
  {
    id: 'projeto_fantasma',
    act: 4,
    icon: '👻',
    name: 'O Projeto Fantasma',
    description: 'O Projeto Phantom tem orçamento de R$ 380.000 mas nenhum código, nenhum servidor, nenhum entregável.',
    narrativeUnlock: 'projeto_fantasma',
    detect: (columns, values) => {
      return hasRowContaining(values, columns, 'nome', 'Phantom') &&
             columnsInclude(columns, ['orcamento']);
    }
  },
  {
    id: 'backup_daniel',
    act: 4,
    icon: '📝',
    name: 'Notas de Daniel',
    description: 'Daniel enviou um email para si mesmo documentando as irregularidades. Ele sabia do perigo.',
    narrativeUnlock: 'backup_daniel',
    detect: (columns, values) => {
      return values.some(row =>
        row.some(cell => String(cell).includes('NÃO DELETAR') || String(cell).includes('irregularidades graves'))
      );
    }
  },
];

// ---- State ----
let foundEvidence = new Set();
let onEvidenceFound = null; // callback: (evidence) => void

/**
 * Initialize the evidence system
 * @param {Function} callback - Called when new evidence is found
 */
export function initEvidence(callback) {
  onEvidenceFound = callback;
  foundEvidence = new Set();
}

/**
 * Check query results against all evidence definitions
 * @param {{ columns: string[], values: any[][] }} result - Query result
 * @returns {Array} Newly found evidence
 */
export function checkEvidence(result) {
  if (!result.success || !result.columns || result.values.length === 0) {
    return [];
  }

  const newlyFound = [];

  for (const evidence of EVIDENCE_DEFINITIONS) {
    if (foundEvidence.has(evidence.id)) continue;

    try {
      if (evidence.detect(result.columns, result.values)) {
        foundEvidence.add(evidence.id);
        newlyFound.push(evidence);

        if (onEvidenceFound) {
          onEvidenceFound(evidence);
        }
      }
    } catch (e) {
      // Silently skip detection errors
      console.warn(`Evidence detection error for ${evidence.id}:`, e);
    }
  }

  return newlyFound;
}

/**
 * Get the current act based on found evidence
 * @returns {number} Current act (1-5)
 */
export function getCurrentAct() {
  if (foundEvidence.size === 0) return 0;

  const maxAct = Math.max(
    ...EVIDENCE_DEFINITIONS
      .filter(e => foundEvidence.has(e.id))
      .map(e => e.act)
  );

  // Check if all evidence for the max act is found
  const actEvidence = EVIDENCE_DEFINITIONS.filter(e => e.act === maxAct);
  const allFound = actEvidence.every(e => foundEvidence.has(e.id));

  return allFound ? maxAct : maxAct;
}

/**
 * Check if all evidence has been found
 */
export function isAllEvidenceFound() {
  return foundEvidence.size >= EVIDENCE_DEFINITIONS.length;
}

/**
 * Get all evidence definitions with their found status
 */
export function getAllEvidence() {
  return EVIDENCE_DEFINITIONS.map(e => ({
    ...e,
    found: foundEvidence.has(e.id)
  }));
}

/**
 * Get evidence count
 */
export function getEvidenceCount() {
  return {
    found: foundEvidence.size,
    total: EVIDENCE_DEFINITIONS.length
  };
}

/**
 * Get progress percentage
 */
export function getProgress() {
  return foundEvidence.size / EVIDENCE_DEFINITIONS.length;
}

// ---- Detection Helpers ----

function hasRowContaining(values, columns, columnName, searchValue) {
  const colIdx = columns.indexOf(columnName);
  if (colIdx === -1) {
    // Also check case-insensitively
    const lowerName = columnName.toLowerCase();
    const idx = columns.findIndex(c => c.toLowerCase() === lowerName);
    if (idx === -1) return false;
    return values.some(row => String(row[idx]).includes(searchValue));
  }
  return values.some(row => String(row[colIdx]).includes(searchValue));
}

function columnsInclude(columns, names) {
  const lowerCols = columns.map(c => c.toLowerCase());
  return names.some(name => lowerCols.includes(name.toLowerCase()));
}
