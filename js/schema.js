// ========================================
// SQL Noir — Schema & Case Data
// All tables, relationships, and the mystery data
// ========================================

// The Case: "O Último Commit"
// Daniel Moreira, senior engineer at Nexus Systems, found dead at his workstation.
// The truth: Ricardo Almeida (his manager) was embezzling money through a fake project
// called "Phantom". Daniel discovered the fraud and confronted Ricardo.
// Ricardo came to the office late at night and killed Daniel.

export const SCHEMA_DDL = `
  -- Funcionários da Nexus Systems
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

  -- Registros de acesso (catracas e portas)
  CREATE TABLE registros_acesso (
    id INTEGER PRIMARY KEY,
    funcionario_id INTEGER NOT NULL,
    local TEXT NOT NULL,
    data_hora DATETIME NOT NULL,
    tipo TEXT NOT NULL,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
  );

  -- Emails corporativos
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

  -- Registro de chamadas telefônicas
  CREATE TABLE chamadas (
    id INTEGER PRIMARY KEY,
    origem_id INTEGER NOT NULL,
    destino_id INTEGER NOT NULL,
    duracao_segundos INTEGER NOT NULL,
    data_hora DATETIME NOT NULL,
    FOREIGN KEY (origem_id) REFERENCES funcionarios(id),
    FOREIGN KEY (destino_id) REFERENCES funcionarios(id)
  );

  -- Transações financeiras
  CREATE TABLE transacoes (
    id INTEGER PRIMARY KEY,
    funcionario_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    descricao TEXT NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
  );

  -- Projetos da empresa
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
`;

