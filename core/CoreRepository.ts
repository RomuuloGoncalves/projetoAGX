import mongoose from "mongoose";
import ModeloBase from "./CoreModel.ts";

// Classe base para repositórios (acesso ao banco de dados)
// Fornece operações CRUD básicas (Criar, Ler, Atualizar, Deletar)
export default abstract class RepositorioBase {
  // O schema do MongoDB para esta entidade
  protected bd: mongoose.Model<mongoose.AnyObject>;

  constructor(bd: mongoose.Model<mongoose.AnyObject>) {
    this.bd = bd;
  }

  // Método abstrato que cada repositório deve implementar
  // Converte dados do banco em um objeto Model
  protected abstract converterParaModelo(
    documento: Record<string, unknown>,
  ): ModeloBase;

  // Listar todos os registros
  async obterTodos(): Promise<ModeloBase[]> {
    const documentos = await this.bd.find().lean();
    return documentos.map((doc) =>
      this.converterParaModelo(doc as Record<string, unknown>)
    );
  }

  // Buscar um registro por ID
  async obterPorId(id: string): Promise<ModeloBase | null> {
    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const documento = await this.bd.findById(id).lean();
    if (!documento) {
      return null;
    }

    return this.converterParaModelo(documento as Record<string, unknown>);
  }

  // Criar um novo registro
  async criar(modelo: ModeloBase): Promise<ModeloBase | null> {
    const documento = await this.bd.create(modelo.obterDados());
    if (!documento) {
      return null;
    }

    return this.converterParaModelo(
      documento.toObject() as Record<string, unknown>,
    );
  }

  // Deletar um registro por ID
  async deletarPorId(id: string): Promise<ModeloBase | null> {
    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const documento = await this.bd.findByIdAndDelete(id).lean();
    if (!documento) {
      return null;
    }

    return this.converterParaModelo(documento as Record<string, unknown>);
  }
}
