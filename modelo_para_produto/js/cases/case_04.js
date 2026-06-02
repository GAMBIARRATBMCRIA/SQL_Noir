export const case04 = {
  id: 'case_04',
  title: 'Desvio no Caixa',
  briefing: 'A rede de lanchonetes "BurgerStop" suspeita que um dos gerentes de filial está furtando dinheiro vivo do caixa. Use funções de agregação (SUM, COUNT) para identificar a loja com discrepâncias.',
  difficulty: 'Difícil (Foco em Agregação)',

  feedbackConfig: {
    systemName: 'BurgerStop ERP',
    tableNames: ['lojas', 'vendas'],
    hints: {
      0: [
        { text: 'Precisamos ter uma visão geral das vendas. Quantas vendas cada loja fez no total?', sql: "SELECT loja_id, COUNT(id) as total_vendas FROM vendas GROUP BY loja_id" },
        { text: 'A função COUNT() nos permite contar registros. Lembre-se do GROUP BY loja_id.', sql: null }
      ],
      1: [
        { text: 'Agora, veja a receita total de cada loja. Qual o valor somado de todas as vendas?', sql: "SELECT loja_id, SUM(valor) as receita_total FROM vendas GROUP BY loja_id" },
        { text: 'A função SUM(valor) vai calcular o total faturado por cada loja.', sql: null }
      ],
      2: [
        { text: 'O roubo suspeito é de dinheiro vivo. Compare as vendas por método de pagamento.', sql: "SELECT loja_id, SUM(valor) FROM vendas WHERE metodo_pagamento = 'dinheiro' GROUP BY loja_id" },
        { text: 'Filtre as vendas por "dinheiro" e depois aplique o SUM() e GROUP BY.', sql: null }
      ],
      3: [
        { text: 'Você encontrou a loja onde as vendas em dinheiro praticamente não existem. Faça sua acusação.', sql: null }
      ]
    }
  },

  schemaDdl: `
    CREATE TABLE lojas (
      id INTEGER PRIMARY KEY,
      nome TEXT,
      gerente TEXT
    );

    CREATE TABLE vendas (
      id INTEGER PRIMARY KEY,
      loja_id INTEGER,
      valor DECIMAL(10,2),
      metodo_pagamento TEXT,
      data_hora DATETIME,
      FOREIGN KEY (loja_id) REFERENCES lojas(id)
    );
  `,

  seedData: `
    INSERT INTO lojas VALUES (1, 'Filial Centro', 'Roberto Dias');
    INSERT INTO lojas VALUES (2, 'Filial Shopping', 'Camila Martins');
    INSERT INTO lojas VALUES (3, 'Filial Estação', 'Sérgio Nogueira');

    -- Filial Centro (Normal: cartao e dinheiro equilibrados)
    INSERT INTO vendas VALUES (1, 1, 45.50, 'cartao', '2025-05-15 12:00:00');
    INSERT INTO vendas VALUES (2, 1, 32.00, 'dinheiro', '2025-05-15 12:15:00');
    INSERT INTO vendas VALUES (3, 1, 55.90, 'cartao', '2025-05-15 12:30:00');
    INSERT INTO vendas VALUES (4, 1, 28.50, 'dinheiro', '2025-05-15 13:00:00');
    INSERT INTO vendas VALUES (5, 1, 40.00, 'pix', '2025-05-15 13:10:00');
    INSERT INTO vendas VALUES (6, 1, 35.00, 'dinheiro', '2025-05-15 13:45:00');

    -- Filial Shopping (Normal: muito cartao, pouco dinheiro)
    INSERT INTO vendas VALUES (7, 2, 65.00, 'cartao', '2025-05-15 12:05:00');
    INSERT INTO vendas VALUES (8, 2, 85.50, 'cartao', '2025-05-15 12:25:00');
    INSERT INTO vendas VALUES (9, 2, 42.00, 'dinheiro', '2025-05-15 12:40:00');
    INSERT INTO vendas VALUES (10, 2, 70.00, 'cartao', '2025-05-15 13:05:00');
    INSERT INTO vendas VALUES (11, 2, 90.00, 'pix', '2025-05-15 13:20:00');
    INSERT INTO vendas VALUES (12, 2, 50.00, 'dinheiro', '2025-05-15 13:50:00');

    -- Filial Estacao (Anomalia: quase zero dinheiro vivo, Sergio está roubando)
    INSERT INTO vendas VALUES (13, 3, 48.00, 'cartao', '2025-05-15 12:10:00');
    INSERT INTO vendas VALUES (14, 3, 52.50, 'cartao', '2025-05-15 12:20:00');
    INSERT INTO vendas VALUES (15, 3, 60.00, 'cartao', '2025-05-15 12:45:00');
    INSERT INTO vendas VALUES (16, 3, 4.00, 'dinheiro', '2025-05-15 13:15:00'); -- Apenas uma balinha
    INSERT INTO vendas VALUES (17, 3, 45.00, 'pix', '2025-05-15 13:30:00');
    INSERT INTO vendas VALUES (18, 3, 58.00, 'cartao', '2025-05-15 13:55:00');
  `,

  tableInfo: [
    {
      name: 'lojas',
      icon: '🏪',
      columns: [
        { name: 'id', type: 'INTEGER', description: 'ID da filial' },
        { name: 'nome', type: 'TEXT', description: 'Nome do local' },
        { name: 'gerente', type: 'TEXT', description: 'Nome do responsável' }
      ]
    },
    {
      name: 'vendas',
      icon: '🍔',
      columns: [
        { name: 'id', type: 'INTEGER', description: 'ID da venda' },
        { name: 'loja_id', type: 'INTEGER', description: 'Onde ocorreu' },
        { name: 'valor', type: 'DECIMAL', description: 'Valor total da compra' },
        { name: 'metodo_pagamento', type: 'TEXT', description: 'dinheiro, cartao, pix' },
        { name: 'data_hora', type: 'DATETIME', description: 'Quando ocorreu' }
      ]
    }
  ],

  acts: {
    0: {
      label: 'Briefing',
      title: 'Contagem de Vendas',
      narrative: [
        'A contabilidade notou que os depósitos em espécie de uma das lojas despencou.',
        'Use <code>COUNT()</code> para verificar o volume total de vendas agrupado por <code>loja_id</code>.',
        'Vamos checar se a filial suspeita simplesmente teve menos clientes hoje.'
      ]
    },
    1: {
      label: 'Ato I',
      title: 'Receita Total',
      narrative: [
        'O número de pedidos está equilibrado entre as filiais. Todas tiveram 6 vendas registradas nesta janela de tempo.',
        'Agora, use a função <code>SUM()</code> na coluna <code>valor</code> para ver a receita total de cada loja.',
        'O faturamento bate com a expectativa?'
      ]
    },
    2: {
      label: 'Ato II',
      title: 'Onde está o papel?',
      narrative: [
        'O faturamento total também parece normal.',
        'O problema não está no total, mas na forma de pagamento.',
        'Filtre apenas as vendas onde <code>metodo_pagamento = \'dinheiro\'</code> e faça a soma (<code>SUM</code>) agrupando por loja novamente.'
      ]
    },
    3: {
      label: 'Ato III',
      title: 'Bolsos Cheios',
      narrative: [
        'Aí está! A Filial Estação registrou apenas R$ 4,00 em dinheiro vivo o dia todo, enquanto os pagamentos em cartão estão altíssimos.',
        'É impossível uma lanchonete de estação vender tão pouco em espécie.',
        'O gerente está registrando as vendas em dinheiro no sistema, mas embolsando as notas. Faça sua acusação.'
      ]
    }
  },

  evidenceDefinitions: [
    {
      id: 'e_count_vendas',
      name: 'Volume de Pedidos',
      description: 'O número total de pedidos (COUNT) é idêntico em todas as três filiais (6 pedidos cada). O movimento estava normal.',
      icon: '📊',
      act: 1,
      transition: 1,
      detect: (columns, values) => {
        // Did they use COUNT? We can't parse SQL, but we can check if the result has 3 rows and values are like [1, 6], [2, 6], [3, 6]
        if (values.length === 3) {
          const hasSixes = values.every(row => row.some(v => v === 6 || v === '6'));
          return hasSixes;
        }
        return false;
      }
    },
    {
      id: 'e_sum_receita',
      name: 'Faturamento Bruto',
      description: 'O faturamento total (SUM) da Filial Estação está na média (R$ 267,50). Os pedidos não foram apagados do sistema.',
      icon: '💰',
      act: 2,
      transition: 2,
      detect: (columns, values) => {
        if (values.length === 3) {
          // Look for 267.5 (store 3 total)
          const hasStore3Total = values.some(row => row.some(v => v === 267.5 || v === '267.5' || v === 267.50));
          return hasStore3Total;
        }
        return false;
      }
    },
    {
      id: 'e_sum_dinheiro',
      name: 'Desvio de Espécie',
      description: 'O cruzamento de SUM com o filtro "dinheiro" prova que a Filial 3 registrou apenas R$ 4,00 em espécie. Um desvio óbvio.',
      icon: '💸',
      act: 3,
      transition: 3,
      detect: (columns, values) => {
        // Values will have store ID and a small sum for store 3 (4.00)
        // Store 1: 95.50
        // Store 2: 92.00
        // Store 3: 4.00
        return values.some(row => row.some(v => v === 4 || v === '4' || v === 4.0 || v === '4.00'));
      }
    }
  ],

  verdict: {
    suspects: [
      { id: 'roberto', name: 'Roberto Dias', role: 'Gerente Centro', correct: false },
      { id: 'camila', name: 'Camila Martins', role: 'Gerente Shopping', correct: false },
      { id: 'sergio', name: 'Sérgio Nogueira', role: 'Gerente Estação', correct: true }
    ],
    correctText: 'Exato! Sérgio Nogueira registrou os pedidos normalmente para não levantar suspeitas no estoque de ingredientes, mas embolsou todo o dinheiro em espécie pago pelos clientes.',
    wrongText: 'não é o responsável. A discrepância na contabilidade só afetou uma loja específica. Use SUM(valor) filtrando por dinheiro para ver qual gerente furtou.'
  }
};
