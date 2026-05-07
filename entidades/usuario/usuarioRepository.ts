import mongoose from "mongoose";
import RepositorioBase from "../../core/CoreRepository.ts";
import UsuarioModelo from "../../models/usuario.ts";

// Repositório para acessar usuários no banco de dados
export default class RepositorioUsuario extends RepositorioBase {
  constructor(mongoDB: mongoose.Model<mongoose.AnyObject>) {
    super(mongoDB);
  }

  // Converte um documento do MongoDB para um UsuarioModelo
  protected converterParaModelo(documento: Record<string, unknown>): UsuarioModelo {
    return new UsuarioModelo({
      id: String(documento._id ?? ""),
      nome: String(documento.nome ?? ""),
      email: String(documento.email ?? ""),
      senha: String(documento.senha ?? ""),
      cpf: String(documento.cpf ?? ""),
      dataNascimento: new Date(String(documento.data_nascimento ?? new Date())),
    });
  }

  // Buscar usuário por email (busca customizada)
  async obterPorEmail(email: string): Promise<UsuarioModelo | null> {
    const documento = await this.bd.findOne({ email }).lean();
    if (!documento) return null;
    return this.converterParaModelo(documento as Record<string, unknown>);
  }

  // Buscar usuário por CPF (busca customizada)
  async obterPorCPF(cpf: string): Promise<UsuarioModelo | null> {
    const documento = await this.bd.findOne({ cpf }).lean();
    if (!documento) return null;
    return this.converterParaModelo(documento as Record<string, unknown>);
  }
}
