# Modelo de Produto: Suporte a Múltiplos Casos

O objetivo desta refatoração é comprovar que a arquitetura do "SQL Noir" pode escalar para suportar múltiplos casos independentes, transformando-o de um MVP de caso único para um produto real.

Para não quebrar o MVP atual (que será testado em massa), todo o trabalho será feito de forma isolada dentro de uma nova pasta chamada `modelo_para_produto`.

## Entendimento do Pedido

Entendi perfeitamente o seu pedido:
1. **Preservar o MVP**: Os arquivos originais na raiz (`APRENDER_BD/`) não devem ser tocados. Eles continuam existindo exatamente como estão para o teste em massa.
2. **Nova Pasta**: Criar um diretório `modelo_para_produto/` e copiar os arquivos necessários do MVP para lá.
3. **Refatoração Estrutural (Produto)**: Dentro da nova pasta, modificar a arquitetura para que os dados do jogo não fiquem "hardcoded" no motor (engine). Em vez disso, o motor lerá "módulos de caso" dinamicamente, permitindo a adição de infinitos casos no futuro.

## User Review Required

> [!IMPORTANT]
> A refatoração criará uma **Tela de Seleção de Casos** inicial antes do jogo carregar. Eu precisarei injetar um pouco de HTML no `index.html` copiado para fazer essa interface (uma lista de "Arquivos de Investigação"). Isso está de acordo?

> [!IMPORTANT]
> Para demonstrar que o modelo de produto funciona, além de extrair o "Caso 1" (O Último Commit) para um arquivo independente, eu também criarei um **"Caso 2" (fictício, bem curto, como um tutorial)** apenas para podermos testar a troca de casos na interface. Tudo bem?

## Proposed Changes

Abaixo está o detalhamento de como os arquivos serão estruturados dentro do novo diretório `modelo_para_produto`.

### 1. Sistema de Casos (Módulos Independentes)

Criaremos uma nova pasta `/cases` que conterá apenas as histórias/dados:

#### [NEW] `modelo_para_produto/js/cases/case_01.js`
Conterá todo o conteúdo que hoje está preso na engine:
- `ACTS` e `EVIDENCE_NARRATIVES` (que hoje estão em `narrative.js`)
- `SCHEMA_DDL` e `SEED_DATA` (que hoje estão em `schema.js`)
- `EVIDENCE_DEFINITIONS` (que hoje estão em `evidence.js`)

#### [NEW] `modelo_para_produto/js/cases/case_02.js`
Um caso tutorial rápido e simples ("Fraude Silenciosa") com apenas 2 tabelas para demonstrar a troca de histórias dinamicamente.

### 2. Refatoração da Engine (Motor)

Os arquivos da engine passarão a aceitar o objeto do caso como parâmetro ou farão o carregamento dinâmico:

#### [MODIFY] `modelo_para_produto/index.html`
- Adição de uma nova seção `<div id="case-selection-screen">` que será mostrada antes da tela de intro.

#### [MODIFY] `modelo_para_produto/js/main.js`
- Inicialização será dividida. O `main.js` primeiro listará os casos disponíveis.
- Ao clicar em um caso, a função `loadCase(caseId)` fará um `import()` dinâmico do arquivo do caso selecionado e repassará os dados para os outros módulos inicializarem.

#### [MODIFY] `modelo_para_produto/js/database.js`
- O `initDatabase()` aceitará a string `schemaDdl` e `seedData` do caso selecionado para construir o banco com os dados corretos.

#### [MODIFY] `modelo_para_produto/js/schema.js`, `evidence.js`, `narrative.js`
- Deletaremos todos os dados "hardcoded".
- Esses módulos passarão a ter funções como `initNarrative(actsData)` e `initEvidence(evidenceDefs)`, recebendo os dados do `main.js`.

### 3. Arquivos Estáticos e CSS

#### [NEW] `modelo_para_produto/css/`
- Os arquivos CSS serão copiados. Um novo `hub.css` (ou adições ao `layout.css`) será criado para a interface do Menu de Seleção de Casos.

## Verification Plan

### Testes Manuais no Browser
1. Abrir `modelo_para_produto/index.html`.
2. Verificar se a **Tela de Seleção de Casos** é exibida.
3. Clicar no Caso 2 (Tutorial). O banco de dados deve ser carregado com o schema reduzido do Caso 2. Resolver o caso.
4. Voltar à seleção e clicar no Caso 1 (O Último Commit). O banco de dados deve recriar as 6 tabelas originais, e a narrativa deve refletir a história do Daniel.
5. Garantir que **nada** foi alterado na raiz original `APRENDER_BD/`.
