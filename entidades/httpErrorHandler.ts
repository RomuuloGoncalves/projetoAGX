import type { Response } from "express";

// Trata erros HTTP de forma padronizada
export function tratarErroHttp(response: Response, erro: unknown) {
  const erroTipado = erro as {
    code?: number;
    statusCode?: number;
    message?: string;
    data?: unknown;
  };

  const statusCode = Number(erroTipado.code ?? erroTipado.statusCode ?? 500);
  const mensagem = erroTipado.message ?? "Erro interno";

  if (statusCode === 400) {
    return response.send_badRequest(mensagem, erroTipado.data);
  }

  if (statusCode === 401) {
    return response.send_unauthorized(mensagem);
  }

  if (statusCode === 403) {
    return response.send_forbidden(mensagem);
  }

  if (statusCode === 404) {
    return response.send_notFound(mensagem);
    
  }

  if (statusCode === 409) {
    if (response.send_conflict) {
      return response.send_conflict(mensagem, erroTipado.data);
    }
  }

  return response.send_internalServerError(mensagem, erroTipado.data ?? erroTipado);
}

