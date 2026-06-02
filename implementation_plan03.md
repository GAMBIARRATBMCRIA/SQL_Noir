# Plano Completo de Melhorias — SQL Noir (`modelo_para_produto`)

Este plano cobre todos os bugs, inconsistências arquiteturais e oportunidades de melhoria identificados durante a revisão do projeto.

---

## User Review Required

> [!IMPORTANT]
> **Escopo**: Este plano altera **apenas** os arquivos dentro de `modelo_para_produto/`. Os arquivos originais na raiz (`APRENDER_BD/`) permanecem intocados.

> [!WARNING]
> **Feedback.js hardcoded**: Atualmente o módulo de feedback referencia dados do Caso 01 ("Nexus", "Daniel Moreira", nomes de tabelas) diretamente no código. A correção proposta move essas informações para dentro de cada módulo de caso, o que **muda a interface do objeto de caso** (adiciona novos campos). Confirmar se isso é aceitável.

> [!IMPORTANT]
> **Imports estáticos vs dinâmicos**: O `implementation_plan02.md` original propunha `import()` dinâmico para carregar casos sob demanda. Porém, o código atual usa imports estáticos. O plano abaixo propõe **manter estáticos** por simplicidade (não há backend/bundler), mas criar um **registro centralizado** que facilita adicionar novos casos. Deseja manter assim ou prefere `import()` dinâmico?

---

## Open Questions

> [!NOTE]
> **Atualização dos `.md` da raiz**: Os arquivos `implementation_plan.md`, `implementation_plan02.md` e `walkthrough.md` na raiz do projeto estão desatualizados em relação ao código real. O plano propõe atualizá-los no final para refletir o estado atual. Isso deve ser feito ou prefere mantê-los como estão (documentação histórica)?

> [!NOTE]
> **Caso 02 — profundidade**: O caso tutorial "Fraude Silenciosa" é extremamente simples (2 tabelas, 2 evidências). Deseja que eu aproveite para enriquecê-lo um pouco (ex: 3-4 evidências, mais dados de ruído para dificultar) ou mantê-lo minimalista como tutorial?

---

## Bugs Identificados

