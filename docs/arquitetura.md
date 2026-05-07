# Documentação de Arquitetura do Projeto

O projeto adota uma arquitetura em camadas focada em responsabilidades bem definidas, utilizando TypeScript. Este documento descreve as quatro camadas principais do sistema: Modelos, Repositórios, Serviços e Controladores.

## 1. Modelo (`models/`)

A camada de Modelo é responsável pela representação das entidades de domínio e manipulação de seus estados em memória. Seus objetos devem possuir getters para leitura e setters para alteração de propriedades. Não possuem lógica de acesso a banco de dados.

**Exemplo (Livro):**

```typescript
import ModeloBase from "../core/CoreModel.ts";

export interface DadosLivro {
  id?: string;
  titulo: string;
  isbn: number;
  ano: number;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
}

export default class LivroModelo extends ModeloBase {
  private id?: string;
  private titulo: string;
  private isbn: number;
  private ano: number;
  private quantidadeTotal: number;
  private quantidadeDisponivel: number;

  constructor(dados: DadosLivro) {
    super();
    this.id = dados.id;
    this.titulo = dados.titulo;
    this.isbn = dados.isbn;
    this.ano = dados.ano;
    this.quantidadeTotal = dados.quantidadeTotal;
    this.quantidadeDisponivel = dados.quantidadeDisponivel;
  }

  obterID() { return this.id; }
  obterTitulo() { return this.titulo; }
  obterISBN() { return this.isbn; }

  // Retorna os dados em formato de objeto para salvar no banco
  obterDados() {
    return {
      titulo: this.titulo,
      isbn: this.isbn,
      ano: this.ano,
      quantidade_total: this.quantidadeTotal,
      quantidade_disponivel: this.quantidadeDisponivel,
    };
  }

  // Prepara os dados para resposta HTTP
  paraJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      isbn: this.isbn,
      ano: this.ano,
      quantidadeTotal: this.quantidadeTotal,
      quantidadeDisponivel: this.quantidadeDisponivel,
    };
  }
}
```

Cada modelo herda de `ModeloBase`, o que obriga a implementação do método `obterDados()` para mapear o as propriedades internas para os campos do banco de dados.

---

## 2. Repositório (`entidades/*/Repository.ts`)

O Repositório gerencia o acesso aos dados, isolando a persistência (MongoDB/Mongoose) das regras de negócio. Qualquer operação de banco de dados deve ser executada exclusivamente nesta camada.

**Exemplo:**

```typescript
import mongoose from "mongoose";
import RepositoryBase from "../../core/CoreRepository.ts";
import LivroModelo from "../../models/livro.ts";

export default class LivroRepository extends RepositoryBase<LivroModelo> {
  constructor(bd: mongoose.Model<mongoose.AnyObject>) {
    super(bd);
  }

  protected converterParaModelo(documento: Record<string, unknown>): LivroModelo {
    return new LivroModelo({
      id: String(documento._id ?? ""),
      titulo: String(documento.titulo ?? ""),
      isbn: Number(documento.isbn ?? 0),
      ano: Number(documento.ano ?? 0),
      quantidadeTotal: Number(documento.quantidade_total ?? 0),
      quantidadeDisponivel: Number(documento.quantidade_disponivel ?? 0),
    });
  }

  async obterPorISBN(isbn: number): Promise<LivroModelo | null> {
    const documento = await this.bd.findOne({ isbn }).lean();
    if (!documento) return null;
    return this.converterParaModelo(documento as Record<string, unknown>);
  }
}
```

Por padrão, a classe herdada `RepositoryBase` já provê operações comuns, como `obterTodos()`, `obterPorId(id)`, `criar(modelo)` e `deletarPorId(id)`.

---

## 3. Serviço (`entidades/*/Service.ts`)

A camada de Serviço implementa estritamente as regras de negócio. Ela não lida com requisições HTTP (req/res) e nem manipula diretamente o banco de dados. Executa validações de estado, lançando erros customizados através de módulos de exceção como o `throwlhos`.

**Exemplo:**

