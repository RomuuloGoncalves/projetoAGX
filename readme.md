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

## Testes Automatizados

A aplicação possui testes de integração que cobrem fluxos positivos e negativos (erros de validação, permissão e lógica).

Para rodar todos os testes:
```bash
deno test -A tests/
```

Arquivos disponíveis:
- `tests/auth_test.ts`: Login, Logout e Blacklist.
- `tests/emprestimo_test.ts`: Fluxo completo de empréstimo, estoque e devolução.
- `tests/livro_test.ts`: CRUD de livros e validações.
- `tests/autor_test.ts`: CRUD de autores.
- `tests/usuario_test.ts`: Gestão de usuários e permissões.

## Setup e Execução

1. **Variáveis de Ambiente**: Configure o arquivo `.env` baseado no `.env-example`:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/biblioteca
   JWT_SECRET=secret
   ```

2. **Rodar em modo Desenvolvimento**:
   ```bash
   deno task dev
   ```

3. **Produção**:
   ```bash
   deno run -A main.ts
   ```

<!-- --- -->
<!-- *Desenvolvido como parte do projeto AGX Biblioteca.* -->
