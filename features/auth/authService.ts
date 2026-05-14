import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import throwlhos from "throwlhos";
import { env } from "../../config/env.ts";
import { repositorioUsuario } from "../usuario/usuarioController.ts";

export default class AuthService {
  async login(email: string, senhaPlana: string) {
    const usuario = await repositorioUsuario.obterPorEmail(email);
    
    if (!usuario) {
      throw throwlhos.default.err_unauthorized("E-mail ou senha incorretos.");
    }

    const senhaValida = bcryptjs.compareSync(senhaPlana, usuario.obterSenha());
    
    if (!senhaValida) {
      throw throwlhos.default.err_unauthorized("E-mail ou senha incorretos.");
    }

    // Gerar Token
    const secret = env.jwt_secret || "super_secret_jwt_key_agx_biblioteca";
    const token = jwt.sign(
      { 
        id: usuario.obterID(),
        email: usuario.obterEmail(),
        nome: usuario.obterNome(),
        role: usuario.obterRole()
      },
      secret,
      { expiresIn: "1d" }
    );

    return {
      usuario: usuario.paraJSON(),
      token
    };
  }
}
