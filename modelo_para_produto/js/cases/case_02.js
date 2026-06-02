import { hasRowContaining, columnsInclude } from '../evidence.js';

export const case02 = {
  id: 'case_02',
  title: 'Fraude Silenciosa',
  briefing: 'A loja TechMarket relatou uma inconsistência no estoque e vendas do "Smartphone X". Descubra quem roubou os aparelhos cruzando vendas e estoque.',
  difficulty: 'Fácil (Tutorial)',

  feedbackConfig: {
    systemName: 'TechMarket',
    tableNames: ['estoque', 'vendas'],
    hints: {
      0: [
        { text: 'Comece verificando o estoque atual da loja.', sql: 'SELECT * FROM estoque' },
        { text: 'Veja quais vendas foram registradas.', sql: 'SELECT * FROM vendas' }
      ],
      1: [
        { text: 'Compare o estoque com as vendas feitas.', sql: null }
      ],
      2: [
        { text: 'Você tem as evidências. Pode acusar.', sql: null }
      ]
    }
  },

  schemaDdl: `
    CREATE TABLE estoque (
      id INTEGER PRIMARY KEY,
      produto TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      responsavel TEXT NOT NULL
    );

    CREATE TABLE vendas (
      id INTEGER PRIMARY KEY,
      produto TEXT NOT NULL,
      quantidade_vendida INTEGER NOT NULL,
      vendedor TEXT NOT NULL,
      data DATE NOT NULL
    );
  `,

  seedData: `
    INSERT INTO estoque VALUES (1, 'Notebook Pro', 50, 'Carlos');
    INSERT INTO estoque VALUES (2, 'Smartphone X', 10, 'Amanda');
    INSERT INTO estoque VALUES (3, 'Monitor 4K', 30, 'Carlos');

    INSERT INTO vendas VALUES (1, 'Notebook Pro', 2, 'Ana', '2025-04-01');
    INSERT INTO vendas VALUES (2, 'Smartphone X', 40, 'Amanda', '2025-04-02');
    INSERT INTO vendas VALUES (3, 'Monitor 4K', 1, 'Ana', '2025-04-03');
  `,

  tableInfo: [
    {
      name: 'estoque',
      icon: '📦',
      columns: [
        { name: 'produto', type: 'TEXT', description: 'Nome do produto' },
        { name: 'quantidade', type: 'INTEGER', description: 'Qtd atual em estoque' },
        { name: 'responsavel', type: 'TEXT', description: 'Responsável pelo lote' }
      ]
    },
    {
      name: 'vendas',
      icon: '🛒',
      columns: [
        { name: 'produto', type: 'TEXT', description: 'Nome do produto' },
        { name: 'quantidade_vendida', type: 'INTEGER', description: 'Qtd vendida' },
        { name: 'vendedor', type: 'TEXT', description: 'Quem vendeu' },
        { name: 'data', type: 'DATE', description: 'Data da venda' }
      ]
    }
  ],

  acts: {
    0: {
      label: 'Briefing',
      title: 'A Inconsistência',
      narrative: [
        'A gerência da TechMarket percebeu que o estoque do <strong>Smartphone X</strong> está estranho.',
        'Sua missão é olhar as tabelas <code>estoque</code> e <code>vendas</code> para descobrir quem está fraudando os registros.',
        'Comece olhando o <strong>estoque</strong>.'
      ]
    },
    1: {
      label: 'Ato I',
      title: 'O Estoque',
      narrative: [
        'O estoque atual relata que existem apenas 10 Smartphones X.',
        'A responsável por esse lote é a Amanda.',
        'Mas quantas unidades foram vendidas? Investigue a tabela de <strong>vendas</strong>.'
      ]
    },
    2: {
      label: 'Ato Final',
      title: 'A Fraude',
      narrative: [
        'Você descobriu que Amanda registrou uma venda absurda de 40 unidades do Smartphone X em um único dia.',
        'Essa "venda" fantasma foi usada para encobrir o roubo dos aparelhos.',
        'Você encontrou as evidências necessárias. Faça a acusação!'
      ]
    }
  },

  evidenceNarratives: {
    ver_estoque: { text: 'Você encontrou o registro do Smartphone X no estoque e viu que a Amanda é a responsável.', transition: 1 },
    ver_vendas: { text: 'Você descobriu a venda fantasma de 40 unidades feita por Amanda.', transition: 2 }
  },

  evidenceDefinitions: [
    {
      id: 'ver_estoque',
      act: 1,
      icon: '📦',
      name: 'Estoque do Smartphone',
      description: 'Amanda é a responsável pelo estoque com apenas 10 unidades.',
      narrativeUnlock: 'ver_estoque',
      detect: (columns, values) => hasRowContaining(values, columns, 'produto', 'Smartphone X') && columnsInclude(columns, ['responsavel'])
    },
    {
      id: 'ver_vendas',
      act: 2,
      icon: '🛒',
      name: 'Venda Fantasma',
      description: 'Amanda registrou a venda de 40 unidades de uma vez para esconder o desvio.',
      narrativeUnlock: 'ver_vendas',
      detect: (columns, values) => hasRowContaining(values, columns, 'produto', 'Smartphone X') && hasRowContaining(values, columns, 'vendedor', 'Amanda') && columnsInclude(columns, ['quantidade_vendida'])
    }
  ],

  verdict: {
    suspects: [
      { id: 1, name: 'Carlos', role: 'Gerente de Estoque', correct: false },
      { id: 2, name: 'Amanda', role: 'Analista de Logística', correct: true },
      { id: 3, name: 'Ana', role: 'Vendedora', correct: false }
    ],
    correctText: '<p><strong>Amanda</strong> é a responsável. Ela desviou 40 aparelhos e registrou uma venda falsa para mascarar o roubo.</p>',
    wrongText: 'não é o responsável. Olhe quem registrou a venda absurda do Smartphone.'
  }
};
