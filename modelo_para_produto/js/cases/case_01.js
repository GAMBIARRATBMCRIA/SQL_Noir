import { hasRowContaining, columnsInclude } from '../evidence.js';

export const case01 = {
  id: 'case_01',
  title: 'O Último Commit',
  briefing: 'Daniel Moreira, engenheiro sênior da Nexus Systems, foi encontrado morto. Descubra a verdade cruzando dados de acessos, emails e finanças.',
  difficulty: 'Média',

  feedbackConfig: {
    systemName: 'Nexus Systems',
    tableNames: ['funcionarios', 'registros_acesso', 'emails', 'chamadas', 'transacoes', 'projetos'],
    hints: {
      0: [
        { text: 'Todo caso começa pela vítima. Quem era Daniel Moreira?', sql: "SELECT * FROM funcionarios WHERE nome LIKE '%Daniel%'" },
        { text: 'Explore os dados dos funcionários para conhecer quem trabalhava na Nexus.', sql: 'SELECT * FROM funcionarios' }
      ],
      1: [
        { text: 'Daniel foi encontrado na manhã de sexta-feira, 14 de março. O que aconteceu na noite anterior?', sql: "SELECT * FROM registros_acesso WHERE data_hora >= '2025-03-13 20:00:00'" },
        { text: 'Os registros de acesso mostram quem entrou e saiu do prédio. Verifique a noite do incidente.', sql: null }
      ],
      2: [
        { text: 'Com quem Daniel se comunicava nos últimos dias? Verifique os emails.', sql: null },
        { text: 'As chamadas telefônicas podem revelar conversas tensas. Quem ligou para quem?', sql: null }
      ],
      3: [
        { text: 'Siga o dinheiro. As transações financeiras podem revelar o motivo.', sql: "SELECT * FROM transacoes WHERE descricao LIKE '%Phantom%'" },
        { text: 'Investigue os projetos da empresa. Algum deles parece suspeito?', sql: 'SELECT * FROM projetos' }
      ],
      4: [
        { text: 'Você tem evidências suficientes. Cruze os dados: quem tinha motivo, oportunidade e meios?', sql: null }
      ]
    }
  },

  schemaDdl: `
    CREATE TABLE funcionarios (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      cargo TEXT NOT NULL,
      departamento TEXT NOT NULL,
      data_admissao DATE NOT NULL,
      salario REAL NOT NULL,
      supervisor_id INTEGER,
      email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ativo',
      FOREIGN KEY (supervisor_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE registros_acesso (
      id INTEGER PRIMARY KEY,
      funcionario_id INTEGER NOT NULL,
      local TEXT NOT NULL,
      data_hora DATETIME NOT NULL,
      tipo TEXT NOT NULL,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE emails (
      id INTEGER PRIMARY KEY,
      remetente_id INTEGER NOT NULL,
      destinatario_id INTEGER NOT NULL,
      assunto TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      data_hora DATETIME NOT NULL,
      FOREIGN KEY (remetente_id) REFERENCES funcionarios(id),
      FOREIGN KEY (destinatario_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE chamadas (
      id INTEGER PRIMARY KEY,
      origem_id INTEGER NOT NULL,
      destino_id INTEGER NOT NULL,
      duracao_segundos INTEGER NOT NULL,
      data_hora DATETIME NOT NULL,
      FOREIGN KEY (origem_id) REFERENCES funcionarios(id),
      FOREIGN KEY (destino_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE transacoes (
      id INTEGER PRIMARY KEY,
      funcionario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      valor REAL NOT NULL,
      descricao TEXT NOT NULL,
      data DATE NOT NULL,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE projetos (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      responsavel_id INTEGER NOT NULL,
      orcamento REAL NOT NULL,
      status TEXT NOT NULL,
      data_inicio DATE NOT NULL,
      data_fim DATE,
      FOREIGN KEY (responsavel_id) REFERENCES funcionarios(id)
    );
  `,

  seedData: `
    INSERT INTO funcionarios VALUES (1, 'Daniel Moreira', 'Engenheiro Sênior', 'Engenharia', '2019-03-15', 18500.00, 3, 'daniel.moreira@nexus.com', 'falecido');
    INSERT INTO funcionarios VALUES (2, 'Carla Vasconcelos', 'Diretora de Tecnologia', 'Diretoria', '2015-01-10', 35000.00, NULL, 'carla.vasconcelos@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (3, 'Ricardo Almeida', 'Gerente de Engenharia', 'Engenharia', '2017-06-20', 24000.00, 2, 'ricardo.almeida@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (4, 'Fernanda Costa', 'Engenheira Júnior', 'Engenharia', '2023-08-01', 7500.00, 3, 'fernanda.costa@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (5, 'Marcos Oliveira', 'Diretor Financeiro', 'Financeiro', '2016-02-14', 32000.00, NULL, 'marcos.oliveira@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (6, 'Patrícia Santos', 'Diretora de RH', 'Recursos Humanos', '2018-05-03', 22000.00, NULL, 'patricia.santos@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (7, 'Lucas Ferreira', 'Engenheiro Sênior', 'Engenharia', '2020-01-20', 17000.00, 3, 'lucas.ferreira@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (8, 'Ana Beatriz Lima', 'Analista de Dados', 'Engenharia', '2021-11-10', 12000.00, 3, 'ana.lima@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (9, 'Bruno Takahashi', 'Engenheiro DevOps', 'Engenharia', '2022-03-15', 15000.00, 3, 'bruno.takahashi@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (10, 'Juliana Ribeiro', 'Gerente de Produto', 'Produto', '2019-09-01', 20000.00, 2, 'juliana.ribeiro@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (11, 'Eduardo Nunes', 'Segurança Patrimonial', 'Operações', '2020-07-01', 4500.00, NULL, 'eduardo.nunes@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (12, 'Renata Duarte', 'Analista Financeira', 'Financeiro', '2021-04-18', 9500.00, 5, 'renata.duarte@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (13, 'Thiago Mendes', 'Estagiário de Engenharia', 'Engenharia', '2024-09-01', 2200.00, 7, 'thiago.mendes@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (14, 'Camila Rocha', 'Diretora Jurídica', 'Jurídico', '2017-11-25', 28000.00, NULL, 'camila.rocha@nexus.com', 'ativo');
    INSERT INTO funcionarios VALUES (15, 'Pedro Henrique Silva', 'Diretor Comercial', 'Comercial', '2018-08-12', 26000.00, NULL, 'pedro.silva@nexus.com', 'ativo');

    INSERT INTO projetos VALUES (1, 'Helix', 1, 450000.00, 'ativo', '2024-01-15', '2025-06-30');
    INSERT INTO projetos VALUES (2, 'Phantom', 3, 380000.00, 'ativo', '2024-03-01', '2025-09-30');
    INSERT INTO projetos VALUES (3, 'Aurora', 7, 210000.00, 'concluido', '2023-06-01', '2024-12-15');
    INSERT INTO projetos VALUES (4, 'Vertex', 10, 175000.00, 'ativo', '2024-08-01', '2025-08-01');
    INSERT INTO projetos VALUES (5, 'Sentinel', 9, 95000.00, 'ativo', '2024-11-01', '2025-05-30');

    INSERT INTO registros_acesso VALUES (1, 2, 'Entrada Principal', '2025-03-12 08:15:00', 'entrada');
    INSERT INTO registros_acesso VALUES (2, 5, 'Estacionamento', '2025-03-12 08:30:00', 'entrada');
    INSERT INTO registros_acesso VALUES (3, 4, 'Entrada Principal', '2025-03-12 08:45:00', 'entrada');
    INSERT INTO registros_acesso VALUES (4, 10, 'Entrada Principal', '2025-03-12 09:00:00', 'entrada');
    INSERT INTO registros_acesso VALUES (5, 7, 'Sala de Engenharia - 3º andar', '2025-03-12 09:15:00', 'entrada');
    INSERT INTO registros_acesso VALUES (6, 12, 'Financeiro - 4º andar', '2025-03-12 09:20:00', 'entrada');
    INSERT INTO registros_acesso VALUES (7, 6, 'Recursos Humanos', '2025-03-12 09:30:00', 'entrada');
    INSERT INTO registros_acesso VALUES (8, 1, 'Entrada Principal', '2025-03-12 09:45:00', 'entrada');
    INSERT INTO registros_acesso VALUES (9, 3, 'Entrada Principal', '2025-03-12 10:00:00', 'entrada');
    INSERT INTO registros_acesso VALUES (10, 8, 'Sala de Engenharia - 3º andar', '2025-03-12 10:15:00', 'entrada');
    INSERT INTO registros_acesso VALUES (11, 2, 'Entrada Principal', '2025-03-12 18:00:00', 'saida');
    INSERT INTO registros_acesso VALUES (12, 5, 'Estacionamento', '2025-03-12 18:15:00', 'saida');
    INSERT INTO registros_acesso VALUES (13, 10, 'Entrada Principal', '2025-03-12 18:30:00', 'saida');
    INSERT INTO registros_acesso VALUES (14, 7, 'Sala de Engenharia - 3º andar', '2025-03-12 18:45:00', 'saida');
    INSERT INTO registros_acesso VALUES (15, 6, 'Recursos Humanos', '2025-03-12 19:00:00', 'saida');
    INSERT INTO registros_acesso VALUES (16, 12, 'Financeiro - 4º andar', '2025-03-12 19:15:00', 'saida');
    INSERT INTO registros_acesso VALUES (17, 8, 'Sala de Engenharia - 3º andar', '2025-03-12 19:30:00', 'saida');
    INSERT INTO registros_acesso VALUES (18, 4, 'Entrada Principal', '2025-03-12 19:45:00', 'saida');
    INSERT INTO registros_acesso VALUES (19, 1, 'Entrada Principal', '2025-03-12 20:00:00', 'saida');
    INSERT INTO registros_acesso VALUES (20, 3, 'Entrada Principal', '2025-03-12 20:15:00', 'saida');
    INSERT INTO registros_acesso VALUES (21, 2, 'Entrada Principal', '2025-03-13 08:10:00', 'entrada');
    INSERT INTO registros_acesso VALUES (22, 5, 'Estacionamento', '2025-03-13 08:25:00', 'entrada');
    INSERT INTO registros_acesso VALUES (23, 4, 'Entrada Principal', '2025-03-13 08:40:00', 'entrada');
    INSERT INTO registros_acesso VALUES (24, 10, 'Entrada Principal', '2025-03-13 08:55:00', 'entrada');
    INSERT INTO registros_acesso VALUES (25, 7, 'Sala de Engenharia - 3º andar', '2025-03-13 09:10:00', 'entrada');
    INSERT INTO registros_acesso VALUES (26, 12, 'Financeiro - 4º andar', '2025-03-13 09:20:00', 'entrada');
    INSERT INTO registros_acesso VALUES (27, 6, 'Recursos Humanos', '2025-03-13 09:35:00', 'entrada');
    INSERT INTO registros_acesso VALUES (28, 8, 'Sala de Engenharia - 3º andar', '2025-03-13 09:50:00', 'entrada');
    INSERT INTO registros_acesso VALUES (29, 1, 'Entrada Principal', '2025-03-13 07:45:00', 'entrada');
    INSERT INTO registros_acesso VALUES (30, 1, 'Sala de Engenharia - 3º andar', '2025-03-13 07:50:00', 'entrada');
    INSERT INTO registros_acesso VALUES (31, 3, 'Entrada Principal', '2025-03-13 10:10:00', 'entrada');
    INSERT INTO registros_acesso VALUES (32, 2, 'Entrada Principal', '2025-03-13 18:05:00', 'saida');
    INSERT INTO registros_acesso VALUES (33, 5, 'Estacionamento', '2025-03-13 18:20:00', 'saida');
    INSERT INTO registros_acesso VALUES (34, 10, 'Entrada Principal', '2025-03-13 18:35:00', 'saida');
    INSERT INTO registros_acesso VALUES (35, 7, 'Sala de Engenharia - 3º andar', '2025-03-13 18:50:00', 'saida');
    INSERT INTO registros_acesso VALUES (36, 6, 'Recursos Humanos', '2025-03-13 19:05:00', 'saida');
    INSERT INTO registros_acesso VALUES (37, 12, 'Financeiro - 4º andar', '2025-03-13 19:20:00', 'saida');
    INSERT INTO registros_acesso VALUES (38, 8, 'Sala de Engenharia - 3º andar', '2025-03-13 19:35:00', 'saida');
    INSERT INTO registros_acesso VALUES (39, 4, 'Entrada Principal', '2025-03-13 19:50:00', 'saida');
    INSERT INTO registros_acesso VALUES (40, 3, 'Entrada Principal', '2025-03-13 20:00:00', 'saida');
    INSERT INTO registros_acesso VALUES (42, 3, 'Entrada Principal', '2025-03-13 23:47:00', 'entrada');
    INSERT INTO registros_acesso VALUES (43, 3, 'Sala de Engenharia - 3º andar', '2025-03-13 23:52:00', 'entrada');
    INSERT INTO registros_acesso VALUES (44, 3, 'Sala de Engenharia - 3º andar', '2025-03-14 01:10:00', 'saida');
    INSERT INTO registros_acesso VALUES (45, 3, 'Entrada Principal', '2025-03-14 01:15:00', 'saida');
    INSERT INTO registros_acesso VALUES (46, 11, 'Entrada Principal', '2025-03-14 06:00:00', 'saida');

    INSERT INTO emails VALUES (1, 6, 2, 'Atualização de RH', 'Os novos pacotes de benefícios já estão ativos no portal do colaborador.', '2025-03-10 09:00:00');
    INSERT INTO emails VALUES (2, 10, 1, 'Sprint Review', 'Daniel, a review do projeto Helix está confirmada para sexta-feira às 14h. Por favor prepare os slides.', '2025-03-10 10:15:00');
    INSERT INTO emails VALUES (3, 12, 5, 'Relatório Mensal', 'Marcos, o fechamento contábil de fevereiro está anexo.', '2025-03-10 11:30:00');
    INSERT INTO emails VALUES (4, 4, 3, 'Dúvida sobre PR #402', 'Ricardo, você pode revisar meu pull request quando tiver um tempo? Estou bloqueada nisso.', '2025-03-10 13:45:00');
    INSERT INTO emails VALUES (5, 8, 7, 'Dashboard de Métricas', 'Lucas, o dashboard de telemetria apresentou falhas ontem. Precisamos investigar.', '2025-03-10 14:20:00');
    INSERT INTO emails VALUES (6, 15, 2, 'Novos Contratos', 'Temos três novos clientes fechados esta semana no setor varejista. A equipe comercial está voando!', '2025-03-10 15:10:00');
    INSERT INTO emails VALUES (7, 1, 3, 'Orçamento do Projeto Phantom', 'Ricardo, estive analisando os relatórios financeiros que a Renata compartilhou na reunião de ontem. O projeto Phantom tem um orçamento de R$ 380.000, mas não encontro nenhum entregável, nenhum commit, nenhuma documentação. Pode me explicar?', '2025-03-10 16:30:00');
    INSERT INTO emails VALUES (8, 2, 6, 'Aprovação de Vagas', 'Autorizo a abertura de mais 2 vagas para Engenharia Sênior no Q2.', '2025-03-11 10:00:00');
    INSERT INTO emails VALUES (9, 1, 3, 'Re: Re: Orçamento do Projeto Phantom', 'Confidencial ou não, os números não fecham. Vi transferências de R$ 87.000 para "consultoria externa" sem nenhum contrato registrado. Além de três reembolsos em seu nome que somam R$ 23.500 vinculados ao Phantom. Isso não vai ficar assim, Ricardo.', '2025-03-12 11:45:00');
    INSERT INTO emails VALUES (10, 14, 5, 'Revisão Contratual', 'Precisamos revisar as cláusulas de rescisão com os fornecedores de nuvem. O jurídico encontrou brechas.', '2025-03-12 14:30:00');
    INSERT INTO emails VALUES (11, 7, 9, 'Deploy falhou', 'Bruno, a pipeline quebrou no ambiente de staging. Consegue olhar os logs?', '2025-03-12 16:10:00');
    INSERT INTO emails VALUES (12, 13, 4, 'Almoço?', 'Galera, alguém anima ir no japa hoje?', '2025-03-13 11:45:00');
    INSERT INTO emails VALUES (13, 10, 15, 'Feedback do Cliente', 'O cliente adorou a nova feature do Vertex. Bom trabalho na venda.', '2025-03-13 14:00:00');
    INSERT INTO emails VALUES (20, 1, 1, 'Notas pessoais - NÃO DELETAR', 'Registrando: encontrei irregularidades graves no Projeto Phantom. R$ 87.000 em transferências sem contrato. R$ 23.500 em reembolsos para Ricardo Almeida sem comprovantes. Projeto não tem nenhum entregável real. Vou reportar à diretoria na segunda-feira.', '2025-03-13 17:00:00');

    INSERT INTO chamadas VALUES (1, 2, 5, 300, '2025-03-11 09:15:00');
    INSERT INTO chamadas VALUES (2, 7, 8, 120, '2025-03-11 11:20:00');
    INSERT INTO chamadas VALUES (3, 10, 1, 450, '2025-03-11 14:00:00');
    INSERT INTO chamadas VALUES (4, 4, 3, 180, '2025-03-12 10:30:00');
    INSERT INTO chamadas VALUES (5, 6, 2, 240, '2025-03-12 15:45:00');
    INSERT INTO chamadas VALUES (6, 3, 1, 540, '2025-03-12 18:30:00');
    INSERT INTO chamadas VALUES (7, 3, 5, 420, '2025-03-12 13:00:00');
    INSERT INTO chamadas VALUES (8, 12, 5, 360, '2025-03-13 09:00:00');
    INSERT INTO chamadas VALUES (9, 3, 1, 180, '2025-03-13 22:15:00');
    INSERT INTO chamadas VALUES (10, 3, 5, 195, '2025-03-14 01:32:00');
    INSERT INTO chamadas VALUES (11, 11, 2, 60, '2025-03-14 06:15:00');

    INSERT INTO transacoes VALUES (1, 1, 'salario', 18500.00, 'Salário - Fevereiro 2025', '2025-03-05');
    INSERT INTO transacoes VALUES (2, 2, 'salario', 35000.00, 'Salário - Fevereiro 2025', '2025-03-05');
    INSERT INTO transacoes VALUES (3, 3, 'salario', 24000.00, 'Salário - Fevereiro 2025', '2025-03-05');
    INSERT INTO transacoes VALUES (4, 4, 'salario', 7500.00, 'Salário - Fevereiro 2025', '2025-03-05');
    INSERT INTO transacoes VALUES (5, 5, 'salario', 32000.00, 'Salário - Fevereiro 2025', '2025-03-05');
    INSERT INTO transacoes VALUES (6, 1, 'reembolso', 450.00, 'Almoço com cliente - Projeto Helix', '2025-03-08');
    INSERT INTO transacoes VALUES (7, 7, 'reembolso', 120.00, 'Transporte - Reunião externa', '2025-03-09');
    INSERT INTO transacoes VALUES (8, 10, 'reembolso', 890.00, 'Licença de software - Vertex', '2025-03-10');
    INSERT INTO transacoes VALUES (9, 3, 'transferencia', 45000.00, 'Consultoria externa - Projeto Phantom', '2024-06-15');
    INSERT INTO transacoes VALUES (10, 3, 'transferencia', 42000.00, 'Consultoria especializada - Projeto Phantom', '2024-09-20');
    INSERT INTO transacoes VALUES (11, 3, 'reembolso', 8500.00, 'Viagem técnica - Projeto Phantom', '2024-10-10');
    INSERT INTO transacoes VALUES (12, 3, 'reembolso', 7200.00, 'Equipamentos - Projeto Phantom', '2024-12-05');
  `,

  tableInfo: [
    {
      name: 'funcionarios',
      icon: '👤',
      columns: [
        { name: 'id', type: 'INTEGER', description: 'Identificador único' },
        { name: 'nome', type: 'TEXT', description: 'Nome completo' },
        { name: 'cargo', type: 'TEXT', description: 'Cargo na empresa' },
        { name: 'departamento', type: 'TEXT', description: 'Departamento' },
        { name: 'email', type: 'TEXT', description: 'Email corporativo' },
      ]
    },
    {
      name: 'registros_acesso',
      icon: '🚪',
      columns: [
        { name: 'id', type: 'INTEGER', description: 'Identificador único' },
        { name: 'funcionario_id', type: 'INTEGER', description: 'FK → funcionarios.id' },
        { name: 'local', type: 'TEXT', description: 'Sala / andar / área' },
        { name: 'data_hora', type: 'DATETIME', description: 'Data e hora do acesso' },
        { name: 'tipo', type: 'TEXT', description: 'entrada / saída' },
      ]
    },
    {
      name: 'emails',
      icon: '📧',
      columns: [
        { name: 'remetente_id', type: 'INTEGER', description: 'FK' },
        { name: 'destinatario_id', type: 'INTEGER', description: 'FK' },
        { name: 'assunto', type: 'TEXT', description: 'Assunto do email' },
        { name: 'conteudo', type: 'TEXT', description: 'Corpo da mensagem' },
      ]
    },
    {
      name: 'chamadas',
      icon: '📞',
      columns: [
        { name: 'origem_id', type: 'INTEGER', description: 'FK' },
        { name: 'destino_id', type: 'INTEGER', description: 'FK' },
        { name: 'duracao_segundos', type: 'INTEGER', description: 'Duração em segundos' },
        { name: 'data_hora', type: 'DATETIME', description: 'Data e hora da chamada' },
      ]
    },
    {
      name: 'transacoes',
      icon: '💰',
      columns: [
        { name: 'funcionario_id', type: 'INTEGER', description: 'FK' },
        { name: 'tipo', type: 'TEXT', description: 'tipo' },
        { name: 'valor', type: 'REAL', description: 'Valor em R$' },
        { name: 'descricao', type: 'TEXT', description: 'Detalhes da transação' },
      ]
    },
    {
      name: 'projetos',
      icon: '📁',
      columns: [
        { name: 'nome', type: 'TEXT', description: 'Nome do projeto' },
        { name: 'responsavel_id', type: 'INTEGER', description: 'FK' },
        { name: 'orcamento', type: 'REAL', description: 'Orçamento alocado (R$)' },
      ]
    }
  ],

  acts: {
    0: {
      label: 'Briefing',
      title: 'O Caso',
      narrative: [
        'Você é um analista forense digital contratado pela seguradora da Nexus Systems.',
        'Daniel Moreira, engenheiro sênior, foi encontrado morto em sua estação de trabalho na manhã de sexta-feira, 14 de março de 2025.',
        'A polícia classificou como causa natural. A seguradora discorda.',
        'Você tem acesso total ao banco de dados corporativo da Nexus. Use-o.',
        '<strong>Comece investigando a vítima.</strong>'
      ]
    },
    1: {
      label: 'Ato I',
      title: 'Quem era Daniel Moreira?',
      narrative: [
        'Daniel Moreira, 34 anos. Engenheiro sênior no departamento de Engenharia.',
        'Trabalhava na Nexus desde 2019. Responsável pelo <strong>Projeto Helix</strong>, o principal produto da empresa.',
        'Salário de R$ 18.500 — compatível com o cargo. Subordinado a Ricardo Almeida, gerente de engenharia.',
        'Colegas descrevem Daniel como meticuloso. Ele frequentemente trabalhava até tarde.',
        '<strong>O que aconteceu na noite em que ele morreu?</strong>'
      ]
    },
    2: {
      label: 'Ato II',
      title: 'A Noite do Incidente',
      narrative: [
        'Os registros de acesso revelam a movimentação daquela noite.',
        'Daniel entrou no prédio às <strong>07:45</strong> do dia 13 e nunca registrou saída.',
        'Eduardo Nunes, segurança patrimonial, iniciou o turno noturno às <strong>22:00</strong>.',
        'Mas o dado mais perturbador: <strong>Ricardo Almeida</strong> — o supervisor de Daniel — entrou no prédio às <strong>23:47</strong> e saiu às <strong>01:15</strong>.',
        'O que o gerente de engenharia fazia no escritório quase à meia-noite?',
        '<strong>Investigue as comunicações entre eles.</strong>'
      ]
    },
    3: {
      label: 'Ato III',
      title: 'Conexões Perigosas',
      narrative: [
        'Os emails revelam uma escalada de tensão.',
        'Daniel havia descoberto irregularidades no <strong>Projeto Phantom</strong> — um projeto sob responsabilidade direta de Ricardo.',
        'No dia 12 de março, Daniel escreveu: <em>"Isso não vai ficar assim, Ricardo."</em>',
        'Uma ligação de 9 minutos entre os dois aconteceu na noite do dia 12.',
        'E na madrugada do dia 14, às <strong>01:32</strong> — apenas 17 minutos após sair do prédio — Ricardo ligou para <strong>Marcos Oliveira</strong>, o diretor financeiro.',
        'Por que ligar para o CFO de madrugada?',
        '<strong>Siga o dinheiro.</strong>'
      ]
    },
    4: {
      label: 'Ato IV',
      title: 'Siga o Dinheiro',
      narrative: [
        'O Projeto Phantom é uma fraude.',
        'R$ 380.000 em orçamento alocado. Zero entregáveis. Nenhum repositório de código. Nenhum servidor.',
        'Mais de <strong>R$ 167.500</strong> em transferências e reembolsos — todos vinculados a Ricardo Almeida.',
        '"Consultoria externa" sem contrato. "Viagem técnica" sem comprovante. "Treinamento especializado" sem certificado.',
        'Daniel descobriu tudo. Documentou as evidências em um email para si mesmo e planejava reportar à diretoria na segunda-feira.',
        'Ele não chegou até segunda-feira.',
        '<strong>Você tem todas as evidências. Está pronto para fazer a acusação?</strong>'
      ]
    }
  },

  evidenceNarratives: {
    perfil_daniel: { text: 'Perfil da vítima identificado nos registros da empresa.', transition: 1 },
    projeto_helix: { text: 'Projeto Helix confirmado — Daniel era o responsável técnico principal.', transition: null },
    acesso_noturno: { text: 'Registros de acesso noturno recuperados do sistema de catracas.', transition: 2 },
    ricardo_no_predio: { text: 'Presença de Ricardo Almeida confirmada no prédio durante a madrugada.', transition: null },
    email_ameaca: { text: 'Email confrontador encontrado: Daniel sabia de algo e não pretendia calar.', transition: 3 },
    chamada_madrugada: { text: 'Chamada de madrugada registrada entre Ricardo e o diretor financeiro.', transition: null },
    transacoes_phantom: { text: 'Fluxo financeiro irregular detectado nas transações do Projeto Phantom.', transition: 4 },
    projeto_fantasma: { text: 'Projeto Phantom confirmado como fachada — sem nenhum entregável real.', transition: null },
    backup_daniel: { text: 'Notas pessoais de Daniel recuperadas. Ele documentou tudo antes de morrer.', transition: null }
  },

  evidenceDefinitions: [
    {
      id: 'perfil_daniel',
      act: 1,
      icon: '👤',
      name: 'Perfil da Vítima',
      description: 'Daniel Moreira, Engenheiro Sênior da Nexus Systems. Status: falecido.',
      narrativeUnlock: 'perfil_daniel',
      detect: (columns, values) => hasRowContaining(values, columns, 'nome', 'Daniel Moreira')
    },
    {
      id: 'projeto_helix',
      act: 1,
      icon: '📁',
      name: 'Projeto Helix',
      description: 'Daniel era responsável pelo Projeto Helix, com orçamento de R$ 450.000.',
      narrativeUnlock: 'projeto_helix',
      detect: (columns, values) => hasRowContaining(values, columns, 'nome', 'Helix') && columnsInclude(columns, ['orcamento', 'responsavel_id'])
    },
    {
      id: 'acesso_noturno',
      act: 2,
      icon: '🌙',
      name: 'Acessos Noturnos',
      description: 'Na noite de 13 de março, três pessoas estavam no prédio: Daniel, Ricardo e Eduardo (segurança).',
      narrativeUnlock: 'acesso_noturno',
      detect: (columns, values) => {
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
        if (!columnsInclude(columns, ['data_hora'])) return false;
        const dateColIdx = columns.indexOf('data_hora');
        return values.some(row => String(row[dateColIdx]).includes('2025-03-13 23:47'));
      }
    },
    {
      id: 'email_ameaca',
      act: 3,
      icon: '📧',
      name: 'Email Ameaçador',
      description: '"Isso não vai ficar assim, Ricardo." — Daniel descobriu algo e estava furioso.',
      narrativeUnlock: 'email_ameaca',
      detect: (columns, values) => values.some(row => row.some(cell => String(cell).includes('Isso não vai ficar assim')))
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
        return values.some(row => String(row[dateColIdx]).includes('2025-03-14 01:32'));
      }
    },
    {
      id: 'transacoes_phantom',
      act: 4,
      icon: '💰',
      name: 'Dinheiro Fantasma',
      description: 'Mais de R$ 167.500 em transferências e reembolsos vinculados ao Projeto Phantom.',
      narrativeUnlock: 'transacoes_phantom',
      detect: (columns, values) => values.some(row => row.some(cell => String(cell).toLowerCase().includes('phantom'))) && columnsInclude(columns, ['valor'])
    },
    {
      id: 'projeto_fantasma',
      act: 4,
      icon: '👻',
      name: 'O Projeto Fantasma',
      description: 'O Projeto Phantom tem orçamento de R$ 380.000 mas nenhum entregável.',
      narrativeUnlock: 'projeto_fantasma',
      detect: (columns, values) => hasRowContaining(values, columns, 'nome', 'Phantom') && columnsInclude(columns, ['orcamento'])
    },
    {
      id: 'backup_daniel',
      act: 4,
      icon: '📝',
      name: 'Notas de Daniel',
      description: 'Daniel enviou um email para si mesmo documentando as irregularidades.',
      narrativeUnlock: 'backup_daniel',
      detect: (columns, values) => values.some(row => row.some(cell => String(cell).includes('NÃO DELETAR') || String(cell).includes('irregularidades graves')))
    }
  ],

  verdict: {
    suspects: [
      { id: 3, name: 'Ricardo Almeida', role: 'Gerente de Engenharia', correct: true },
      { id: 5, name: 'Marcos Oliveira', role: 'Diretor Financeiro', correct: false },
      { id: 7, name: 'Lucas Ferreira', role: 'Engenheiro Sênior', correct: false },
      { id: 11, name: 'Eduardo Nunes', role: 'Segurança Patrimonial', correct: false },
    ],
    correctText: '<p><strong>Ricardo Almeida</strong> é o responsável. Ele criou o Projeto Phantom para desviar dinheiro e matou Daniel para silenciá-lo.</p>',
    wrongText: 'não é o responsável. Revise as evidências com cuidado.'
  }
};
