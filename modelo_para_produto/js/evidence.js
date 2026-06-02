// ========================================
// SQL Noir — Evidence Detection Module
// Detects evidence from query results and manages the evidence board
// ========================================

let EVIDENCE_DEFINITIONS = [];

// ---- State ----
let foundEvidence = new Set();
let onEvidenceFound = null; // callback: (evidence) => void

/**
 * Initialize the evidence system
 * @param {Function} callback - Called when new evidence is found
 * @param {Array} definitions - The evidence definitions from the case
 */
export function initEvidence(callback, definitions) {
  onEvidenceFound = callback;
  EVIDENCE_DEFINITIONS = definitions || [];
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

  return Math.max(
    ...EVIDENCE_DEFINITIONS
      .filter(e => foundEvidence.has(e.id))
      .map(e => e.act)
  );
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

export function hasRowContaining(values, columns, columnName, searchValue) {
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

export function columnsInclude(columns, names) {
  const lowerCols = columns.map(c => c.toLowerCase());
  return names.some(name => lowerCols.includes(name.toLowerCase()));
}

/**
 * Reset the evidence state
 */
export function resetEvidence() {
  foundEvidence = new Set();
  EVIDENCE_DEFINITIONS = [];
  onEvidenceFound = null;
}
