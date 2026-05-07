import requestCheck from "request-check";
import * as isness from "@zarco/isness";
import { Request, Response } from "express";
import { AutorMongoDB } from "../../connection/mongooseModels.ts";
import AutorModelo from "../../models/autor.ts";
import { tratarErroHttp } from "../httpErrorHandler.ts";
import AutorRepository from "./autorRepository.ts";
import AutorService from "./autorService.ts";

const regras = requestCheck.default();

regras.addRules("nome", [{
  validator: (nome: string) => isness.string(nome) && nome.trim().length > 0,
  message: "O nome precisa ser um texto válido",
}]);

regras.addRules("nacionalidade", [{
  validator: (nacionalidade: string) =>
    isness.string(nacionalidade) && nacionalidade.trim().length > 0,
  message: "A nacionalidade precisa ser um texto válido",
}]);

export const repositorioAutor = new AutorRepository(AutorMongoDB);
export const servicoAutor = new AutorService(repositorioAutor);

// Função auxiliar para extrair o ID do autor da requisição
function obterIdAutor(request: Request): string | null {
  // Tenta pegar do URL (/autor/:autorId)
  const autorIdDoParams = request.params.autorId;
  if (autorIdDoParams) return autorIdDoParams;

  // Tenta pegar do corpo da requisição
  const corpo = request.body as { _id?: unknown; id?: unknown };
  if (corpo?._id && typeof corpo._id === "string") return corpo._id;
  if (corpo?.id && typeof corpo.id === "string") return corpo.id;
  return null;
}

// GET /autor - Listar todos os autores
async function listar(_request: Request, response: Response) {
  try {
    // Chamar serviço para listar
    const autores = await servicoAutor.listar();
    // Responder com sucesso
    return response.send_ok("Autores listados com sucesso", autores);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// GET /autor/:autorId - Buscar um autor por ID
async function buscar(request: Request, response: Response) {
  try {
    // Extrair ID do URL
    const autorId = obterIdAutor(request);
    if (!autorId) {
      return response.send_badRequest("ID do autor não informado.");
    }

    // Chamar serviço para buscar
    const autor = await servicoAutor.obterPorId(autorId);
    // Responder com sucesso
    return response.send_ok("Autor encontrado", autor);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// POST /autor - Criar um novo autor
async function criar(request: Request, response: Response) {
  try {
    const corpo = request.body as Record<string, unknown>;
    
    // Validar dados enviados
    const erros = regras.check(
      { nome: corpo.nome },
      { nacionalidade: corpo.nacionalidade },
    );

    if (erros) {
      return response.send_badRequest("Dados inválidos", erros);
    }

    // Criar objeto AutorModelo
    const autor = new AutorModelo({
      nome: String(corpo.nome),
      nacionalidade: String(corpo.nacionalidade),
    });

    // Chamar serviço para criar
    const autorCriado = await servicoAutor.criar(autor);
    // Responder com sucesso
    return response.send_created("Autor criado com sucesso", autorCriado);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// DELETE /autor/:autorId - Deletar um autor
async function deletar(request: Request, response: Response) {
  try {
    // Extrair ID do URL
    const autorId = obterIdAutor(request);
    if (!autorId) {
      return response.send_badRequest("ID do autor não informado.");
    }

    // Chamar serviço para deletar
    const autorDeletado = await servicoAutor.deletar(autorId);
    // Responder com sucesso
    return response.send_ok("Autor excluído", { id: autorDeletado.obterID() });
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// PUT /autor/:autorId - Atualizar um autor
async function atualizar(request: Request, response: Response) {
  try {
    const autorId = obterIdAutor(request);
    if (!autorId) {
      return response.send_badRequest("ID do autor não informado.");
    }

    const corpo = request.body as Partial<Record<string, unknown>>;
    
    delete corpo.id;
    delete corpo._id;

    const autorAtualizado = await servicoAutor.atualizar(autorId, corpo);
    return response.send_ok("Autor atualizado com sucesso", autorAtualizado);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// Exportar funções para o servidor
export { listar, buscar, criar, deletar, atualizar };
