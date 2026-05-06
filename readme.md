# Projeto Biblioteca — API em Deno

## Descrição

API CRUD para gerenciamento de uma biblioteca, desenvolvida com **Deno** e **MongoDB**.
Permite gerenciar **usuários, autores, livros e empréstimos**, com **autenticação JWT**, **transações MongoDB**, **logs padronizados** e **testes automatizados**.

## Tecnologias Utilizadas

- Deno
- MongoDB
- Pacotes obrigatórios:

   - `responser` — padronização de respostas
   - `request-check` — validação de payloads
   - `morgan` — logging de requisições
   - `isness` — comparação de valores
   - `throwlhos` — lançamento de erros padronizados

## Estrutura de Coleções

### Usuários

Campos (exemplo):

```json
{
   "_id": "ObjectId",
   "nome": "string",
   "email": "string",
   "senha": "string (hash)",
   "role": "string (admin | user)"
}
```

- Função: autenticação e autorização
- Observações: JWT gerado para cada usuário; `role` define permissões

### Autores

Campos (exemplo):

```json
{
   "_id": "ObjectId",
   "nome": "string",
   "nacionalidade": "string",
   // "ano_nascimento": "number"
}
```

- Função: armazenar informações dos autores

### Livros

Campos (exemplo):

```json
{
   "_id": "ObjectId",
   "titulo": "string",
   "isbn": "string",
   "ano": "number",
   "autor_id": "ObjectId",
   "quantidade_total": "number",
   "quantidade_disponivel": "number"
}
```

- Função: gerenciar livros da biblioteca
- Relacionamentos: `autor_id` referencia Autores

### Empréstimos

Campos (exemplo):

```json
{
   "_id": "ObjectId",
   "usuario_id": "ObjectId",
   "livro_id": "ObjectId",
   "data_emprestimo": "Date",
   "data_devolucao": "Date | null",
   "status": "string (ativo | devolvido)"
}
```

- Função: registrar empréstimos
- Transação: criar empréstimo → decrementar `quantidade_disponivel` do livro

## Endpoints Sugeridos

### Usuários

- `POST /usuarios` — criar usuário
- `POST /login` — autenticar e gerar JWT

### Autores

- `POST /autores` — criar autor
- `GET /autores` — listar autores
- `PUT /autores/:id` — atualizar autor
- `DELETE /autores/:id` — remover autor

### Livros

- `POST /livros` — criar livro
- `GET /livros` — listar livros
- `PUT /livros/:id` — atualizar livro
- `DELETE /livros/:id` — remover livro

### Empréstimos

- `POST /emprestimos` — criar empréstimo (transação)
- `GET /emprestimos` — listar empréstimos
- `PUT /emprestimos/:id/devolver` — marcar devolução
- `GET /usuarios/:id/emprestimos` — empréstimos de um usuário específico

## Autenticação

- JWT Bearer Token nos headers para endpoints protegidos
- Tokens configuráveis no Postman
- Role-based authorization (ex.: apenas admin pode criar livros/autores)

## Transações

- Exemplo: criar empréstimo → decrementar `quantidade_disponivel` no livro
- Implementado usando MongoDB sessions para garantir atomicidade

## Testes Automatizados

- Utilizando `Deno.test`
- Cobertura inclui:

   - Respostas positivas (sucesso)
   - Respostas negativas (validação, autenticação, autorização)

- Seguindo padrões AGX

## Logs e Erros

- `morgan` para logging de todas as requisições
- `responser` e `throwlhos` para padronizar respostas e erros

## Setup

1. Clonar o repositório:

```bash
git clone <REPO_URL>
cd biblioteca-deno
```

2. Instalar dependências:

```bash
deno task deps
```

3. Configurar variáveis de ambiente (arquivo `.env`):

- `MONGO_URI=<sua_uri_mongodb>`
- `JWT_SECRET=<seu_segredo_jwt>`
- `PORT=8000`

4. Rodar a aplicação:

```bash
deno task start
```

5. Rodar testes:

```bash
deno task test
```

## Documentação

- Documentação pública da API: [Postman / Swagger link]
- Inclui exemplos de requisição e resposta para todos os endpoints

## Considerações Finais

Este projeto demonstra:

- CRUD completo com MongoDB
- JWT para autenticação e autorização
- Operações atômicas usando transações
- Testes automatizados cobrindo todos os endpoints
- Logging e tratamento padronizado de erros
- Estrutura modular e organizada, pronta para produção ou evolução

---