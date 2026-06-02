export const meuNovoCaso = {
    // 1. METADADOS DO HUB
    id: 'meu_novo_caso', // ID único do caso
    title: 'Título do Caso', // Nome que aparece no Hub e no Cabeçalho
    briefing: 'Resumo da história para o card de seleção.',
    difficulty: 'Fácil / Média / Difícil',

    // 2. CONFIGURAÇÃO DE FEEDBACK (Dicas e Erros)
    feedbackConfig: {
        systemName: 'Nome do Banco Fictício',
        tableNames: ['tabela_1', 'tabela_2'],
        hints: {
            0: [ // Dicas para o Ato 0
                { text: 'Dica de texto', sql: 'SELECT * FROM tabela_1' }
            ],
            1: [ // Dicas para o Ato 1
                { text: 'Dica sem SQL', sql: null }
            ]
        }
    },

    // 3. BANCO DE DADOS EM MEMÓRIA
    schemaDdl: `
    CREATE TABLE tabela_1 ( id INTEGER, nome TEXT );
  `,
    seedData: `
    INSERT INTO tabela_1 VALUES (1, 'Exemplo');
  `,

    // 4. BARRA DE EXPLORAÇÃO DE TABELAS (Rodapé)
    tableInfo: [
        {
            name: 'tabela_1',
            icon: '📁',
            columns: [
                { name: 'id', type: 'INTEGER', description: 'O ID' },
                { name: 'nome', type: 'TEXT', description: 'O Nome' }
            ]
        }
    ],

    // 5. NARRATIVA E PROGRESSÃO (Painel da Esquerda)
    acts: {
        0: {
            label: 'Briefing',
            title: 'A Introdução',
            narrative: [
                'Parágrafo 1 do texto.',
                'Parágrafo 2 do texto.'
            ]
        },
        1: {
            label: 'Ato I',
            title: 'A Descoberta',
            narrative: ['Texto do próximo ato...']
        }
    },

    // 6. MOTOR DE EVIDÊNCIAS
    evidenceDefinitions: [
        {
            id: 'evidencia_01',
            name: 'Nome da Pista',
            description: 'Texto que vai para o Painel de Evidências quando encontrada.',
            icon: '🔍',
            act: 1,           // Em qual ato esta evidência pode ser descoberta
            transition: 1,    // Para qual ato o jogo avança ao achar isso (ou null)

            // A MÁGICA: A função que analisa a Tabela de Resultados do Terminal
            detect: (columns, values) => {
                // columns = ['id', 'nome']
                // values = [[1, 'Exemplo'], [2, 'Outro']]

                // Exemplo: O jogador encontrou a evidência se a tabela de resultados
                // tiver a palavra 'Exemplo' em alguma célula.
                return values.some(row => row.some(v => String(v).includes('Exemplo')));
            }
        }
    ],

    // 7. TELA FINAL DE ACUSAÇÃO
    verdict: {
        suspects: [
            { id: 'suspeito1', name: 'João', role: 'Gerente', correct: false },
            { id: 'suspeito2', name: 'Maria', role: 'Diretora', correct: true }
        ],
        correctText: 'Você acertou! Maria era a culpada por...',
        wrongText: 'não é a pessoa que estamos procurando.' // Completa a frase: "João [wrongText]"
    }
};
