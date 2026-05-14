import mongoose from "mongoose";
import RepositoryBase from "../../core/CoreRepository.ts";
import UsuarioModelo from "../../models/usuario.ts";

export default class UsuarioRepository extends RepositoryBase<UsuarioModelo> {
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
      role: String(documento.role ?? "comum"),
    });
  }

  async obterPorEmail(email: string): Promise<UsuarioModelo | null> {
    const documento = await this.bd.findOne({ email }).lean();
    if (!documento) return null;
    return this.converterParaModelo(documento as Record<string, unknown>);
  }

  async obterPorCPF(cpf: string): Promise<UsuarioModelo | null> {
    const documento = await this.bd.findOne({ cpf }).lean();
    if (!documento) return null;
    return this.converterParaModelo(documento as Record<string, unknown>);
  }
}
