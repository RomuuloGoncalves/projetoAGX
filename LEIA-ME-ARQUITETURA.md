# 📚 Arquitetura do Projeto - Explicação em Português

## Como o Código Funciona

O projeto segue um padrão de **4 camadas**. Vou explicar cada uma:

### **1. MODELO** (`models/`)

O modelo é uma **classe que representa os dados**.

**Exemplo: Livro**

```typescript
export default class LivroModelo extends ModeloBase {
  private titulo: string;
  private isbn: number;
  private ano: number;
  
  // Getters (ler dados)
  obterTitulo() { return this.titulo; }
  
  // Setters (modificar dados)
  definirTitulo(novoTitulo: string) { this.titulo = novoTitulo; }
  
  // Retorna os dados para salvar no banco
  obterDados() {
    return { titulo: this.titulo, isbn: this.isbn, ano: this.ano };
  }
}
```

**Por que?** Separar os dados da lógica de banco de dados deixa o código mais limpo.

---

### **2. REPOSITÓRIO** (`entidades/*/Repository.ts`)

O repositório **acessa o banco de dados**.

**Exemplo:**

```typescript
export default class RepositorioLivro extends RepositorioBase {
  // Buscar todos os livros
  async obterTodos(): Promise<LivroModelo[]> {
    const documentos = await this.bd.find();
    return documentos.map(doc => this.converterParaModelo(doc));
  }
  
  // Buscar por ID
  async obterPorId(id: string): Promise<LivroModelo | null> {
    const documento = await this.bd.findById(id);
    if (!documento) return null;
    return this.converterParaModelo(documento);
  }
  
  // Criar
  async criar(livro: LivroModelo): Promise<LivroModelo | null> {
    const doc = await this.bd.create(livro.obterDados());
    return this.converterParaModelo(doc);
  }
  
  // Deletar
  async deletarPorId(id: string): Promise<LivroModelo | null> {
    const doc = await this.bd.findByIdAndDelete(id);
    if (!doc) return null;
    return this.converterParaModelo(doc);
  }
}
```

**Por que?** Todo acesso ao banco fica centralizado em um lugar. Se mudar o banco, só muda aqui.

---

### **3. SERVIÇO** (`entidades/*/Service.ts`)

O serviço **contém as regras de negócio**.

**Exemplo:**

```typescript
export default class ServicoLivro {
  private repositorio: RepositorioLivro;
  
  constructor(repositorio: RepositorioLivro) {
    this.repositorio = repositorio;
  }
  
  // Criar um livro
  async criar(livro: LivroModelo): Promise<LivroModelo> {
    // Regra 1: Verifica se ISBN já existe
    const livroExistente = await this.repositorio.obterPorISBN(livro.obterISBN());
    if (livroExistente) {
      throw new Error(`ISBN "${livro.obterISBN()}" já existe!`);
    }
    
    // Regra 2: Cria o livro
    return await this.repositorio.criar(livro);
  }
  
  // Listar todos
  async listar(): Promise<LivroModelo[]> {
    return this.repositorio.obterTodos();
  }
  
  // Buscar um
  async obterPorId(id: string): Promise<LivroModelo> {
    const livro = await this.repositorio.obterPorId(id);
    if (!livro) throw new Error("Livro não encontrado");
    return livro;
  }
  
  // Deletar um
  async deletar(id: string): Promise<LivroModelo> {
    const livro = await this.repositorio.deletarPorId(id);
    if (!livro) throw new Error("Livro não encontrado");
    return livro;
  }
}
```

**Por que?** A lógica de negócio fica separada da lógica de banco de dados e de HTTP.

---

### **4. CONTROLLER** (`entidades/*/Controller.ts`)

O controller **recebe as requisições HTTP e responde**.

**Exemplo:**

```typescript
// POST /livro - Criar um novo livro
async function criar(req: Request, res: Response) {
  try {
    const corpo = req.body; // Dados que vêm da requisição
    
    // Validar dados
    const erros = regras.check(
      { titulo: corpo.titulo },
      { isbn: corpo.isbn }
    );
    if (erros) {
      return res.send_badRequest("Dados inválidos", erros);
    }
    
    // Criar objeto LivroModelo
    const livro = new LivroModelo({
      titulo: corpo.titulo,
      isbn: corpo.isbn
    });
    
    // Chamar serviço para criar
    const livroSalvo = await servicoLivro.criar(livro);
    
    // Responder com sucesso
    return res.send_created("Livro criado!", livroSalvo.paraJSON());
  } catch (erro) {
    return res.send_internalServerError("Erro ao criar livro", erro);
  }
}
```

**Por que?** O controller só valida entrada, chama o serviço e retorna resposta HTTP.

---

## 🔄 Fluxo Completo

Quando alguém faz um `POST /livro` com dados de um livro:

```
1. Controller recebe a requisição
   ↓
2. Controller valida os dados (usando `regras`)
   ↓
3. Controller cria um objeto LivroModelo
   ↓
4. Controller chama ServicoLivro.criar(livro)
   ↓
5. Serviço valida regras de negócio (ex: ISBN duplicado?)
   ↓
6. Serviço chama RepositorioLivro.criar(livro)
   ↓
7. Repositório converte para dados do banco e salva
   ↓
8. Repositório retorna o LivroModelo criado
   ↓
9. Serviço retorna para o Controller
   ↓
10. Controller retorna resposta HTTP com os dados
```

---

