// ========================================
// SQL Noir — Database Module
// Loads SQL.js (SQLite via WASM) and manages query execution
// ========================================

let db = null;

/**
 * Initialize SQL.js and create the in-memory database
 * @param {string} schemaDdl - The DDL queries to create tables
 * @param {string} seedData - The DML queries to insert initial data
 * @returns {Promise<void>}
 */
export async function initDatabase(schemaDdl, seedData) {
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  db = new SQL.Database();

  // Create tables
  db.run(schemaDdl);

  // Insert all case data
  db.run(seedData);

  console.log('[SQL Noir] Database initialized successfully');
}

/**
 * Execute a SQL query and return structured results
 * @param {string} sql - The SQL query to execute
 * @returns {{ success: boolean, columns?: string[], values?: any[][], rowCount?: number, error?: string, rawError?: string }}
 */
export function executeQuery(sql) {
  if (!db) {
    return {
      success: false,
      error: 'O banco de dados ainda não foi carregado.',
      rawError: 'Database not initialized'
    };
  }

  const trimmed = sql.trim();
  if (!trimmed) {
    return {
      success: false,
      error: 'Digite uma consulta SQL para investigar.',
      rawError: 'Empty query'
    };
  }

  // Block destructive operations
  const forbidden = /^\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|REPLACE)/i;
  if (forbidden.test(trimmed)) {
    return {
      success: false,
      error: '⚠️ Acesso negado. Você tem permissão apenas para consultar dados, não para modificá-los. Use SELECT.',
      rawError: 'Destructive operation blocked'
    };
  }

  try {
    const results = db.exec(trimmed);

    if (results.length === 0) {
      return {
        success: true,
        columns: [],
        values: [],
        rowCount: 0
      };
    }

    // Return the first result set
    const result = results[0];
    return {
      success: true,
      columns: result.columns,
      values: result.values,
      rowCount: result.values.length
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      rawError: err.message
    };
  }
}

/**
 * Get the database instance (for advanced use)
 */
export function getDatabase() {
  return db;
}
