import { Request, Response } from "express";
import requestCheck from "request-check";
import * as isness from "@zarco/isness";
import AuthService from "./authService.ts";
import { tratarErroHttp } from "../httpErrorHandler.ts";
import { adicionarNaBlacklist } from "../../core/tokenBlacklist.ts";

const regras = requestCheck.default();

regras.addRules("email", [{
  validator: (email: string) => isness.email(email),
  message: "E-mail inválido",
}]);

regras.addRules("senha", [{
  validator: (senha: string) => isness.string(senha) && senha.length > 0,
  message: "Senha é obrigatória",
}]);

export const authService = new AuthService();

async function login(req: Request, res: Response) {
  try {
    const corpo = req.body as Record<string, unknown>;

    const erros = regras.check(
      { email: corpo.email },
      { senha: corpo.senha }
    );

    if (erros) {
      return res.send_badRequest("Dados inválidos", erros);
    }

    const resultado = await authService.login(String(corpo.email), String(corpo.senha));

    return res.send_ok("Login realizado com sucesso", resultado);
  } catch (erro: unknown) {
    return tratarErroHttp(res, erro);
  }
}

function logout(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.send_badRequest("Token não fornecido.");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.send_badRequest("Token mal formatado.");
    }

    const token = parts[1];
    adicionarNaBlacklist(token);

    return res.send_ok("Logout realizado com sucesso.");
  } catch (erro: unknown) {
    return tratarErroHttp(res, erro);
  }
}

export { login, logout };

