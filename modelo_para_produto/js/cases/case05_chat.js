export const case05 = {
    id: 'case_05',
    title: 'O Plantão Fantasma',
    briefing: 'Um laboratório afirma que ninguém entrou após o expediente, mas os registros contam outra história. Descubra quem estava no prédio fora do horário permitido.',
    difficulty: 'Fácil',

    feedbackConfig: {
        systemName: 'Atlas Lab',
        tableNames: ['funcionarios', 'acessos', 'plantoes'],
        hints: {
            0: [
                { text: 'Comece olhando quem estava escalado para o plantão.', sql: 'SELECT * FROM plantoes' },
                { text: 'Veja os acessos registrados na noite do incidente.', sql: 'SELECT * FROM acessos' }
            ],
            1: [
                { text: 'Compare o horário do acesso com a escala.', sql: null }
            ]
        }
    },

    schemaDdl: `
    CREATE TABLE funcionarios (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      cargo TEXT NOT NULL
    );

    CREATE TABLE plantoes (
      id INTEGER PRIMARY KEY,
      funcionario_id INTEGER NOT NULL,
      data DATE NOT NULL,
      inicio TEXT NOT NULL,
      fim TEXT NOT NULL,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE acessos (
      id INTEGER PRIMARY KEY,
      funcionario_id INTEGER NOT NULL,
      data_hora DATETIME NOT NULL,
      local TEXT NOT NULL,
      tipo TEXT NOT NULL,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    );
  `,

    seedData: `
    INSERT INTO funcionarios VALUES (1, 'Ana Lima', 'Pesquisadora');
    INSERT INTO funcionarios VALUES (2, 'Bruno Salles', 'Técnico');
    INSERT INTO funcionarios VALUES (3, 'Carla Moraes', 'Supervisora');

    INSERT INTO plantoes VALUES (1, 2, '2025-06-01', '18:00', '23:00');
    INSERT INTO plantoes VALUES (2, 3, '2025-06-01', '23:00', '06:00');

    INSERT INTO acessos VALUES (1, 1, '2025-06-01 17:45:00', 'Portaria', 'entrada');
    INSERT INTO acessos VALUES (2, 2, '2025-06-01 23:41:00', 'Portaria', 'entrada');
    INSERT INTO acessos VALUES (3, 2, '2025-06-02 00:10:00', 'Laboratório', 'entrada');
  `,

    tableInfo: [
        {
            name: 'funcionarios',
            icon: '👤',
            columns: [
                { name: 'id', type: 'INTEGER', description: 'ID da pessoa' },
                { name: 'nome', type: 'TEXT', description: 'Nome do funcionário' },
                { name: 'cargo', type: 'TEXT', description: 'Função na equipe' }
            ]
        },
        {
            name: 'plantoes',
            icon: '🕒',
            columns: [
                { name: 'funcionario_id', type: 'INTEGER', description: 'Quem estava escalado' },
                { name: 'data', type: 'DATE', description: 'Data do plantão' },
                { name: 'inicio', type: 'TEXT', description: 'Início do turno' },
                { name: 'fim', type: 'TEXT', description: 'Fim do turno' }
            ]
        },
        {
            name: 'acessos',
            icon: '🚪',
            columns: [
                { name: 'funcionario_id', type: 'INTEGER', description: 'Quem acessou' },
                { name: 'data_hora', type: 'DATETIME', description: 'Quando ocorreu' },
                { name: 'local', type: 'TEXT', description: 'Onde foi o acesso' },
                { name: 'tipo', type: 'TEXT', description: 'Entrada ou saída' }
            ]
        }
    ],

    acts: {
        0: {
            label: 'Briefing',
            title: 'O expediente terminou',
            narrative: [
                'A direção disse que o laboratório ficou vazio após as 23h.',
                'Mas um registro de acesso sugere outra coisa.',
                'Descubra quem permaneceu no prédio fora do horário.'
            ]
        },
        1: {
            label: 'Ato I',
            title: 'Escala de plantão',
            narrative: [
                'A escala mostra quem deveria estar presente.',
                'Agora confira os acessos reais e veja se os horários batem.'
            ]
        }
    },

    evidenceDefinitions: [
        {
            id: 'e_plantoes',
            name: 'Escala Confirmada',
            description: 'O turno escalado mostra que Bruno estava de plantão até 23h.',
            icon: '🕒',
            act: 0,
            transition: 1,
            detect: (columns, values) => values.some(row => row.some(v => String(v).includes('Bruno Salles')))
        },
        {
            id: 'e_acesso_noturno',
            name: 'Acesso Fora do Horário',
            description: 'Bruno apareceu em um acesso às 23:41, fora da rotina normal da equipe.',
            icon: '🚨',
            act: 1,
            transition: 1,
            detect: (columns, values) => values.some(row => row.some(v => String(v).includes('23:41')))
        }
    ],

    verdict: {
        suspects: [
            { id: 'ana', name: 'Ana Lima', role: 'Pesquisadora', correct: false },
            { id: 'bruno', name: 'Bruno Salles', role: 'Técnico', correct: true },
            { id: 'carla', name: 'Carla Moraes', role: 'Supervisora', correct: false }
        ],
        correctText: 'Você acertou. Bruno estava no prédio fora do horário e o registro confirma a inconsistência.',
        wrongText: 'não é a pessoa que estamos procurando. O horário do acesso é a pista principal.'
    }
};