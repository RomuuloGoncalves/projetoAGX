import throwlhos from "throwlhos";
import EmprestimoModelo from "../../models/emprestimo.ts";
import EmprestimoRepository from "./emprestimoRepository.ts";

// Serviço para lógica de negócio dos empréstimos
export default class EmprestimoService {
  private readonly repositorio: EmprestimoRepository;

  constructor(repositorio: EmprestimoRepository) {
    this.repositorio = repositorio;
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
    const emprestimoCriado = await this.repositorio.criar(emprestimo);
    if (!emprestimoCriado) {
      throw throwlhos.default.err_internalServerError("Falha ao criar empréstimo.");
    }
    return emprestimoCriado;
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
