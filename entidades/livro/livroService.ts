import throwlhos from "throwlhos";
import LivroModelo from "../../models/livro.ts";
import LivroRepository from "./livroRepository.ts";

// Serviço de Livros - contém as regras de negócio
export default class LivroService {
  private repositorio: LivroRepository;
  private autorRepositorio?: { obterPorId(id: string): Promise<unknown> };

  constructor(repositorio: LivroRepository, autorRepositorio?: { obterPorId(id: string): Promise<unknown> }) {
    this.repositorio = repositorio;
    this.autorRepositorio = autorRepositorio;
  }

  // Listar todos os livros
  listar(): Promise<LivroModelo[]> {
    return this.repositorio.obterTodos();
  }

  // Buscar um livro pelo ID
  async obterPorId(livroId: string): Promise<LivroModelo> {
    const livro = await this.repositorio.obterPorId(livroId);
    
    if (!livro) {
      throw throwlhos.default.err_badRequest("Livro não encontrado.");
    }
    
    return livro;
  }

  // Criar um novo livro
  async criar(livro: LivroModelo): Promise<LivroModelo> {
    const livroExistente = await this.repositorio.obterPorISBN(livro.obterISBN());
    
    if (livroExistente) {
      throw throwlhos.default.err_conflict(
        `Já existe um livro com o ISBN "${livro.obterISBN()}".`,
        { id: livroExistente.obterID() },
      );
    }

    if (this.autorRepositorio) {
      const autorId = livro.obterAutorId();
      if (!autorId) {
        throw throwlhos.default.err_badRequest("O ID do autor é obrigatório.");
      }
      const autor = await this.autorRepositorio.obterPorId(autorId);
      if (!autor) {
        throw throwlhos.default.err_badRequest("Autor informado não existe.");
      }
    }

    const novoLivro = await this.repositorio.criar(livro);
    if (!novoLivro) {
      throw throwlhos.default.err_internalServerError("Falha ao criar livro.");
    }
    return novoLivro;
  }

  // Atualizar um livro
  async atualizar(livroId: string, dados: Partial<Record<string, unknown>>): Promise<LivroModelo> {
    const livroAtualizado = await this.repositorio.atualizarPorId(livroId, dados);
    
    if (!livroAtualizado) {
      throw throwlhos.default.err_badRequest("Livro não encontrado.");
    }
    
    return livroAtualizado;
  }

  // Deletar um livro
  async deletar(livroId: string): Promise<LivroModelo> {
    const livroDeleted = await this.repositorio.deletarPorId(livroId);
    
    if (!livroDeleted) {
      throw throwlhos.default.err_badRequest("Livro não encontrado.");
    }
    
    return livroDeleted;
  }
}
