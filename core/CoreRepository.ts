import mongoose from "mongoose";
import ModeloBase from "./CoreModel.ts";

// Classe para acesso ao banco de dados -> CRUD
export default abstract class RepositoryBase<T extends ModeloBase> {
  // O schema do MongoDB para esta entidade
  protected bd: mongoose.Model<mongoose.AnyObject>;

  constructor(bd: mongoose.Model<mongoose.AnyObject>) {
    this.bd = bd;
  }

  // Todo repository precisa conseguir conveter o documento do banco para um objeto instânciado
  protected abstract converterParaModelo(documento: Record<string, unknown>): T;

  // Listar todos os registros
  async obterTodos(): Promise<T[]> {
    const documentos = await this.bd.find().lean();
    return documentos.map((doc) =>
      this.converterParaModelo(doc as Record<string, unknown>)
    );
  }

  // Buscar um registro por ID
  async obterPorId(id: string): Promise<T | null> {
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
  async criar(modelo: T, options?: mongoose.SaveOptions): Promise<T | null> {
    const documentos = await this.bd.create([modelo.obterDados()], options);
    if (!documentos || documentos.length === 0) {
      return null;
    }

    return this.converterParaModelo(
      documentos[0].toObject() as Record<string, unknown>,
    );
  }

  // Atualizar um registro por ID
  async atualizarPorId(id: string, dados: Partial<Record<string, unknown>>, options?: mongoose.QueryOptions): Promise<T | null> {
    // Valida se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const documento = await this.bd.findByIdAndUpdate(id, dados, { new: true, ...options }).lean();
    if (!documento) {
      return null;
    }

    return this.converterParaModelo(documento as Record<string, unknown>);
  }

  // Deletar um registro por ID
  async deletarPorId(id: string): Promise<T | null> {
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
