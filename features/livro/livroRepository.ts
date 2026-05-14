import mongoose from "mongoose";
import RepositoryBase from "../../core/CoreRepository.ts";
import LivroModelo from "../../models/livro.ts";

// Repositório de Livros - acessa o banco de dados
export default class LivroRepository extends RepositoryBase<LivroModelo> {
  constructor(bd: mongoose.Model<mongoose.AnyObject>) {
    super(bd);
  }

  // Converte um documento do banco em um objeto LivroModelo
  protected converterParaModelo(documento: Record<string, unknown>): LivroModelo {
    return new LivroModelo({
      id: String(documento._id ?? ""),
      autorId: documento.autor_id ? String(documento.autor_id) : undefined,
      titulo: String(documento.titulo ?? ""),
      isbn: Number(documento.isbn ?? 0),
      ano: Number(documento.ano ?? 0),
      quantidadeTotal: Number(documento.quantidade_total ?? 0),
      quantidadeDisponivel: Number(documento.quantidade_disponivel ?? 0),
    });
  }

  async obterPorISBN(isbn: number): Promise<LivroModelo | null> {
    const documento = await this.bd.findOne({ isbn }).lean();
    if (!documento) return null;
    return this.converterParaModelo(documento as Record<string, unknown>);
  }
}
