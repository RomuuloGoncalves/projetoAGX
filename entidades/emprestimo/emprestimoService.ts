import EmprestimoModelo from "../../models/emprestimo.ts";
import RepositorioEmprestimo from "./emprestimoRepository.ts";

// Serviço para lógica de negócio dos empréstimos
export default class ServicoEmprestimo {
  private readonly repositorio: RepositorioEmprestimo;

  constructor(repositorio: RepositorioEmprestimo) {
    this.repositorio = repositorio;
  }

  // Listar todos os empréstimos
  async listar(): Promise<EmprestimoModelo[]> {
    return this.repositorio.obterTodos();
  }

  // Obter um empréstimo pelo ID
  async obterPorId(emprestimoId: string): Promise<EmprestimoModelo> {
    const emprestimo = await this.repositorio.obterPorId(emprestimoId);
    if (!emprestimo) {
      const erro = new Error("Empréstimo não encontrado") as any;
      erro.code = 400;
      throw erro;
    }
    return emprestimo;
  }

  // Criar um novo empréstimo
  async criar(emprestimo: EmprestimoModelo): Promise<EmprestimoModelo> {
    const emprestimoCriado = await this.repositorio.criar(emprestimo);
    if (!emprestimoCriado) {
      const erro = new Error("Falha ao criar empréstimo") as any;
      erro.code = 500;
      throw erro;
    }
    return emprestimoCriado;
  }

  // Deletar um empréstimo
  async deletar(emprestimoId: string): Promise<EmprestimoModelo> {
    const emprestimoDeletado = await this.repositorio.deletarPorId(emprestimoId);
    if (!emprestimoDeletado) {
      const erro = new Error("Empréstimo não encontrado") as any;
      erro.code = 400;
      throw erro;
    }
    return emprestimoDeletado;
  }
}
