export const case06 = {
    id: 'case_06',
    title: 'O Arquivo Replicado',
    briefing: 'Um documento interno apareceu duplicado em outro setor. Descubra quem fez a cópia e para onde ela foi enviada.',
    difficulty: 'Média',

    feedbackConfig: {
        systemName: 'Nexus Docs',
        tableNames: ['documentos', 'envios', 'funcionarios'],
        hints: {
            0: [
                { text: 'Veja quais documentos existem e quem é o dono de cada um.', sql: 'SELECT * FROM documentos' },
                { text: 'Inspecione os envios feitos recentemente.', sql: 'SELECT * FROM envios' }
            ],
            1: [
                { text: 'Cruze envios com funcionários para descobrir quem fez a cópia.', sql: null }
            ]
        }
    },

    schemaDdl: `
    CREATE TABLE funcionarios (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      setor TEXT NOT NULL
    );

    CREATE TABLE documentos (
      id INTEGER PRIMARY KEY,
      titulo TEXT NOT NULL,
      dono_id INTEGER NOT NULL,
      confidencial INTEGER NOT NULL,
      FOREIGN KEY (dono_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE envios (
      id INTEGER PRIMARY KEY,
      funcionario_id INTEGER NOT NULL,
      documento_id INTEGER NOT NULL,
      destino TEXT NOT NULL,
      data_hora DATETIME NOT NULL,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
      FOREIGN KEY (documento_id) REFERENCES documentos(id)
    );
  `,

    seedData: `
    INSERT INTO funcionarios VALUES (1, 'Daniel Rocha', 'Jurídico');
    INSERT INTO funcionarios VALUES (2, 'Marina Costa', 'RH');
    INSERT INTO funcionarios VALUES (3, 'Paulo Vieira', 'TI');

    INSERT INTO documentos VALUES (1, 'Plano de Reestruturação', 1, 1);
    INSERT INTO documentos VALUES (2, 'Lista de Contratações', 2, 0);
    INSERT INTO documentos VALUES (3, 'Relatório Interno', 1, 1);

    INSERT INTO envios VALUES (1, 3, 1, 'backup_externo', '2025-06-03 22:18:00');
    INSERT INTO envios VALUES (2, 2, 2, 'interno', '2025-06-03 10:00:00');
    INSERT INTO envios VALUES (3, 3, 3, 'backup_externo', '2025-06-03 22:20:00');
  `,

    tableInfo: [
        {
            name: 'funcionarios',
            icon: '👤',
            columns: [
                { name: 'id', type: 'INTEGER', description: 'ID do funcionário' },
                { name: 'nome', type: 'TEXT', description: 'Nome da pessoa' },
                { name: 'setor', type: 'TEXT', description: 'Área da empresa' }
            ]
        },
        {
            name: 'documentos',
            icon: '📄',
            columns: [
                { name: 'titulo', type: 'TEXT', description: 'Nome do arquivo' },
                { name: 'dono_id', type: 'INTEGER', description: 'Responsável pelo documento' },
                { name: 'confidencial', type: 'INTEGER', description: '1 = sigiloso' }
            ]
        },
        {
            name: 'envios',
            icon: '📤',
            columns: [
                { name: 'funcionario_id', type: 'INTEGER', description: 'Quem enviou' },
                { name: 'documento_id', type: 'INTEGER', description: 'Qual documento' },
                { name: 'destino', type: 'TEXT', description: 'Para onde foi' },
                { name: 'data_hora', type: 'DATETIME', description: 'Momento do envio' }
            ]
        }
    ],

    acts: {
        0: {
            label: 'Briefing',
            title: 'Cópia Indevida',
            narrative: [
                'Um documento sigiloso apareceu em um backup externo.',
                'Não está claro quem enviou o arquivo.',
                'Você precisa cruzar documentos, envios e funcionários.'
            ]
        },
        1: {
            label: 'Ato I',
            title: 'Primeiro Cruzamento',
            narrative: [
                'O log mostra o documento enviado, mas ainda não diz quem foi a pessoa por trás da ação.',
                'Use a tabela de funcionários para identificar o responsável.'
            ]
        }
    },

    evidenceDefinitions: [
        {
            id: 'e_doc_sigiloso',
            name: 'Documento Sigiloso',
            description: 'O documento “Plano de Reestruturação” é confidencial e pertence ao setor jurídico.',
            icon: '📄',
            act: 0,
            transition: 1,
            detect: (columns, values) => values.some(row => row.some(v => String(v).includes('Plano de Reestruturação')))
        },
        {
            id: 'e_envio_backup',
            name: 'Cópia Externa',
            description: 'O log revela que o arquivo sigiloso foi enviado para backup_externo às 22:18.',
            icon: '📤',
            act: 1,
            transition: 1,
            detect: (columns, values) => values.some(row => row.some(v => String(v).includes('backup_externo')))
        }
    ],

    verdict: {
        suspects: [
            { id: 'daniel', name: 'Daniel Rocha', role: 'Jurídico', correct: false },
            { id: 'marina', name: 'Marina Costa', role: 'RH', correct: false },
            { id: 'paulo', name: 'Paulo Vieira', role: 'TI', correct: true }
        ],
        correctText: 'Correto. Paulo Vieira usou acesso de TI para copiar o documento e enviá-lo para fora da rede.',
        wrongText: 'não é a pessoa correta. O culpado aparece no cruzamento entre envio e funcionário.'
    }
};