export const SEED_DATA = `
  -- ============================================
  -- FUNCIONÁRIOS (15 pessoas)
  -- ============================================
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

  -- ============================================
  -- PROJETOS (5 projetos)
  -- ============================================
  INSERT INTO projetos VALUES (1, 'Helix', 1, 450000.00, 'ativo', '2024-01-15', '2025-06-30');
  INSERT INTO projetos VALUES (2, 'Phantom', 3, 380000.00, 'ativo', '2024-03-01', '2025-09-30');
  INSERT INTO projetos VALUES (3, 'Aurora', 7, 210000.00, 'concluido', '2023-06-01', '2024-12-15');
  INSERT INTO projetos VALUES (4, 'Vertex', 10, 175000.00, 'ativo', '2024-08-01', '2025-08-01');
  INSERT INTO projetos VALUES (5, 'Sentinel', 9, 95000.00, 'ativo', '2024-11-01', '2025-05-30');

  -- ============================================
  -- REGISTROS DE ACESSO
  -- Foco: semana de 10 a 14 de março de 2025
  -- A noite crítica: 13-14 de março
  -- ============================================
  
  -- === Dia 10 (segunda) - normal ===
  INSERT INTO registros_acesso VALUES (1, 1, 'Entrada Principal', '2025-03-10 08:15:00', 'entrada');
  INSERT INTO registros_acesso VALUES (2, 1, 'Sala de Engenharia - 3º andar', '2025-03-10 08:18:00', 'entrada');
  INSERT INTO registros_acesso VALUES (3, 3, 'Entrada Principal', '2025-03-10 09:02:00', 'entrada');
  INSERT INTO registros_acesso VALUES (4, 4, 'Entrada Principal', '2025-03-10 08:45:00', 'entrada');
  INSERT INTO registros_acesso VALUES (5, 7, 'Entrada Principal', '2025-03-10 08:30:00', 'entrada');
  INSERT INTO registros_acesso VALUES (6, 8, 'Entrada Principal', '2025-03-10 09:10:00', 'entrada');
  INSERT INTO registros_acesso VALUES (7, 1, 'Sala de Engenharia - 3º andar', '2025-03-10 18:30:00', 'saida');
  INSERT INTO registros_acesso VALUES (8, 1, 'Entrada Principal', '2025-03-10 18:35:00', 'saida');
  INSERT INTO registros_acesso VALUES (9, 3, 'Entrada Principal', '2025-03-10 17:50:00', 'saida');
  INSERT INTO registros_acesso VALUES (10, 4, 'Entrada Principal', '2025-03-10 18:10:00', 'saida');

  -- === Dia 11 (terça) ===
  INSERT INTO registros_acesso VALUES (11, 1, 'Entrada Principal', '2025-03-11 07:50:00', 'entrada');
  INSERT INTO registros_acesso VALUES (12, 1, 'Sala de Engenharia - 3º andar', '2025-03-11 07:55:00', 'entrada');
  INSERT INTO registros_acesso VALUES (13, 3, 'Entrada Principal', '2025-03-11 08:55:00', 'entrada');
  INSERT INTO registros_acesso VALUES (14, 3, 'Sala de Reuniões - 2º andar', '2025-03-11 14:00:00', 'entrada');
  INSERT INTO registros_acesso VALUES (15, 5, 'Entrada Principal', '2025-03-11 09:00:00', 'entrada');
  INSERT INTO registros_acesso VALUES (16, 12, 'Entrada Principal', '2025-03-11 08:40:00', 'entrada');
  INSERT INTO registros_acesso VALUES (17, 1, 'Sala de Engenharia - 3º andar', '2025-03-11 20:15:00', 'saida');
  INSERT INTO registros_acesso VALUES (18, 1, 'Entrada Principal', '2025-03-11 20:20:00', 'saida');
  INSERT INTO registros_acesso VALUES (19, 3, 'Entrada Principal', '2025-03-11 18:00:00', 'saida');

  -- === Dia 12 (quarta) ===
  INSERT INTO registros_acesso VALUES (20, 1, 'Entrada Principal', '2025-03-12 08:00:00', 'entrada');
  INSERT INTO registros_acesso VALUES (21, 1, 'Sala de Engenharia - 3º andar', '2025-03-12 08:05:00', 'entrada');
  INSERT INTO registros_acesso VALUES (22, 3, 'Entrada Principal', '2025-03-12 09:15:00', 'entrada');
  INSERT INTO registros_acesso VALUES (23, 4, 'Entrada Principal', '2025-03-12 08:50:00', 'entrada');
  INSERT INTO registros_acesso VALUES (24, 7, 'Entrada Principal', '2025-03-12 08:35:00', 'entrada');
  INSERT INTO registros_acesso VALUES (25, 9, 'Entrada Principal', '2025-03-12 08:20:00', 'entrada');
  INSERT INTO registros_acesso VALUES (26, 1, 'Sala de Engenharia - 3º andar', '2025-03-12 21:00:00', 'saida');
  INSERT INTO registros_acesso VALUES (27, 1, 'Entrada Principal', '2025-03-12 21:05:00', 'saida');
  INSERT INTO registros_acesso VALUES (28, 3, 'Entrada Principal', '2025-03-12 17:30:00', 'saida');

  -- === Dia 13 (quinta) - DIA CRÍTICO ===
  INSERT INTO registros_acesso VALUES (29, 1, 'Entrada Principal', '2025-03-13 07:45:00', 'entrada');
  INSERT INTO registros_acesso VALUES (30, 1, 'Sala de Engenharia - 3º andar', '2025-03-13 07:50:00', 'entrada');
  INSERT INTO registros_acesso VALUES (31, 3, 'Entrada Principal', '2025-03-13 09:00:00', 'entrada');
  INSERT INTO registros_acesso VALUES (32, 3, 'Entrada Principal', '2025-03-13 17:45:00', 'saida');
  INSERT INTO registros_acesso VALUES (33, 4, 'Entrada Principal', '2025-03-13 08:30:00', 'entrada');
  INSERT INTO registros_acesso VALUES (34, 4, 'Entrada Principal', '2025-03-13 18:00:00', 'saida');
  INSERT INTO registros_acesso VALUES (35, 7, 'Entrada Principal', '2025-03-13 08:40:00', 'entrada');
  INSERT INTO registros_acesso VALUES (36, 7, 'Entrada Principal', '2025-03-13 18:15:00', 'saida');
  INSERT INTO registros_acesso VALUES (37, 11, 'Entrada Principal', '2025-03-13 22:00:00', 'entrada');
  INSERT INTO registros_acesso VALUES (38, 9, 'Entrada Principal', '2025-03-13 08:20:00', 'entrada');
  INSERT INTO registros_acesso VALUES (39, 9, 'Entrada Principal', '2025-03-13 18:30:00', 'saida');
  INSERT INTO registros_acesso VALUES (40, 13, 'Entrada Principal', '2025-03-13 09:00:00', 'entrada');
  INSERT INTO registros_acesso VALUES (41, 13, 'Entrada Principal', '2025-03-13 16:00:00', 'saida');

  -- === NOITE CRÍTICA: 13-14 de março ===
  -- Daniel ficou trabalhando até tarde (comum para ele)
  -- Ricardo voltou ao prédio às 23:47 (SUSPEITO)
  -- Eduardo (segurança) em turno noturno
  INSERT INTO registros_acesso VALUES (42, 3, 'Entrada Principal', '2025-03-13 23:47:00', 'entrada');
  INSERT INTO registros_acesso VALUES (43, 3, 'Sala de Engenharia - 3º andar', '2025-03-13 23:52:00', 'entrada');
  INSERT INTO registros_acesso VALUES (44, 3, 'Sala de Engenharia - 3º andar', '2025-03-14 01:10:00', 'saida');
  INSERT INTO registros_acesso VALUES (45, 3, 'Entrada Principal', '2025-03-14 01:15:00', 'saida');
  INSERT INTO registros_acesso VALUES (46, 11, 'Entrada Principal', '2025-03-14 06:00:00', 'saida');

  -- Daniel NUNCA registrou saída — encontrado morto na manhã seguinte
  -- Seu último registro é entrada na sala de engenharia em 07:50 do dia 13

  -- === Dia 14 (sexta) - pós-incidente ===
  INSERT INTO registros_acesso VALUES (47, 4, 'Entrada Principal', '2025-03-14 08:30:00', 'entrada');
  INSERT INTO registros_acesso VALUES (48, 4, 'Sala de Engenharia - 3º andar', '2025-03-14 08:35:00', 'entrada');
  INSERT INTO registros_acesso VALUES (49, 3, 'Entrada Principal', '2025-03-14 10:30:00', 'entrada');
  INSERT INTO registros_acesso VALUES (50, 7, 'Entrada Principal', '2025-03-14 08:45:00', 'entrada');

  -- ============================================
  -- EMAILS (comunicações-chave + ruído)
  -- ============================================

  -- Emails normais (ruído)
  INSERT INTO emails VALUES (1, 10, 1, 'Sprint Review - Helix', 'Oi Daniel, vamos precisar da demo do módulo de autenticação para a review de sexta. Consegue preparar?', '2025-03-07 10:15:00');
  INSERT INTO emails VALUES (2, 1, 10, 'Re: Sprint Review - Helix', 'Claro, Juliana. Já estou finalizando os testes. Vai estar pronto.', '2025-03-07 10:42:00');
  INSERT INTO emails VALUES (3, 4, 1, 'Dúvida sobre o módulo de cache', 'Daniel, pode me ajudar com a implementação do cache distribuído? Estou travada no Redis.', '2025-03-08 14:20:00');
  INSERT INTO emails VALUES (4, 1, 4, 'Re: Dúvida sobre o módulo de cache', 'Claro, Fernanda. Passa na minha mesa amanhã que eu te explico. É mais simples do que parece.', '2025-03-08 14:35:00');
  INSERT INTO emails VALUES (5, 9, 3, 'Infraestrutura - Projeto Phantom', 'Ricardo, sobre o Phantom: não encontrei nenhum repositório no GitHub da empresa e nenhum servidor alocado. Qual o ambiente desse projeto?', '2025-03-05 09:30:00');
  INSERT INTO emails VALUES (6, 3, 9, 'Re: Infraestrutura - Projeto Phantom', 'Bruno, o Phantom está em fase de planejamento ainda. Não precisa se preocupar com infra por enquanto. Eu aviso quando for a hora.', '2025-03-05 10:15:00');

  -- === EMAILS CRÍTICOS ===
  -- Daniel descobre as irregularidades
  INSERT INTO emails VALUES (7, 1, 3, 'Orçamento do Projeto Phantom', 'Ricardo, estive analisando os relatórios financeiros que a Renata compartilhou na reunião de ontem. O projeto Phantom tem um orçamento de R$ 380.000, mas não encontro nenhum entregável, nenhum commit, nenhuma documentação. Pode me explicar?', '2025-03-10 16:30:00');
  INSERT INTO emails VALUES (8, 3, 1, 'Re: Orçamento do Projeto Phantom', 'Daniel, o Phantom é um projeto estratégico sob minha supervisão direta. Os detalhes são confidenciais por decisão da diretoria. Não é da sua alçada.', '2025-03-10 17:05:00');
  INSERT INTO emails VALUES (9, 1, 3, 'Re: Re: Orçamento do Projeto Phantom', 'Confidencial ou não, os números não fecham. Vi transferências de R$ 87.000 para "consultoria externa" sem nenhum contrato registrado. Além de três reembolsos em seu nome que somam R$ 23.500 vinculados ao Phantom. Isso não vai ficar assim, Ricardo.', '2025-03-12 11:45:00');
  INSERT INTO emails VALUES (10, 3, 1, 'Re: Re: Re: Orçamento do Projeto Phantom', 'Você está se precipitando. Sugiro que a gente converse pessoalmente antes de você fazer qualquer besteira.', '2025-03-12 12:20:00');

  -- Ricardo para Marcos (CFO) - tentando cobrir rastros
  INSERT INTO emails VALUES (11, 3, 5, 'Urgente - Auditoria interna', 'Marcos, precisamos alinhar os números do Phantom antes da próxima auditoria. Pode revisar as planilhas que te enviei? É urgente.', '2025-03-11 08:30:00');
  INSERT INTO emails VALUES (12, 5, 3, 'Re: Urgente - Auditoria interna', 'Ricardo, olhei por cima e está tudo nos conformes do que combinamos. Mas vamos marcar uma reunião para revisar com calma.', '2025-03-11 11:00:00');

  -- Email pós-ameaça
  INSERT INTO emails VALUES (13, 3, 5, 'Problema sério', 'Marcos, o Daniel está fuçando nos números do Phantom. Ele me mandou um email agressivo. Precisamos resolver isso.', '2025-03-12 12:45:00');
  INSERT INTO emails VALUES (14, 5, 3, 'Re: Problema sério', 'Calma. Fala com ele, explica que é projeto classificado. Se ele insistir a gente trata com o RH.', '2025-03-12 13:10:00');

  -- Emails normais de outros (mais ruído)
  INSERT INTO emails VALUES (15, 6, 2, 'Relatório mensal RH', 'Carla, segue o relatório de turnover do mês. Destaque para a baixa rotatividade na Engenharia.', '2025-03-10 09:00:00');
  INSERT INTO emails VALUES (16, 7, 3, 'Code review pendente', 'Ricardo, tenho um PR aberto há 3 dias. Pode revisar quando puder?', '2025-03-11 15:30:00');
  INSERT INTO emails VALUES (17, 14, 2, 'Contrato fornecedor', 'Carla, o contrato com a CloudScale está pronto para assinatura. Precisamos da sua aprovação.', '2025-03-12 10:00:00');
  INSERT INTO emails VALUES (18, 8, 1, 'Dashboard de métricas', 'Daniel, finalizei o dashboard que você pediu. Os dados de performance do Helix estão disponíveis no Grafana.', '2025-03-13 09:15:00');

  -- Daniel para Fernanda (última mensagem dele - preocupação velada)
  INSERT INTO emails VALUES (19, 1, 4, 'Documentação do Helix', 'Fernanda, estou organizando toda a documentação do Helix. Se algo acontecer comigo no projeto, quero que você tenha acesso a tudo. Estou deixando os acessos compartilhados. Não é nada, só organização.', '2025-03-13 15:30:00');

  -- Email que Daniel enviou para si mesmo (backup de evidências)
  INSERT INTO emails VALUES (20, 1, 1, 'Notas pessoais - NÃO DELETAR', 'Registrando: encontrei irregularidades graves no Projeto Phantom. R$ 87.000 em transferências sem contrato. R$ 23.500 em reembolsos para Ricardo Almeida sem comprovantes. Projeto não tem nenhum entregável real. Vou reportar à diretoria na segunda-feira.', '2025-03-13 17:00:00');

  -- ============================================
  -- CHAMADAS TELEFÔNICAS
  -- ============================================

  -- Chamadas normais (ruído)
  INSERT INTO chamadas VALUES (1, 10, 1, 420, '2025-03-07 11:00:00');
  INSERT INTO chamadas VALUES (2, 4, 1, 180, '2025-03-08 15:00:00');
  INSERT INTO chamadas VALUES (3, 1, 9, 240, '2025-03-10 10:00:00');
  INSERT INTO chamadas VALUES (4, 7, 3, 90, '2025-03-10 16:00:00');
  INSERT INTO chamadas VALUES (5, 15, 5, 300, '2025-03-11 10:30:00');

  -- === CHAMADAS CRÍTICAS ===
  -- Ricardo liga para Daniel (tentativa de resolver "na conversa")
  INSERT INTO chamadas VALUES (6, 3, 1, 540, '2025-03-12 18:30:00');
  -- Ricardo liga para Marcos após o email ameaçador
  INSERT INTO chamadas VALUES (7, 3, 5, 420, '2025-03-12 13:00:00');
  -- Daniel liga para Carla (CTO) - mas não atende (tentou reportar?)
  INSERT INTO chamadas VALUES (8, 1, 2, 0, '2025-03-13 16:45:00');
  -- Ricardo liga para Daniel na noite do dia 13 (última chamada antes de ir ao prédio)
  INSERT INTO chamadas VALUES (9, 3, 1, 180, '2025-03-13 22:15:00');
  -- === CHAMADA MAIS SUSPEITA: Ricardo liga para Marcos às 01:32 da manhã ===
  INSERT INTO chamadas VALUES (10, 3, 5, 195, '2025-03-14 01:32:00');

  -- Chamadas normais posteriores
  INSERT INTO chamadas VALUES (11, 4, 7, 120, '2025-03-14 09:30:00');
  INSERT INTO chamadas VALUES (12, 6, 2, 300, '2025-03-14 10:00:00');

  -- ============================================
  -- TRANSAÇÕES FINANCEIRAS
  -- ============================================

  -- Salários normais (ruído - amostra de março)
  INSERT INTO transacoes VALUES (1, 1, 'salario', 18500.00, 'Pagamento mensal - Março/2025', '2025-03-05');
  INSERT INTO transacoes VALUES (2, 3, 'salario', 24000.00, 'Pagamento mensal - Março/2025', '2025-03-05');
  INSERT INTO transacoes VALUES (3, 4, 'salario', 7500.00, 'Pagamento mensal - Março/2025', '2025-03-05');
  INSERT INTO transacoes VALUES (4, 5, 'salario', 32000.00, 'Pagamento mensal - Março/2025', '2025-03-05');
  INSERT INTO transacoes VALUES (5, 7, 'salario', 17000.00, 'Pagamento mensal - Março/2025', '2025-03-05');

  -- Transações normais de projetos
  INSERT INTO transacoes VALUES (6, 1, 'pagamento', 12000.00, 'Licença ferramentas - Projeto Helix', '2025-02-15');
  INSERT INTO transacoes VALUES (7, 9, 'pagamento', 8500.00, 'Servidores cloud - Projeto Sentinel', '2025-02-20');
  INSERT INTO transacoes VALUES (8, 7, 'reembolso', 450.00, 'Material de escritório', '2025-02-28');

  -- === TRANSAÇÕES SUSPEITAS - Projeto Phantom ===
  INSERT INTO transacoes VALUES (9, 3, 'transferencia', 45000.00, 'Consultoria externa - Projeto Phantom', '2024-06-15');
  INSERT INTO transacoes VALUES (10, 3, 'transferencia', 42000.00, 'Consultoria especializada - Projeto Phantom', '2024-09-20');
  INSERT INTO transacoes VALUES (11, 3, 'reembolso', 8500.00, 'Viagem técnica - Projeto Phantom', '2024-10-10');
  INSERT INTO transacoes VALUES (12, 3, 'reembolso', 7200.00, 'Equipamentos - Projeto Phantom', '2024-12-05');
  INSERT INTO transacoes VALUES (13, 3, 'reembolso', 7800.00, 'Treinamento especializado - Projeto Phantom', '2025-01-18');
  INSERT INTO transacoes VALUES (14, 3, 'transferencia', 35000.00, 'Desenvolvimento terceirizado - Projeto Phantom', '2025-02-10');
  INSERT INTO transacoes VALUES (15, 3, 'pagamento', 22000.00, 'Licenciamento software - Projeto Phantom', '2025-03-01');

  -- Transações normais (mais ruído)
  INSERT INTO transacoes VALUES (16, 10, 'pagamento', 5500.00, 'Ferramentas de design - Projeto Vertex', '2025-01-20');
  INSERT INTO transacoes VALUES (17, 4, 'reembolso', 320.00, 'Livros técnicos', '2025-02-05');
  INSERT INTO transacoes VALUES (18, 12, 'pagamento', 3200.00, 'Software contábil', '2025-01-15');
  INSERT INTO transacoes VALUES (19, 2, 'pagamento', 15000.00, 'Consultoria estratégica', '2025-02-25');
  INSERT INTO transacoes VALUES (20, 8, 'reembolso', 280.00, 'Curso online - Databricks', '2025-03-02');
`;

