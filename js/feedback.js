// ========================================
// SQL Noir — Feedback Module
// Friendly error messages + contextual hints
// ========================================

/**
 * Translate raw SQL errors into investigative-tone messages
 * @param {string} rawError - The raw error message from SQLite
 * @returns {{ message: string, hint: string }}
 */
export function translateError(rawError) {
  const lower = rawError.toLowerCase();

  // No such table
  if (lower.includes('no such table')) {
    const match = rawError.match(/no such table:\s*(\w+)/i);
    const tableName = match ? match[1] : '(desconhecida)';
    return {
      message: `A fonte de dados "${tableName}" não existe no sistema da Nexus.`,
      hint: 'Verifique os arquivos disponíveis na barra inferior. As tabelas são: funcionarios, registros_acesso, emails, chamadas, transacoes, projetos.'
    };
  }

  // No such column
  if (lower.includes('no such column')) {
    const match = rawError.match(/no such column:\s*(\S+)/i);
    const colName = match ? match[1] : '(desconhecido)';
    return {
      message: `O campo "${colName}" não foi encontrado nos registros.`,
      hint: 'Clique em uma tabela na barra inferior para ver os campos disponíveis.'
    };
  }

  // Syntax error / near
  if (lower.includes('syntax error') || lower.includes('near "')) {
    const match = rawError.match(/near "([^"]+)"/i);
    const near = match ? match[1] : '';
    return {
      message: `O sistema não conseguiu interpretar o comando${near ? ` próximo a "${near}"` : ''}.`,
      hint: 'Verifique a estrutura da consulta. Exemplo: SELECT coluna FROM tabela WHERE condição'
    };
  }

  // Ambiguous column
  if (lower.includes('ambiguous column')) {
    return {
      message: 'Um dos campos mencionados existe em mais de uma tabela.',
      hint: 'Quando usar JOIN, especifique a tabela: tabela.campo (ex: funcionarios.id)'
    };
  }

  // Misuse of aggregate
  if (lower.includes('misuse of aggregate')) {
    return {
      message: 'Função de agregação usada de forma incorreta.',
      hint: 'Funções como COUNT, SUM, AVG precisam de GROUP BY quando combinadas com campos normais.'
    };
  }

  // Generic fallback
  return {
    message: 'O sistema encontrou um problema ao processar sua consulta.',
    hint: rawError
  };
}

/**
 * Contextual hints based on the current act and time since last query
 */
const HINTS = {
  0: [
    {
      text: 'Todo caso começa pela vítima. Quem era Daniel Moreira?',
      sql: 'SELECT * FROM funcionarios WHERE nome LIKE \'%Daniel%\''
    },
    {
      text: 'Explore os dados dos funcionários para conhecer quem trabalhava na Nexus.',
      sql: 'SELECT * FROM funcionarios'
    }
  ],
  1: [
    {
      text: 'Daniel foi encontrado na manhã de sexta-feira, 14 de março. O que aconteceu na noite anterior?',
      sql: 'SELECT * FROM registros_acesso WHERE data_hora >= \'2025-03-13 20:00:00\''
    },
    {
      text: 'Os registros de acesso mostram quem entrou e saiu do prédio. Verifique a noite do incidente.',
      sql: null
    }
  ],
  2: [
    {
      text: 'Com quem Daniel se comunicava nos últimos dias? Verifique os emails.',
      sql: null
    },
    {
      text: 'As chamadas telefônicas podem revelar conversas tensas. Quem ligou para quem?',
      sql: null
    }
  ],
  3: [
    {
      text: 'Siga o dinheiro. As transações financeiras podem revelar o motivo.',
      sql: 'SELECT * FROM transacoes WHERE descricao LIKE \'%Phantom%\''
    },
    {
      text: 'Investigue os projetos da empresa. Algum deles parece suspeito?',
      sql: 'SELECT * FROM projetos'
    }
  ],
  4: [
    {
      text: 'Você tem evidências suficientes. Cruze os dados: quem tinha motivo, oportunidade e meios?',
      sql: null
    }
  ]
};

let hintIndex = {};

/**
 * Get the next hint for the current act
 * @param {number} act - Current act number (0-4)
 * @returns {{ text: string, sql: string|null } | null}
 */
export function getHint(act) {
  const actHints = HINTS[act];
  if (!actHints || actHints.length === 0) return null;

  if (!hintIndex[act]) hintIndex[act] = 0;
  
  const hint = actHints[hintIndex[act] % actHints.length];
  hintIndex[act]++;
  
  return hint;
}

/**
 * Messages for empty results (encouraging, not punishing)
 */
export const EMPTY_MESSAGES = [
  {
    message: 'Nenhum registro encontrado.',
    hint: 'Talvez os filtros estejam muito restritivos. Tente ampliar a busca ou ajustar as condições.'
  },
  {
    message: 'A busca não retornou resultados.',
    hint: 'Isso pode ser uma pista — a ausência de dados também conta. Ou tente diferentes critérios.'
  },
  {
    message: 'Sem correspondências para essa consulta.',
    hint: 'Verifique os valores usados nos filtros. Lembre-se: textos são sensíveis a maiúsculas/minúsculas.'
  }
];

let emptyIndex = 0;

export function getEmptyMessage() {
  const msg = EMPTY_MESSAGES[emptyIndex % EMPTY_MESSAGES.length];
  emptyIndex++;
  return msg;
}
