import mongoose from "mongoose";
import RepositoryBase from "../../core/CoreRepository.ts";
import EmprestimoModelo, { StatusEmprestimo } from "../../models/emprestimo.ts";

// Repositório para acessar empréstimos no banco de dados
export default class EmprestimoRepository
  extends RepositoryBase<EmprestimoModelo> {
  constructor(mongoDB: mongoose.Model<mongoose.AnyObject>) {
    super(mongoDB);
  }

  // Converte um documento do MongoDB para um EmprestimoModelo
  protected converterParaModelo(documento: Record<string, unknown>): EmprestimoModelo {
    const status = String(documento.status ?? "ativo") as StatusEmprestimo;
    const dataDevolucao = documento.data_devolucao ? new Date(String(documento.data_devolucao)) : null;

    return new EmprestimoModelo({
      id: String(documento._id ?? ""),
      usuarioId: String(documento.usuario_id ?? ""),
      livroId: String(documento.livro_id ?? ""),
      dataEmprestimo: new Date(String(documento.data_emprestimo ?? new Date())),
      dataDevolucao,
      status,
    });
  }
}
