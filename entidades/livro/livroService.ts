import throwlhos from "throwlhos";
import LivroModelo from "../../models/livro.ts";
import RepositorioLivro from "./livroRepository.ts";

// Serviço de Livros - contém as regras de negócio
export default class ServicoLivro {
  private repositorio: RepositorioLivro;

  constructor(repositorio: RepositorioLivro) {
    this.repositorio = repositorio;
  }

  // Listar todos os livros
  async listar(): Promise<LivroModelo[]> {
    return this.repositorio.obterTodos() as Promise<LivroModelo[]>;
  }

  // Buscar um livro pelo ID
  async obterPorId(livroId: string): Promise<LivroModelo> {
    const livro = await this.repositorio.obterPorId(livroId);
    if (!livro) {
      throw throwlhos.default.err_badRequest("Livro não encontrado.");
    }
    return livro as LivroModelo;
  }

  // Criar um novo livro
  async criar(livro: LivroModelo): Promise<LivroModelo> {
    // Verifica se já existe um livro com o mesmo ISBN
    const livroExistente = await this.repositorio.obterPorISBN(livro.obterISBN());
    if (livroExistente) {
      throw throwlhos.default.err_conflict(
        `Já existe um livro com o ISBN "${livro.obterISBN()}".`,
        { id: livroExistente.obterID() },
      );
    }

    const novoLivro = await this.repositorio.criar(livro);
    if (!novoLivro) {
      throw throwlhos.default.err_internalServerError("Falha ao criar livro.");
    }
    return novoLivro as LivroModelo;
  }

  // Deletar um livro
  async deletar(livroId: string): Promise<LivroModelo> {
    const livroDeleted = await this.repositorio.deletarPorId(livroId);
    if (!livroDeleted) {
      throw throwlhos.default.err_badRequest("Livro não encontrado.");
    }
    return livroDeleted as LivroModelo;
  }
}
