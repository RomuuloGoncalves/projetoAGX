import throwlhos from "throwlhos";
import AutorModelo from "../../models/autor.ts";
import AutorRepository from "./autorRepository.ts";

export default class AutorService {
  private readonly repositorio: AutorRepository;

  constructor(repositorio: AutorRepository) {
    this.repositorio = repositorio;
  }

  // Listar todos os autores
  listar(): Promise<AutorModelo[]> {
    return this.repositorio.obterTodos();
  }

  // Obter um autor pelo ID
  async obterPorId(autorId: string): Promise<AutorModelo> {
    const autor = await this.repositorio.obterPorId(autorId);
    if (!autor) {
      throw throwlhos.default.err_badRequest("Autor não encontrado.");
    }
    return autor;
  }

  // Criar um novo autor
  async criar(autor: AutorModelo): Promise<AutorModelo> {
    const autorCriado = await this.repositorio.criar(autor);
    if (!autorCriado) {
      throw throwlhos.default.err_internalServerError("Falha ao criar autor.");
    }
    return autorCriado;
  }

  // Atualizar um autor
  async atualizar(autorId: string, dados: Partial<Record<string, unknown>>): Promise<AutorModelo> {
    const autorAtualizado = await this.repositorio.atualizarPorId(autorId, dados);
    if (!autorAtualizado) {
      throw throwlhos.default.err_badRequest("Autor não encontrado.");
    }
    return autorAtualizado;
  }

  // Deletar um autor
  async deletar(autorId: string): Promise<AutorModelo> {
    const autorDeletado = await this.repositorio.deletarPorId(autorId);
    if (!autorDeletado) {
      throw throwlhos.default.err_badRequest("Autor não encontrado.");
    }
    return autorDeletado;
  }
}
