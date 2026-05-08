import requestCheck from "request-check";
import * as isness from "@zarco/isness";
import { Request, Response } from "express";
import { UsuarioMongoDB } from "../../connection/mongooseModels.ts";
import UsuarioModelo from "../../models/usuario.ts";
import { tratarErroHttp } from "../httpErrorHandler.ts";
import UsuarioRepository from "./usuarioRepository.ts";
import UsuarioService from "./usuarioService.ts";

const regras = requestCheck.default();

regras.addRules("nome", [{
  validator: (nome: string) => isness.string(nome) && nome.trim().length > 0,
  message: "O nome precisa ser um texto válido",
}]);

regras.addRules("email", [{
  validator: (email: string) => isness.email(email),
  message: "E-mail inválido",
}]);

regras.addRules("senha", [{
  validator: (senha: string) => (isness.alphanumeric(senha) || isness.number(senha)),
  message: "A senha precisa ser alfanumérica",
}, {
  validator: (senha: string) => senha.length >= 8,
  message: "A senha precisa ter pelo menos 8 caracteres",
}]);

regras.addRules("cpf", [{
  validator: (cpf: string) => isness.cpf(cpf),
  message: "CPF inválido",
}]);

regras.addRules("data_nascimento", [{
  validator: (dataNascimento: string) => isness.date(dataNascimento),
  message: "Data de Nascimento inválida",
}]);

// Criar instâncias (exportadas para uso em server.ts)
export const repositorioUsuario = new UsuarioRepository(UsuarioMongoDB);
export const servicoUsuario = new UsuarioService(repositorioUsuario);

function obterIdUsuario(request: Request): string | null {

  const usuarioIdDoParams = request.params.usuarioId;
  if (usuarioIdDoParams) return usuarioIdDoParams;

  const corpo = request.body as { _id?: unknown; id?: unknown };
  if (corpo?._id && typeof corpo._id === "string") return corpo._id;
  if (corpo?.id && typeof corpo.id === "string") return corpo.id;
  return null;
}

// GET /usuario - Listar todos os usuários
async function listar(_request: Request, response: Response) {
  try {
    const usuarios = await servicoUsuario.listar();
    return response.send_ok("Usuários listados com sucesso", usuarios);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// GET /usuario/:usuarioId - Buscar um usuário por ID
async function buscar(request: Request, response: Response) {
  try {
    // Extrair ID do URL
    const usuarioId = obterIdUsuario(request);
    if (!usuarioId) {
      return response.send_badRequest("ID do usuário não informado.");
    }

    // Chamar serviço para buscar
    const usuario = await servicoUsuario.obterPorId(usuarioId);
    // Responder com sucesso
    return response.send_ok("Usuário encontrado", usuario);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// POST /usuario - Criar um novo usuário
async function criar(request: Request, response: Response) {
  try {
    const corpo = request.body as Record<string, unknown>;
    
    // Validar dados enviados
    const erros = regras.check(
      { nome: corpo.nome },
      { email: corpo.email },
      { senha: corpo.senha },
      { cpf: corpo.cpf },
      { data_nascimento: corpo.data_nascimento },
    );

    if (erros) {
      return response.send_badRequest("Dados inválidos", erros);
    }

    // Criar objeto UsuarioModelo
    const usuario = new UsuarioModelo({
      nome: String(corpo.nome),
      email: String(corpo.email),
      senha: String(corpo.senha),
      cpf: String(corpo.cpf),
      dataNascimento: new Date(String(corpo.data_nascimento)),
    });

    const usuarioCriado = await servicoUsuario.criar(usuario);
    return response.send_created("Usuário criado com sucesso", usuarioCriado);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// DELETE /usuario/:usuarioId - Deletar um usuário
async function deletar(request: Request, response: Response) {
  try {
    const usuarioId = obterIdUsuario(request);
    if (!usuarioId) {
      return response.send_badRequest("ID do usuário não informado.");
    }

    const usuarioDeletado = await servicoUsuario.deletar(usuarioId);
    return response.send_ok("Usuário excluído", { id: usuarioDeletado.obterID() });
 
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

// PUT /usuario/:usuarioId - Atualizar um usuário
async function atualizar(request: Request, response: Response) {
  try {  
    const usuarioId = obterIdUsuario(request);
    
    if (!usuarioId) {
      return response.send_badRequest("ID do usuário não informado.");
    }

    const corpo = request.body as Partial<Record<string, unknown>>;
    
    delete corpo.id;
    delete corpo._id;

    const usuarioAtualizado = await servicoUsuario.atualizar(usuarioId, corpo);
    return response.send_ok("Usuário atualizado com sucesso", usuarioAtualizado);
  } catch (erro: unknown) {
    return tratarErroHttp(response, erro);
  }
}

export { listar, buscar, criar, deletar, atualizar };
