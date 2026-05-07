import requestCheck from "request-check";
import * as isness from "@zarco/isness";
import { Request, Response } from "express";
import { EmprestimoMongoDB } from "../../connection/mongooseModels.ts";
import EmprestimoModelo from "../../models/emprestimo.ts";
import { tratarErroHttp } from "../httpErrorHandler.ts";
import EmprestimoRepository from "./emprestimoRepository.ts";
import EmprestimoService from "./emprestimoService.ts";

// Criar regras de validação
const regras = requestCheck.default();

// Regra: o ID do usuário deve ser um texto não vazio
regras.addRules("usuario_id", [{
  validator: (usuarioId: string) =>
    isness.string(usuarioId) && usuarioId.trim().length > 0,
  message: "O id do usuário é obrigatório",
}]);

// Regra: o ID do livro deve ser um texto não vazio
regras.addRules("livro_id", [{
  validator: (livroId: string) =>
    isness.string(livroId) && livroId.trim().length > 0,
  message: "O id do livro é obrigatório",
}]);

// Regra: a data de empréstimo deve ser válida
regras.addRules("data_emprestimo", [{
  validator: (dataEmprestimo: string) => isness.date(dataEmprestimo),
  message: "A data de empréstimo precisa ser válida",
}]);

// Criar instâncias (exportadas para uso em server.ts)
export const repositorioEmprestimo = new EmprestimoRepository(
  EmprestimoMongoDB,
);
export const servicoEmprestimo = new EmprestimoService(
  repositorioEmprestimo,
);

// Função auxiliar para extrair o ID do empréstimo da requisição
function obterIdEmprestimo(request: Request): string | null {
  // Tenta pegar do URL (/emprestimo/:emprestimoId)
  const emprestimoIdDoParams = request.params.emprestimoId;
  if (emprestimoIdDoParams) return emprestimoIdDoParams;

  // Tenta pegar do corpo da requisição
  const corpo = request.body as { _id?: unknown; id?: unknown };
  if (corpo?._id && typeof corpo._id === "string") return corpo._id;
  if (corpo?.id && typeof corpo.id === "string") return corpo.id;
  return null;
}

// GET /emprestimo - Listar todos os empréstimos
async function listar(_request: Request, response: Response) {
  try {
    // Chamar serviço para listar
    const emprestimos = await servicoEmprestimo.listar();
    // Responder com sucesso
    return response.send_ok("Empréstimos listados com sucesso", emprestimos);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// GET /emprestimo/:emprestimoId - Buscar um empréstimo por ID
async function buscar(request: Request, response: Response) {
  try {
    // Extrair ID do URL
    const emprestimoId = obterIdEmprestimo(request);
    if (!emprestimoId) {
      return response.send_badRequest("ID do empréstimo não informado.");
    }

    // Chamar serviço para buscar
    const emprestimo = await servicoEmprestimo.obterPorId(emprestimoId);
    // Responder com sucesso
    return response.send_ok("Empréstimo encontrado", emprestimo);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// POST /emprestimo - Criar um novo empréstimo
async function criar(request: Request, response: Response) {
  try {
    const corpo = request.body as Record<string, unknown>;
    
    // Validar dados enviados
    const erros = regras.check(
      { usuario_id: corpo.usuario_id },
      { livro_id: corpo.livro_id },
      { data_emprestimo: corpo.data_emprestimo },
    );

    if (erros) {
      return response.send_badRequest("Dados inválidos", erros);
    }

    // Criar objeto EmprestimoModelo
    const emprestimo = new EmprestimoModelo({
      usuarioId: String(corpo.usuario_id),
      livroId: String(corpo.livro_id),
      dataEmprestimo: new Date(String(corpo.data_emprestimo)),
      dataDevolucao: corpo.data_devolucao
        ? new Date(String(corpo.data_devolucao))
        : null,
      status: corpo.status === "devolvido" ? "devolvido" : "ativo",
    });

    // Chamar serviço para criar
    const emprestimoCriado = await servicoEmprestimo.criar(emprestimo);
    // Responder com sucesso
    return response.send_created(
      "Empréstimo criado com sucesso",
      emprestimoCriado,
    );
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// DELETE /emprestimo/:emprestimoId - Deletar um empréstimo
async function deletar(request: Request, response: Response) {
  try {
    // Extrair ID do URL
    const emprestimoId = obterIdEmprestimo(request);
    if (!emprestimoId) {
      return response.send_badRequest("ID do empréstimo não informado.");
    }

    // Chamar serviço para deletar
    const emprestimoDeletado = await servicoEmprestimo.deletar(emprestimoId);
    // Responder com sucesso
    return response.send_ok("Empréstimo excluído", {
      id: emprestimoDeletado.obterID(),
    });
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// Exportar funções para o servidor
export { listar, buscar, criar, deletar };
