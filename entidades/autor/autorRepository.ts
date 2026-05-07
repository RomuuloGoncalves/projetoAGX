import mongoose from "mongoose";
import RepositoryBase from "../../core/CoreRepository.ts";
import AutorModelo from "../../models/autor.ts";

// Repositório para acessar autores no banco de dados
export default class AutorRepository extends RepositoryBase<AutorModelo> {
  constructor(mongoDB: mongoose.Model<mongoose.AnyObject>) {
    super(mongoDB);
  }

  // Converte um documento do MongoDB para um AutorModelo
  protected converterParaModelo(documento: Record<string, unknown>): AutorModelo {
    return new AutorModelo({
      id: String(documento._id ?? ""),
      nome: String(documento.nome ?? ""),
      nacionalidade: String(documento.nacionalidade ?? ""),
    });
  }
}

