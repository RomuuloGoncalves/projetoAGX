import AutorModelo from "../../models/autor.ts";
import RepositorioAutor from "./autorRepository.ts";

// Serviço para lógica de negócio dos autores
export default class ServicoAutor {
  private readonly repositorio: RepositorioAutor;

  constructor(repositorio: RepositorioAutor) {
    this.repositorio = repositorio;
  }

  // Listar todos os autores
  async listar(): Promise<AutorModelo[]> {
    return this.repositorio.obterTodos();
  }

  // Obter um autor pelo ID
  async obterPorId(autorId: string): Promise<AutorModelo> {
    const autor = await this.repositorio.obterPorId(autorId);
    if (!autor) {
      const erro = new Error("Autor não encontrado") as any;
      erro.code = 400;
      throw erro;
    }
    return autor;
  }

  // Criar um novo autor
  async criar(autor: AutorModelo): Promise<AutorModelo> {
    const autorCriado = await this.repositorio.criar(autor);
    if (!autorCriado) {
      const erro = new Error("Falha ao criar autor") as any;
      erro.code = 500;
      throw erro;
    }
    return autorCriado;
  }

  // Deletar um autor
  async deletar(autorId: string): Promise<AutorModelo> {
    const autorDeletado = await this.repositorio.deletarPorId(autorId);
    if (!autorDeletado) {
      const erro = new Error("Autor não encontrado") as any;
      erro.code = 400;
      throw erro;
    }
    return autorDeletado;
  }
}