```typescript
import throwlhos from "throwlhos";
import LivroModelo from "../../models/livro.ts";
import LivroRepository from "./livroRepository.ts";

export default class LivroService {
  private repositorio: LivroRepository;

  constructor(repositorio: LivroRepository) {
    this.repositorio = repositorio;
  }

  async criar(livro: LivroModelo): Promise<LivroModelo> {
    const livroExistente = await this.repositorio.obterPorISBN(livro.obterISBN());
    
    // Regra de negócio: Impede que dois livros tenham o mesmo ISBN
    if (livroExistente) {
      throw throwlhos.default.err_conflict(
        `Já existe um livro com o ISBN "${livro.obterISBN()}".`,
        { id: livroExistente.obterID() },
      );
    }

    const novoLivro = await this.repositorio.criar(livro);
    if (!novoLivro) {
      throw throwlhos.default.err_internalServerError("Falha ao criar livro.");
    }
    return novoLivro;
  }

  async deletar(livroId: string): Promise<LivroModelo> {
    const livroDeleted = await this.repositorio.deletarPorId(livroId);
    if (!livroDeleted) {
      throw throwlhos.default.err_badRequest("Livro não encontrado.");
    }
    return livroDeleted;
  }
}
```

---

## 4. Controlador (`entidades/*/Controller.ts`)

O Controlador recebe requisições HTTP (através do Express), atua como barreira de validação dos dados de entrada (payload) utilizando ferramentas como `request-check`, delega o processamento ao seu Serviço, e por fim serializa as respostas de erro ou sucesso para o cliente.

**Exemplo:**

```typescript
import requestCheck from "request-check";
import * as isness from "@zarco/isness";
import { Request, Response } from "express";
import LivroModelo from "../../models/livro.ts";
import { tratarErroHttp } from "../httpErrorHandler.ts";
import { servicoLivro } from "./configLivro.ts"; // Exemplo simplificado de injeção

const regras = requestCheck.default();

regras.addRules("titulo", [{
  validator: (titulo: string) => isness.string(titulo) && titulo.trim().length > 0,
  message: "O título precisa ser um texto válido",
}]);

async function criar(req: Request, res: Response) {
  try {
    const corpo = req.body as Record<string, unknown>;

    // 1. Validar os dados
    const erros = regras.check(
      { titulo: corpo.titulo },
      { isbn: corpo.isbn },
      { ano: corpo.ano },
      { quantidade_total: corpo.quantidade_total },
      { quantidade_disponivel: corpo.quantidade_disponivel },
    );

    if (erros) {
      return res.send_badRequest("Dados inválidos", erros);
    }

    // 2. Instanciar o modelo de domínio
    const novoLivro = new LivroModelo({
      titulo: String(corpo.titulo),
      isbn: Number(corpo.isbn),
      ano: Number(corpo.ano),
      quantidadeTotal: Number(corpo.quantidade_total),
      quantidadeDisponivel: Number(corpo.quantidade_disponivel),
    });

    // 3. Acionar a camada de serviço
    const livroSalvo = await servicoLivro.criar(novoLivro);

    // 4. Retornar resposta ao cliente
    return res.send_created("Livro criado com sucesso", livroSalvo.paraJSON());
  } catch (erro: unknown) {
    return tratarErroHttp(res, erro);
  }
}
```

---

## Fluxo da Aplicação

1. **Requisição HTTP**: Chega ao **Controlador**.
2. **Validação**: O Controlador verifica o payload (tipos, campos requeridos).
3. **Mapeamento**: O Controlador transfere as propriedades do body para a instância de um **Modelo**.
4. **Regras de Negócio**: O **Serviço** é chamado, executando validações de domínio (ex: checar duplicidade de documento).
5. **Persistência**: O Serviço chama o **Repositório**, que serializa o modelo para os formatos do banco e executa a "query".
6. **Retorno**: O Repositório devolve o resultado atualizado via método do modelo, repassando do Serviço para o Controlador.
7. **Resposta**: O Controlador converte o resultado em JSON formatado (`paraJSON()`) e retorna o status code apropriado.

## Padrões de Nomenclatura Adotados

Todas as implementações adotam a semântica de língua portuguesa tanto para variáveis quanto para os métodos e convenções internas:

* **Classes de Domínio**: Uso de sufixos `Modelo`, `Repository`, `Service`. (ex: `LivroModelo`, `LivroRepository`).
* **Regras de Banco**: Métodos em repositório utilizam verbos de obtenção e modificação: `obterTodos`, `obterPorId`, `criar`, `deletarPorId`.
* **Getters e Setters**: Os Modelos aplicam fortemente o uso de verbos semânticos para acessar os dados sensíveis: `obterTitulo()`, `definirTitulo()`.

O isolamento provê flexibilidade na arquitetura, simplificando a confecção de testes unitários em lógica de negócio e substituindo as soluções de dados com atrito mínimo.
