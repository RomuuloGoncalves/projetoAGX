import throwlhos from "throwlhos";
import mongoose from "mongoose";
import EmprestimoModelo from "../../models/emprestimo.ts";
import EmprestimoRepository from "./emprestimoRepository.ts";
import LivroRepository from "../livro/livroRepository.ts";
import { conn } from "../../connection/conn.ts";

// Serviço para lógica de negócio dos empréstimos
export default class EmprestimoService {
  private readonly repositorio: EmprestimoRepository;
  private readonly livroRepositorio: LivroRepository;

  constructor(repositorio: EmprestimoRepository, livroRepositorio: LivroRepository) {
    this.repositorio = repositorio;
    this.livroRepositorio = livroRepositorio;
  }

  // Listar todos os empréstimos
  listar(): Promise<EmprestimoModelo[]> {
    return this.repositorio.obterTodos();
  }

  // Obter um empréstimo pelo ID
  async obterPorId(emprestimoId: string): Promise<EmprestimoModelo> {
    const emprestimo = await this.repositorio.obterPorId(emprestimoId);
    if (!emprestimo) {
      throw throwlhos.default.err_badRequest("Empréstimo não encontrado.");
    }
    return emprestimo;
  }

  // Criar um novo empréstimo
  async criar(emprestimo: EmprestimoModelo): Promise<EmprestimoModelo> {
    const session = await conn.mongoose.startSession();
    session.startTransaction();

    try {
      // ver se é possível emprestar
      const livro = await this.livroRepositorio.obterPorId(emprestimo.obterLivroId());
      if (!livro) {
        throw throwlhos.default.err_notFound("Livro informado não existe.");
      }

      if (livro.obterQuantidadeDisponivel() <= 0) {
        throw throwlhos.default.err_badRequest("Livro não possui unidades disponíveis para empréstimo.");
      }

      // diminuir a quantidade
      const novaQuantidade = livro.obterQuantidadeDisponivel() - 1;
      await this.livroRepositorio.atualizarPorId(livro.obterID()!, { quantidade_disponivel: novaQuantidade }, { session });

      // Criar o empréstimo
      const emprestimoCriado = await this.repositorio.criar(emprestimo, { session });
      if (!emprestimoCriado) {
        throw throwlhos.default.err_internalServerError("Falha ao criar empréstimo.");
      }

      await session.commitTransaction();
      return emprestimoCriado;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  // Atualizar um empréstimo
  async atualizar(emprestimoId: string, dados: Partial<Record<string, unknown>>): Promise<EmprestimoModelo> {
    const session = await conn.mongoose.startSession();
    session.startTransaction();

    try {
      const emprestimoAtual = await this.repositorio.obterPorId(emprestimoId);
      if (!emprestimoAtual) {
        throw throwlhos.default.err_notFound("Empréstimo não encontrado.");
      }

      // Se está tentando atualizar o status para devolvido
      if (dados.status === "devolvido" && emprestimoAtual.obterDados().status === "ativo") {
        const livro = await this.livroRepositorio.obterPorId(emprestimoAtual.obterLivroId());
        if (livro) {
          const novaQuantidade = livro.obterQuantidadeDisponivel() + 1;
          await this.livroRepositorio.atualizarPorId(livro.obterID()!, { quantidade_disponivel: novaQuantidade }, { session });
        }
      } else if (dados.status === "ativo" && emprestimoAtual.obterDados().status === "devolvido") {
        // Se por algum motivo voltar para ativo
        const livro = await this.livroRepositorio.obterPorId(emprestimoAtual.obterLivroId());
        if (livro) {
          const novaQuantidade = livro.obterQuantidadeDisponivel() - 1;
          await this.livroRepositorio.atualizarPorId(livro.obterID()!, { quantidade_disponivel: novaQuantidade }, { session });
        }
      }

      const emprestimoAtualizado = await this.repositorio.atualizarPorId(emprestimoId, dados, { session });
      if (!emprestimoAtualizado) {
        throw throwlhos.default.err_badRequest("Falha ao atualizar empréstimo.");
      }

      await session.commitTransaction();
      return emprestimoAtualizado;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  // Deletar um empréstimo
  async deletar(emprestimoId: string): Promise<EmprestimoModelo> {
    const emprestimoDeletado = await this.repositorio.deletarPorId(emprestimoId);
    if (!emprestimoDeletado) {
      throw throwlhos.default.err_badRequest("Empréstimo não encontrado.");
    }
    return emprestimoDeletado;
  }
}
