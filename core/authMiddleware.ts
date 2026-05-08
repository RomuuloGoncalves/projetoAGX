import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";
import { estaNaBlacklist } from "./tokenBlacklist.ts";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.send_unauthorized("Token não fornecido");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.send_unauthorized("Token mal formatado");
  }

  const token = parts[1];

  if (estaNaBlacklist(token)) {
    return res.send_unauthorized("Token revogado. Faça login novamente.");
  }

  try {
    const secret = env.jwt_secret || "super_secret_jwt_key_agx_biblioteca";
    const decoded = jwt.verify(token, secret);
    res.locals.usuario = decoded;
    return next();
  } catch (_err) {
    return res.send_unauthorized("Token inválido ou expirado");
  }
}