## 📦 Estrutura de Pastas

```
projeto/
├── core/                          # Classes base
│   ├── CoreModel.ts              # Classe ModeloBase
│   └── CoreRepository.ts          # Classe RepositorioBase
│
├── models/                        # Modelos de dados
│   ├── livro.ts
│   ├── usuario.ts
│   ├── autor.ts
│   └── emprestimo.ts
│
├── entidades/                     # Cada entidade tem suas próprias camadas
│   ├── livro/
│   │   ├── livroController.ts     # Recebe requisições HTTP
│   │   ├── livroService.ts        # Regras de negócio
│   │   └── livroRepository.ts     # Acessa o banco
│   │
│   ├── usuario/
│   │   ├── usuarioController.ts
│   │   ├── usuarioService.ts
│   │   └── usuarioRepository.ts
│   │
│   ├── autor/
│   └── emprestimo/
│
└── connection/
    └── mongooseModels.ts         # Schemas do MongoDB
```

---

## 🎯 Método de Nomeclatura

Todos os nomes são em **português** e seguem um padrão:

### Métodos (Verbos)

- `obter*` = buscar algo
- `definir*` = modificar algo
- `listar` = listar tudo
- `criar` = criar novo
- `deletar` = deletar

### Classes

- `ModeloBase` = classe que todo modelo herda
- `RepositorioBase` = classe que todo repositório herda
- `LivroModelo` = classe que representa um Livro
- `RepositorioLivro` = repositório de Livro
- `ServicoLivro` = serviço de Livro

### Variáveis

- `livro` = uma instância do Livro
- `livros` = array de Livros
- `novoLivro` = novo Livro que vai ser criado
- `livroDeleted` = Livro que foi deletado

---

## 🚀 Exemplo Prático: Criar um Livro

### Código do Controller (recebe requisição HTTP):

```typescript
async function criar(req: Request, res: Response) {
  try {
    const corpo = req.body;
    
    // 1. Validar
    const erros = regras.check({ titulo: corpo.titulo }, { isbn: corpo.isbn });
    if (erros) return res.send_badRequest("Dados inválidos", erros);
    
    // 2. Criar modelo
    const livro = new LivroModelo({
      titulo: corpo.titulo,
      isbn: corpo.isbn
    });
    
    // 3. Chamar serviço
    const livroSalvo = await servicoLivro.criar(livro);
    
    // 4. Responder
    return res.send_created("Livro criado!", livroSalvo.paraJSON());
  } catch (erro) {
    return tratarErroHttp(res, erro);
  }
}
```

### Código do Serviço (regras de negócio):

```typescript
async criar(livro: LivroModelo): Promise<LivroModelo> {
  // Validar se ISBN já existe
  const livroExistente = await this.repositorio.obterPorISBN(livro.obterISBN());
  if (livroExistente) {
    throw new Error("ISBN já existe!");
  }
  
  // Chamar repositório para salvar
  return await this.repositorio.criar(livro);
}
```

### Código do Repositório (acesso ao banco):

```typescript
async criar(livro: LivroModelo): Promise<LivroModelo | null> {
  // Salvar no MongoDB
  const documento = await this.bd.create(livro.obterDados());
  if (!documento) return null;
  
  // Converter para modelo e retornar
  return this.converterParaModelo(documento);
}
```

### Código do Modelo (apenas dados):

```typescript
export default class LivroModelo extends ModeloBase {
  private titulo: string;
  private isbn: number;
  
  constructor(dados: DadosLivro) {
    super();
    this.titulo = dados.titulo;
    this.isbn = dados.isbn;
  }
  
  obterISBN() { return this.isbn; }
  obterTitulo() { return this.titulo; }
  obterDados() { return { titulo: this.titulo, isbn: this.isbn }; }
}
```

---

## ✅ Benefícios dessa Arquitetura

1. **Fácil de entender**: Cada camada tem uma responsabilidade clara
2. **Fácil de testar**: Pode mockar repositório sem precisar do banco
3. **Fácil de mudar**: Se mudar de MongoDB para PostgreSQL, só muda o repositório
4. **Sem duplicação**: Lógica de negócio é escrita uma vez e reutilizada
5. **Escalável**: Fácil adicionar novas features sem quebrar o existente

---

## 📝 Resumo

| Camada | Responsabilidade | Exemplo |
|--------|-----------------|---------|
| **Modelo** | Guardar dados | `LivroModelo` com titulo e ISBN |
| **Repositório** | Acessar banco | `obterTodos()`, `criar()`, `deletar()` |
| **Serviço** | Regras negócio | Validar se ISBN duplicado |
| **Controller** | HTTP e validação | Receber POST /livro e responder |

---

## 🆘 Dúvidas Comuns

**P: Por que usar `obter*` em vez de `get*`?**
R: Porque o projeto é em português! Deixa mais consistente.

**P: Para que serve `paraJSON()`?**
R: Converte o Modelo para um objeto que pode ser enviado como resposta HTTP.

**P: Por que o Repositório não usa `get` e `set`?**
R: Porque em TypeScript, `private _campo` com getters/setters é mais complicado. `obter*` e `definir*` é mais simples e explícito.

**P: Posso criar um Livro direto sem passar pelo Serviço?**
R: Tecnicamente sim, mas NÃO FAÇA! O Serviço tem validações importantes. O Controller sempre deve chamar o Serviço.

---

Pronto! O código agora está mais simples e em português! 🎉
