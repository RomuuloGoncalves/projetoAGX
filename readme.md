# Projeto Biblioteca — API em Deno

## Descrição

API robusta para gerenciamento de uma biblioteca, desenvolvida com **Deno**, **Express** (via npm) e **MongoDB (Mongoose)**.
O sistema conta com um fluxo completo de **autenticação JWT**, controle de permissões por perfil (**RBAC**), gerenciamento de **estoque atômico** via transações, **documentação Swagger** integrada e uma suíte completa de **testes de integração**.

## Estrutura em Camadas

O projeto segue uma arquitetura modular dividida em:

- **Entidades**: Contém Controllers, Services e Repositories de cada domínio (Autor, Livro, Usuario, Emprestimo, Auth).
- **Models**: Definições das classes de domínio que estendem o `CoreModel`.
- **Core**: Middlewares (Auth, Admin, Blacklist) e utilitários globais.
- **Connection**: Configurações de banco de dados e Schemas do Mongoose.
- **Tests**: Testes automatizados utilizando `Deno.test` e `supertest`.

## Tecnologias Utilizadas

- **Deno**: Runtime principal.
- **Express**: Framework web.
- **Mongoose**: ODM para modelagem de dados e transações.
- **Segurança**:
   - `bcryptjs`: Hash de senhas.
   - `jsonwebtoken`: Geração e validação de tokens.
- **Utilitários**:
   - `responser`: Padronização de respostas HTTP.
   - `request-check`: Validação de payloads de entrada.
   - `morgan`: Logging de requisições.
   - `throwlhos`: Lançamento de erros padronizados com status HTTP.
   - `swagger-ui-express`: Interface visual para a documentação da API.

## Funcionalidades Principais

### 1. Autenticação e Segurança
- **Login**: Gera token JWT com expiração de 1 dia.
- **Logout**: Implementado via **Blacklist em memória**, invalidando o token imediatamente.
- **RBAC**: Perfil `admin` é necessário para operações sensíveis (criar livros, gerenciar empréstimos, etc). Usuários `comum` possuem acesso limitado.

### 2. Gestão de Empréstimos
- **Estoque Atômico**: Ao realizar um empréstimo, a `quantidade_disponivel` do livro é decrementada. Ao devolver, o estoque é recuperado. Ambos usam **Transações (Sessions)** do MongoDB.
- **Bloqueio de Exclusão**: Não é permitido excluir um empréstimo com status `ativo`. O livro deve ser devolvido primeiro.
- **Endpoint de Devolução**: Rota específica para processar a devolução e atualizar o status e estoque simultaneamente.

## Endpoints

### Autenticação
- `POST /login`: Autentica usuário e retorna token.
- `POST /logout`: Invalida o token atual (requer autenticação).

### Documentação
- `GET /api-docs`: Abre a interface do **Swagger UI** com todos os detalhes da API.

### Usuários
- `GET /usuario`, `POST /usuario`
- `GET /usuario/:id`, `PUT /usuario/:id`, `DELETE /usuario/:id`

### Autores
- `GET /autor`, `POST /autor`
- `GET /autor/:id`, `PUT /autor/:id`, `DELETE /autor/:id`

### Livros
- `GET /livro`, `POST /livro`
- `GET /livro/:id`, `PUT /livro/:id`, `DELETE /livro/:id`

### Empréstimos (Protegidos por Auth)
- `GET /emprestimo`: Lista todos os empréstimos.
- `POST /emprestimo`: Cria novo empréstimo (Admin).
- `POST /emprestimo/:id/devolver`: Registra devolução e recupera estoque (Admin).
- `DELETE /emprestimo/:id`: Remove registro (apenas se status for `devolvido`).

## Testes Automatizados e Cobertura (Coverage)

A aplicação possui testes de integração que cobrem fluxos positivos e negativos (erros de validação, permissão e lógica). O Deno possui um sistema de testes e análise de cobertura (coverage) integrado nativamente, dispensando a instalação de bibliotecas de terceiros (como Jest ou NYC).

Toda a configuração de tarefas foi adicionada de forma nativa no arquivo `deno.json`. 

### Comandos Disponíveis

1. **Rodar apenas os testes:**
   ```bash
   deno task test
   ```
   Executa todos os arquivos da pasta `/tests` verificando as asserções.

2. **Rodar testes e coletar dados de cobertura:**
   ```bash
   deno task test:cov
   ```
   Executa os testes e extrai os dados brutos de quais linhas de código foram atingidas, salvando-os na pasta oculta `cov_profile`.

3. **Ver relatório de cobertura no Terminal:**
   ```bash
   deno task coverage
   ```
   Lê a pasta `cov_profile` e imprime no console o percentual de cobertura para cada arquivo e diretório do projeto.

4. **Gerar e visualizar relatório interativo em HTML:**
   ```bash
   deno task coverage:html
   ```
   Este comando consolida os dados de cobertura e gera um mini-site estático na pasta `cov_profile/html/`.
   **Como visualizar:** Após executar o comando, abra o arquivo `cov_profile/html/index.html` em qualquer navegador web. Ele renderizará uma interface gráfica que permite navegar pelos arquivos do projeto e verificar, com realce de sintaxe, exatamente quais linhas foram cobertas pelos testes (linhas verdes) e quais partes do código ainda precisam de testes (linhas vermelhas).

### Arquivos de Testes Disponíveis
- `tests/auth_test.ts`: Login, Logout e Blacklist.
- `tests/emprestimo_test.ts`: Fluxo completo de empréstimo, estoque e devolução.
- `tests/livro_test.ts`: CRUD de livros e validações.
- `tests/autor_test.ts`: CRUD de autores.
- `tests/usuario_test.ts`: Gestão de usuários e permissões.

## Setup e Execução

1. **Variáveis de Ambiente**: Configure o arquivo `.env` baseado no `.env-example`:
   ```env
   MONGO_URI=mongodb+srv://...
   MONGO_URI_MONGOOSE=mongodb+srv://
   DB_NAME=#
   JWT_SECRET=your_jwt_secret_here
   ```

2. **Como rodar**:
   ```bash
   deno run -A main.ts
   ```