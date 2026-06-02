export const case03 = {
  id: 'case_03',
  title: 'O Vazamento VIP',
  briefing: 'A lista de clientes VIP da agência de publicidade "Lumina" vazou para um concorrente. Descubra qual funcionário exportou os dados cruzando as informações de logs, funcionários e departamentos.',
  difficulty: 'Média (Foco em JOIN)',

  feedbackConfig: {
    systemName: 'Lumina DB',
    tableNames: ['funcionarios', 'departamentos', 'logs_exportacao'],
    hints: {
      0: [
        { text: 'A tabela de logs registra quem exportou dados. Veja o que foi exportado recentemente.', sql: "SELECT * FROM logs_exportacao" },
        { text: 'Procure por exportações envolvendo "clientes_vip".', sql: "SELECT * FROM logs_exportacao WHERE tabela_alvo = 'clientes_vip'" }
      ],
      1: [
        { text: 'Você encontrou o ID do funcionário que exportou. Mas qual o nome dele? Use um JOIN.', sql: null },
        { text: 'Junte as tabelas: SELECT * FROM logs_exportacao JOIN funcionarios ON logs_exportacao.funcionario_id = funcionarios.id', sql: null }
      ],
      2: [
        { text: 'Temos o nome e o ID do departamento. De qual departamento ele é? Faça outro JOIN.', sql: null },
        { text: 'Cruze funcionários e departamentos: SELECT f.nome, d.nome as depto FROM funcionarios f JOIN departamentos d ON f.departamento_id = d.id', sql: null }
      ],
      3: [
        { text: 'Você sabe quem vazou os dados e que ele não é do Marketing. Pode fazer a acusação.', sql: null }
      ]
    }
  },

  schemaDdl: `
    CREATE TABLE departamentos (
      id INTEGER PRIMARY KEY,
      nome TEXT,
      andar INTEGER
    );

    CREATE TABLE funcionarios (
      id INTEGER PRIMARY KEY,
      nome TEXT,
      cargo TEXT,
      departamento_id INTEGER,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
    );

    CREATE TABLE logs_exportacao (
      id INTEGER PRIMARY KEY,
      funcionario_id INTEGER,
      tabela_alvo TEXT,
      formato TEXT,
      data_hora DATETIME,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    );
  `,

  seedData: `
    INSERT INTO departamentos VALUES (1, 'Marketing', 2);
    INSERT INTO departamentos VALUES (2, 'Vendas', 3);
    INSERT INTO departamentos VALUES (3, 'TI', 5);
    INSERT INTO departamentos VALUES (4, 'RH', 4);

    INSERT INTO funcionarios VALUES (1, 'Amanda Nunes', 'Gerente de Contas', 2);
    INSERT INTO funcionarios VALUES (2, 'Carlos Silva', 'Analista de Marketing', 1);
    INSERT INTO funcionarios VALUES (3, 'Beatriz Lima', 'Diretora Criativa', 1);
    INSERT INTO funcionarios VALUES (4, 'Rodrigo Tavares', 'Suporte de TI', 3);
    INSERT INTO funcionarios VALUES (5, 'Fernanda Costa', 'Coordenadora de Vendas', 2);
    INSERT INTO funcionarios VALUES (6, 'Marcelo Mendes', 'Engenheiro de Dados', 3);

    INSERT INTO logs_exportacao VALUES (1, 2, 'relatorio_mensal', 'pdf', '2025-05-10 09:15:00');
    INSERT INTO logs_exportacao VALUES (2, 5, 'leads_vendas', 'csv', '2025-05-10 11:30:00');
    INSERT INTO logs_exportacao VALUES (3, 3, 'ativos_campanha', 'zip', '2025-05-11 14:20:00');
    INSERT INTO logs_exportacao VALUES (4, 4, 'clientes_vip', 'csv', '2025-05-11 23:45:00');
    INSERT INTO logs_exportacao VALUES (5, 1, 'metas_q2', 'xlsx', '2025-05-12 08:00:00');
  `,

  tableInfo: [
    {
      name: 'departamentos',
      icon: '🏢',
      columns: [
        { name: 'id', type: 'INTEGER', description: 'ID do departamento' },
        { name: 'nome', type: 'TEXT', description: 'Nome do setor' },
        { name: 'andar', type: 'INTEGER', description: 'Andar no prédio' }
      ]
    },
    {
      name: 'funcionarios',
      icon: '👤',
      columns: [
        { name: 'id', type: 'INTEGER', description: 'ID do funcionário' },
        { name: 'nome', type: 'TEXT', description: 'Nome completo' },
        { name: 'cargo', type: 'TEXT', description: 'Cargo atual' },
        { name: 'departamento_id', type: 'INTEGER', description: 'Chave estrangeira p/ departamentos' }
      ]
    },
    {
      name: 'logs_exportacao',
      icon: '💾',
      columns: [
        { name: 'id', type: 'INTEGER', description: 'ID do log' },
        { name: 'funcionario_id', type: 'INTEGER', description: 'Quem fez a exportação' },
        { name: 'tabela_alvo', type: 'TEXT', description: 'O que foi exportado' },
        { name: 'formato', type: 'TEXT', description: 'csv, pdf, xlsx, etc' },
        { name: 'data_hora', type: 'DATETIME', description: 'Quando ocorreu' }
      ]
    }
  ],

  acts: {
    0: {
      label: 'Briefing',
      title: 'A Lista VIP',
      narrative: [
        'Bom dia, investigador. Temos um vazamento grave na Lumina.',
        'Ontem, um concorrente entrou em contato com nossa lista exclusiva de <i>clientes VIP</i>.',
        'Apenas a equipe de Marketing deveria acessar esses dados. Use o terminal para olhar os <span class="highlight">logs_exportacao</span> e descobrir quem baixou a tabela "clientes_vip".'
      ]
    },
    1: {
      label: 'Ato I',
      title: 'O Exportador',
      narrative: [
        'Excelente. Você localizou o log da exportação ilegal.',
        'Porém, a tabela de logs apenas nos dá o <code>funcionario_id</code>.',
        'Para descobrir quem é a pessoa, você precisará usar um <strong>JOIN</strong> entre <span class="highlight">logs_exportacao</span> e <span class="highlight">funcionarios</span>.'
      ]
    },
    2: {
      label: 'Ato II',
      title: 'Fora do Setor',
      narrative: [
        'Rodrigo Tavares. Ele é o responsável por baixar o arquivo.',
        'A Lumina suspeita que alguém de fora do Marketing conseguiu acesso indevido.',
        'Faça um <strong>JOIN</strong> entre <span class="highlight">funcionarios</span> e <span class="highlight">departamentos</span> para confirmar em qual setor Rodrigo trabalha.'
      ]
    },
    3: {
      label: 'Ato III',
      title: 'Peças Encaixadas',
      narrative: [
        'O setor de TI (Tecnologia da Informação).',
        'Como suporte de TI, Rodrigo usou seus privilégios de administrador na calada da noite (23:45) para burlar as permissões e vender os dados.',
        'Você já tem tudo que precisa. Abra o painel de evidências e faça sua acusação final.'
      ]
    }
  },

  evidenceDefinitions: [
    {
      id: 'e_log_vip',
      name: 'Log de Exportação VIP',
      description: 'O log mostra que a tabela "clientes_vip" foi exportada em CSV pelo funcionário de ID 4 às 23:45.',
      icon: '💾',
      act: 1,
      transition: 1,
      detect: (columns, values) => {
        const hasTabela = columns.map(c => c.toLowerCase()).includes('tabela_alvo');
        if (!hasTabela) return false;
        return values.some(row => row.some(v => String(v).includes('clientes_vip')));
      }
    },
    {
      id: 'e_funcionario_nome',
      name: 'Identidade do Invasor',
      description: 'Ao cruzar o ID 4 com a tabela de funcionários, descobrimos que se trata de Rodrigo Tavares.',
      icon: '🕵️‍♂️',
      act: 2,
      transition: 2,
      detect: (columns, values) => {
        const cols = columns.map(c => c.toLowerCase());
        const hasNome = cols.includes('nome');
        const hasTabela = cols.includes('tabela_alvo') || cols.includes('funcionario_id');
        if (!hasNome || !hasTabela) return false;
        
        return values.some(row => row.some(v => String(v).includes('Rodrigo')));
      }
    },
    {
      id: 'e_departamento_ti',
      name: 'Privilégios de TI',
      description: 'O cruzamento com a tabela de departamentos revela que Rodrigo trabalha no setor de TI, não no Marketing.',
      icon: '🏢',
      act: 3,
      transition: 3,
      detect: (columns, values) => {
        // Must join funcionarios and departamentos, so we expect 'nome' (or dept name) and 'cargo'
        // Just look for a result containing 'Rodrigo Tavares' and 'TI' in the same row
        return values.some(row => {
          const joinedStr = row.join(' ').toLowerCase();
          return joinedStr.includes('rodrigo') && joinedStr.includes('ti');
        });
      }
    }
  ],

  verdict: {
    suspects: [
      { id: 'carlos', name: 'Carlos Silva', role: 'Analista de Marketing', correct: false },
      { id: 'rodrigo', name: 'Rodrigo Tavares', role: 'Suporte de TI', correct: true },
      { id: 'marcelo', name: 'Marcelo Mendes', role: 'Engenheiro de Dados', correct: false }
    ],
    correctText: 'Exatamente. Rodrigo usou seus acessos do suporte de TI tarde da noite para quebrar a hierarquia, roubar a lista de clientes VIP e revendê-la.',
    wrongText: 'não é o responsável. Lembre-se de cruzar os IDs dos logs com os dados dos funcionários corretos.'
  }
};