// Table schema metadata for the Schema Explorer
export const TABLE_INFO = [
  {
    name: 'funcionarios',
    icon: '👤',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Identificador único' },
      { name: 'nome', type: 'TEXT', description: 'Nome completo' },
      { name: 'cargo', type: 'TEXT', description: 'Cargo na empresa' },
      { name: 'departamento', type: 'TEXT', description: 'Departamento' },
      { name: 'data_admissao', type: 'DATE', description: 'Data de contratação' },
      { name: 'salario', type: 'REAL', description: 'Salário mensal (R$)' },
      { name: 'supervisor_id', type: 'INTEGER', description: 'ID do supervisor' },
      { name: 'email', type: 'TEXT', description: 'Email corporativo' },
      { name: 'status', type: 'TEXT', description: 'ativo / falecido / afastado' },
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
      { name: 'id', type: 'INTEGER', description: 'Identificador único' },
      { name: 'remetente_id', type: 'INTEGER', description: 'FK → funcionarios.id' },
      { name: 'destinatario_id', type: 'INTEGER', description: 'FK → funcionarios.id' },
      { name: 'assunto', type: 'TEXT', description: 'Assunto do email' },
      { name: 'conteudo', type: 'TEXT', description: 'Corpo da mensagem' },
      { name: 'data_hora', type: 'DATETIME', description: 'Quando foi enviado' },
    ]
  },
  {
    name: 'chamadas',
    icon: '📞',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Identificador único' },
      { name: 'origem_id', type: 'INTEGER', description: 'FK → funcionarios.id (quem ligou)' },
      { name: 'destino_id', type: 'INTEGER', description: 'FK → funcionarios.id (quem recebeu)' },
      { name: 'duracao_segundos', type: 'INTEGER', description: 'Duração em segundos' },
      { name: 'data_hora', type: 'DATETIME', description: 'Data e hora da chamada' },
    ]
  },
  {
    name: 'transacoes',
    icon: '💰',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Identificador único' },
      { name: 'funcionario_id', type: 'INTEGER', description: 'FK → funcionarios.id' },
      { name: 'tipo', type: 'TEXT', description: 'salario / transferencia / pagamento / reembolso' },
      { name: 'valor', type: 'REAL', description: 'Valor em R$' },
      { name: 'descricao', type: 'TEXT', description: 'Detalhes da transação' },
      { name: 'data', type: 'DATE', description: 'Data da transação' },
    ]
  },
  {
    name: 'projetos',
    icon: '📁',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Identificador único' },
      { name: 'nome', type: 'TEXT', description: 'Nome do projeto' },
      { name: 'responsavel_id', type: 'INTEGER', description: 'FK → funcionarios.id' },
      { name: 'orcamento', type: 'REAL', description: 'Orçamento alocado (R$)' },
      { name: 'status', type: 'TEXT', description: 'ativo / concluido / cancelado' },
      { name: 'data_inicio', type: 'DATE', description: 'Data de início' },
      { name: 'data_fim', type: 'DATE', description: 'Previsão de término' },
    ]
  }
];
