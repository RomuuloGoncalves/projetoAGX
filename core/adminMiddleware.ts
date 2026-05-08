import { Request, Response, NextFunction } from "express";

export function adminMiddleware(_req: Request, res: Response, next: NextFunction) {
  const usuario = res.locals.usuario;

  if (!usuario || usuario.role !== "admin") {
    return res.send_forbidden("Acesso negado. Apenas bibliotecários (admin) podem acessar este recurso.");
  }

  return next();
}
