# SQL Noir - MVP Walkthrough

A construção inicial do projeto **SQL Noir**, um jogo investigativo movido a SQL, foi concluída com sucesso! 

## O que foi construído

A fundação do jogo inteiro foi estabelecida utilizando as melhores práticas para uma experiência rica rodando inteiramente no navegador:

### 1. Interface Noir (Design e UX)
- **Design System Vanilla**: Utilizamos apenas HTML semântico e CSS Vanilla (custom properties) para a máxima flexibilidade de design (arquivos `variables.css` e `layout.css`).
- **Layout Responsivo 3 Painéis**: O ambiente tem um terminal de comando, um quadro de narrativa em tempo real e um explorador de _Schema_ na base.
- **Animações e Efeitos Visuais**: Painéis e terminal possuem estética retro-futurista, efeito typewriter na narração, glow, luzes noir intermitentes, e "poeira digital" ambiente em CSS (`animations.css`).

### 2. Motor de Jogo e Investigação (Game Engine Vanilla JS)
- **Banco de Dados no Browser**: Usando o **SQL.js**, as consultas rodam em uma memória SQLite via WebAssembly (`database.js`).
- **Dados Narrativos**: Preparamos um esquema robusto para o caso "O Último Commit", com 6 tabelas (funcionários, acessos, chamadas, emails, transações, projetos) e 120+ registros recheados de evidências veladas e ruído (`schema.js`).
- **Detecção de Evidências (`evidence.js`)**: As análises não verificam o código SQL da query do jogador, mas sim os **resultados retornados**. Assim que um registro suspeito surge na tabela, um card de evidência é liberado.
- **Progressão Narrativa (`narrative.js`)**: Conforme as evidências surgem, a história avança de "Ato 1" até o "Ato 5" com direito a typewriter.
- **Experiência sem Frustrações (`feedback.js`)**: Respostas de erro traduzem o SQL seco (como `no such table`) para a linguagem do detetive de forma interativa, incluindo dicas para quando o jogador passa 45s sem saber o que consultar.

### 3. Conclusão Final
- **Acusação e Veredito**: Após desvendar as 9 evidências, o jogador acessa o painel para acusar o assassino. Caso a acusação for Ricardo Almeida, o MVP apresenta a tela de Veredito de Sucesso.

## Próximos Passos (O que falta de sua parte)

Para validar e jogar o projeto, você precisará visualizá-lo em um navegador. Como os arquivos JavaScript foram separados em ES Modules (`import/export`), os navegadores **bloqueiam** que sejam abertos via clique-duplo no HTML localmente (esquema `file://`) por razões de segurança (CORS).

**Como testar (Integration Testing):**
1. Abra o diretório principal do projeto no seu editor favorito (Ex: Visual Studio Code).
2. Utilize a extensão **Live Server** ou similar para hospedar a pasta do projeto localmente.
3. Se tiver o Python no seu Windows no futuro, poderia executar `python -m http.server 8080`.
4. Entre pelo navegador.
5. Siga pelo menos um caso fazendo a consulta e tente prender o Ricardo!