| # | Severidade | Arquivo | Problema |
|---|-----------|---------|----------|
| 1 | 🔴 Alta | [layout.css](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/css/layout.css#L666-L678) | CSS do Hub usa variáveis `--bg-main`, `--bg-panel`, `--border-color` que **não existem** em `variables.css`. O hub fica sem fundo/bordas visíveis. |
| 2 | 🔴 Alta | [index.html](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/index.html) + [layout.css](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/css/layout.css) | A `intro-screen` começa **visível** (sem classe `hidden`), cobrindo o hub de seleção. O jogador vê a tela de intro vazia ao invés do hub. |
| 3 | 🟡 Média | [feedback.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/feedback.js#L19-L21) | Mensagens de erro referenciam "sistema da Nexus" e listam tabelas hardcoded do Caso 01. No Caso 02 ("Fraude Silenciosa"), a mensagem diz "tabelas são: funcionarios, registros_acesso..." quando o caso só tem `estoque` e `vendas`. |
| 4 | 🟡 Média | [feedback.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/feedback.js#L70-L117) | Dicas (`HINTS`) são 100% hardcoded para o Caso 01. No Caso 02, o jogador recebe dicas como "Quem era Daniel Moreira?" — totalmente fora de contexto. |
| 5 | 🟡 Média | [main.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/main.js#L443-L460) | Ao errar a acusação, o modal fecha automaticamente após 5s e `rebuildAccusationModal()` reconstrói o HTML, mas ao reabrir via `showAccusationModal()` os event listeners dos botões de suspeito não são reconectados corretamente (race condition). |
| 6 | 🟢 Baixa | [case_01.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/cases/case_01.js#L76-L119) | Seed data do Caso 01 tem **poucos registros** nas tabelas `registros_acesso`, `emails`, `chamadas` e `transacoes` (4-7 linhas cada). Falta "ruído" — o jogador deveria ter que filtrar dados irrelevantes para encontrar as pistas. |
| 7 | 🟢 Baixa | [evidence.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/evidence.js#L69-L73) | `getCurrentAct()` tem lógica redundante: calcula `allFound` mas retorna `maxAct` em ambos os caminhos. |

---

## Proposed Changes

### Fase 1: Correções Críticas (Bugs que impedem uso)

---

#### [MODIFY] [index.html](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/index.html)

- **Linha 45**: Adicionar classe `hidden` à `intro-screen` para que ela comece oculta: `<div class="intro-screen hidden" id="intro-screen">`
- Isso garante que o hub de seleção de casos seja a primeira tela visível

#### [MODIFY] [layout.css](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/css/layout.css#L666-L678)

- Substituir variáveis inexistentes do CSS do hub:
  - `--bg-main` → `var(--bg-void)`
  - `--bg-panel` → `var(--bg-secondary)`
  - `--border-color` → `var(--narrative-border)`
- Refatorar o CSS do hub: converter as linhas 666-678 (atualmente tudo em uma linha cada, difícil de manter) para formato multilinha legível
- Adicionar efeitos visuais ao hub: animações de entrada para os cards, hover mais sofisticado, e ícone/badge de dificuldade estilizado

#### [MODIFY] [variables.css](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/css/variables.css)

- Adicionar variáveis de compatibilidade para garantir que não haja variáveis CSS pendentes:
  ```css
  --bg-main: var(--bg-void);
  --bg-panel: var(--bg-secondary);
  --border-color: var(--narrative-border);
  ```

---

### Fase 2: Generalização do Feedback (Tornar engine agnóstica ao caso)

---

#### [MODIFY] [case_01.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/cases/case_01.js)

- Adicionar novo campo `feedbackConfig` ao objeto do caso:
  ```javascript
  feedbackConfig: {
    systemName: 'Nexus Systems',
    tableNames: ['funcionarios', 'registros_acesso', 'emails', 'chamadas', 'transacoes', 'projetos'],
    hints: {
      0: [
        { text: 'Todo caso começa pela vítima. Quem era Daniel Moreira?', sql: "SELECT * FROM funcionarios WHERE nome LIKE '%Daniel%'" },
        { text: 'Explore os dados dos funcionários.', sql: 'SELECT * FROM funcionarios' }
      ],
      1: [ ... ],
      // ... todos os hints atuais do feedback.js
    }
  }
  ```

#### [MODIFY] [case_02.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/cases/case_02.js)

- Adicionar `feedbackConfig` com dados específicos do caso tutorial:
  ```javascript
  feedbackConfig: {
    systemName: 'TechMarket',
    tableNames: ['estoque', 'vendas'],
    hints: {
      0: [
        { text: 'Comece verificando o estoque atual da loja.', sql: 'SELECT * FROM estoque' },
        { text: 'Veja quais vendas foram registradas.', sql: 'SELECT * FROM vendas' }
      ],
      // ...
    }
  }
  ```

#### [MODIFY] [feedback.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/feedback.js)

- Refatorar completamente para ser **genérico**:
  - Adicionar função `initFeedback(feedbackConfig)` que recebe a configuração do caso ativo
  - `translateError()` passa a usar `feedbackConfig.systemName` e `feedbackConfig.tableNames` dinamicamente
  - `getHint()` passa a ler de `feedbackConfig.hints` ao invés do `HINTS` hardcoded
  - Remover todas as referências hardcoded a "Nexus", "Daniel Moreira", nomes de tabelas do Caso 01

#### [MODIFY] [main.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/main.js)

- Na função `startGame()`, adicionar chamada `initFeedback(currentCase.feedbackConfig)` para passar a configuração de feedback do caso selecionado
- Importar `initFeedback` de `feedback.js`

---

### Fase 3: Correções de UX e Robustez

---

#### [MODIFY] [main.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/main.js#L382-L478)

- **Fix do modal de acusação (Bug #5)**:
  - Refatorar `showVerdict()` e `rebuildAccusationModal()` para não depender de `innerHTML` + event listeners manuais
  - Usar uma abordagem de re-render limpa: ao clicar "Voltar e Investigar", chamar `rebuildAccusationModal()` seguido de `showAccusationModal()` de forma síncrona
  - Remover o `setTimeout` de 5s que fecha o modal automaticamente (deixar o jogador decidir quando fechar)

#### [MODIFY] [main.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/main.js#L32-L53)

- **Melhorar inicialização do Hub**:
  - Adicionar animação de entrada escalonada nos cards (cada card aparece com delay)
  - Adicionar ícone de número do caso (ex: `#01`, `#02`)
  - Adicionar contagem de evidências e tabelas no card (ex: "6 tabelas · 9 evidências")

#### [MODIFY] [evidence.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/evidence.js#L60-L74)

- **Fix da lógica redundante de `getCurrentAct()` (Bug #7)**:
  - Simplificar para retornar apenas `maxAct` sem o cálculo desnecessário de `allFound`

#### [MODIFY] [narrative.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/narrative.js)

- **Adicionar botão "Voltar ao Hub"** no painel de narrativa ou no header para permitir que o jogador retorne à seleção de casos sem recarregar a página
- Isso requer:
  - Adicionar uma função `resetGame()` que limpa o estado de todos os módulos
  - Adicionar funções `resetEvidence()` em `evidence.js`, `resetNarrative()` em `narrative.js`, `resetTerminal()` em `terminal.js`

#### [MODIFY] [index.html](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/index.html)

- Adicionar botão "← Voltar" no header do jogo:
  ```html
  <button class="btn-back" id="btn-back" title="Voltar aos Arquivos">← Arquivos</button>
  ```

---

### Fase 4: Enriquecimento de Dados (Caso 01)

---

#### [MODIFY] [case_01.js](file:///c:/Users/User/Documents/APRENDER_BD/modelo_para_produto/js/cases/case_01.js#L75-L119)

- **Adicionar dados de "ruído" (Bug #6)** para tornar a investigação mais realista:
  - `registros_acesso`: adicionar ~20-30 registros de entradas/saídas normais de vários funcionários ao longo da semana (não apenas os registros da noite do crime)
  - `emails`: adicionar ~10-15 emails mundanos (reuniões, projetos, almoços) para que os emails sobre o Phantom não sejam os únicos disponíveis
  - `chamadas`: adicionar ~10-15 chamadas normais entre funcionários durante a semana
  - `transacoes`: adicionar ~8-10 transações legítimas (salários, reembolsos normais) para contrastar com as irregulares do Phantom
  - Total estimado: de ~25 registros para ~80-100 registros no seed data

---

### Fase 5: Atualização da Documentação

---

#### [MODIFY] [implementation_plan.md](file:///c:/Users/User/Documents/APRENDER_BD/implementation_plan.md)

- Atualizar a seção "Estrutura de Arquivos" para refletir a existência de `modelo_para_produto/`
- Marcar os "Critérios de Aceite do MVP" como concluídos `[x]` onde aplicável
- Adicionar nota sobre a evolução para modelo multi-caso

#### [MODIFY] [implementation_plan02.md](file:///c:/Users/User/Documents/APRENDER_BD/implementation_plan02.md)

- Atualizar para refletir decisões tomadas na implementação:
  - Imports estáticos (não dinâmicos como proposto)
  - `schema.js` não foi criado como arquivo separado (schema + seed ficam dentro do case)
  - Feedback ainda não era genérico (será corrigido neste plano)
- Marcar itens do "Verification Plan" como concluídos

#### [MODIFY] [walkthrough.md](file:///c:/Users/User/Documents/APRENDER_BD/walkthrough.md)

- Atualizar para cobrir a versão `modelo_para_produto`:
  - Descrever a arquitetura de múltiplos casos
  - Listar os dois casos disponíveis
  - Atualizar instruções de teste para apontar para `modelo_para_produto/index.html`

---

## Resumo das Mudanças por Arquivo

| Arquivo | Tipo | Fase | Descrição |
|---------|------|------|-----------|
| `index.html` | MODIFY | 1, 3 | Fix intro-screen visível + botão voltar |
| `css/variables.css` | MODIFY | 1 | Adicionar variáveis de compatibilidade |
| `css/layout.css` | MODIFY | 1 | Fix CSS do hub + refatorar para multilinha |
| `js/main.js` | MODIFY | 2, 3 | initFeedback + fix acusação + hub melhorado + botão voltar |
| `js/feedback.js` | MODIFY | 2 | Refatoração completa para ser genérico |
| `js/evidence.js` | MODIFY | 3 | Fix getCurrentAct + resetEvidence |
| `js/narrative.js` | MODIFY | 3 | resetNarrative |
| `js/terminal.js` | MODIFY | 3 | resetTerminal |
| `js/cases/case_01.js` | MODIFY | 2, 4 | feedbackConfig + dados de ruído |
| `js/cases/case_02.js` | MODIFY | 2 | feedbackConfig |
| `implementation_plan.md` | MODIFY | 5 | Atualizar documentação |
| `implementation_plan02.md` | MODIFY | 5 | Atualizar documentação |
| `walkthrough.md` | MODIFY | 5 | Atualizar documentação |

---

## Verification Plan

### Testes Manuais no Browser

1. Abrir `modelo_para_produto/index.html` via Live Server
2. **Hub de Seleção**: Verificar que o hub é a primeira tela, com styling correto (cores, bordas, hover effects)
3. **Caso 02 (Tutorial)**: Selecionar o caso tutorial, verificar que:
   - Intro mostra dados do Caso 02 (não do Caso 01)
   - Terminal funciona com tabelas `estoque` e `vendas`
   - Dicas contextuais mencionam "TechMarket" e não "Nexus"
   - Erros SQL listam tabelas corretas do caso
   - Evidências são detectadas e narrativa avança
   - Acusação funciona (Amanda é a correta)
4. **Caso 01 (Principal)**: Selecionar o caso principal, verificar:
   - Dados de ruído presentes (>50 registros em `registros_acesso`)
   - Dicas contextuais sobre "Daniel Moreira" e "Nexus"
   - Todas as 9 evidências detectáveis
   - Acusação errada permite retry sem bugs
5. **Navegação**: Testar botão "Voltar" para retornar ao hub e trocar de caso
6. **Responsividade**: Verificar em telas ≤900px e ≤600px
