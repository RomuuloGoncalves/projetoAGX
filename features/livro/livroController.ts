import requestCheck from "request-check";
import * as isness from "@zarco/isness";
import { Request, Response } from "express";
import { LivroMongoDB } from "../../connection/mongooseModels.ts";
import LivroModelo from "../../models/livro.ts";
import { tratarErroHttp } from "../httpErrorHandler.ts";
import LivroRepository from "./livroRepository.ts";
import LivroService from "./livroService.ts";

// validação
const regras = requestCheck.default();

regras.addRules("titulo", [{
  validator: (titulo: string) => isness.string(titulo) && titulo.trim().length > 0,
  message: "O título precisa ser um texto válido",
}]);

regras.addRules("isbn", [{
  validator: (isbn: unknown) => isness.number(isbn),
  message: "ISBN inválido",
}]);

regras.addRules("ano", [{
  validator: (ano: unknown) => isness.number(ano) && Number(ano) > 0,
  message: "Ano inválido",
}]);

regras.addRules("autor_id", [{
  validator: (autor: string) => isness.string(autor) && autor.trim().length > 0,
  message: "O ID do autor precisa ser um texto válido",
}]);

regras.addRules("quantidade_total", [{
  validator: (qtd: unknown) => isness.number(qtd) && Number(qtd) >= 0,
  message: "A quantidade total deve ser um número válido",
}]);

regras.addRules("quantidade_disponivel", [{
  validator: (qtd: unknown) => isness.number(qtd) && Number(qtd) >= 0,
  message: "A quantidade disponível deve ser um número válido",
}]);

import AutorRepository from "../autor/autorRepository.ts";
import { AutorMongoDB } from "../../connection/mongooseModels.ts";

// Criar instâncias do repositório e serviço
export const repositorioLivro = new LivroRepository(LivroMongoDB);
const repositorioAutor = new AutorRepository(AutorMongoDB);
export const servicoLivro = new LivroService(repositorioLivro, repositorioAutor);

// Função auxiliar para obter o ID do livro 
function obterIdLivro(req: Request): string | null {

  if (req.params.livroId) return req.params.livroId;

  const corpo = req.body as { _id?: unknown; id?: unknown };
  if (corpo?._id && typeof corpo._id === "string") return corpo._id;
  if (corpo?.id && typeof corpo.id === "string") return corpo.id;

  return null;
}

// ============= ENDPOINTS =============

// GET /livro - Listar todos os livros
async function listar(_req: Request, res: Response) {
  try {
    const livros = await servicoLivro.listar();
    return res.send_ok("Livros listados com sucesso", livros);
  } catch (erro: unknown) {
    return tratarErroHttp(res, erro);
  }
}

// GET /livro/:livroId - Buscar um livro específico
async function buscar(req: Request, res: Response) {
  try {
    const livroId = obterIdLivro(req);
    if (!livroId) {
      return res.send_badRequest("ID do livro não informado.");
    }

    const livro = await servicoLivro.obterPorId(livroId);
    return res.send_ok("Livro encontrado", livro.paraJSON());
  } catch (erro: unknown) {
    return tratarErroHttp(res, erro);
  }
}

// POST /livro - Criar um novo livro
async function criar(req: Request, res: Response) {
  try {
    const corpo = req.body as Record<string, unknown>;

    // Validar os dados
    const erros = regras.check(
      { titulo: corpo.titulo },
      { isbn: corpo.isbn },
      { ano: corpo.ano },
      { autor_id: corpo.autor_id },
      { quantidade_total: corpo.quantidade_total },
      { quantidade_disponivel: corpo.quantidade_disponivel },
    );

    if (erros) {
      return res.send_badRequest("Dados inválidos", erros);
    }

    // Criar o objeto Livro
    const novoLivro = new LivroModelo({
      titulo: String(corpo.titulo),
      isbn: Number(corpo.isbn),
      ano: Number(corpo.ano),
      autorId: String(corpo.autor_id),
      quantidadeTotal: Number(corpo.quantidade_total),
      quantidadeDisponivel: Number(corpo.quantidade_disponivel),
    });


    const livroSalvo = await servicoLivro.criar(novoLivro);
    return res.send_created("Livro criado com sucesso", livroSalvo.paraJSON());
  } catch (erro: unknown) {
    return tratarErroHttp(res, erro);
  }
}

// DELETE /livro/:livroId - Deletar um livro
async function deletar(req: Request, res: Response) {
  try {
    const livroId = obterIdLivro(req);
    if (!livroId) {
      return res.send_badRequest("ID do livro não informado.");
    }

    const livroDeleted = await servicoLivro.deletar(livroId);
    return res.send_ok("Livro excluído", { id: livroDeleted.obterID() });
  } catch (erro: unknown) {
    return tratarErroHttp(res, erro);
  }
}

// PUT /livro/:livroId - Atualizar um livro
async function atualizar(req: Request, res: Response) {
  try {
    const livroId = obterIdLivro(req);
    if (!livroId) {
      return res.send_badRequest("ID do livro não informado.");
    }

    const corpo = req.body as Partial<Record<string, unknown>>;
    
    // Removendo id do corpo se existir para não dar conflito no banco
    delete corpo.id;
    delete corpo._id;

    const livroAtualizado = await servicoLivro.atualizar(livroId, corpo);
    return res.send_ok("Livro atualizado com sucesso", livroAtualizado.paraJSON());
  } catch (erro: unknown) {
    return tratarErroHttp(res, erro);
  }
}

export { listar, buscar, criar, deletar, atualizar };
