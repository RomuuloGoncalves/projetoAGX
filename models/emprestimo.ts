import ModeloBase from "../core/CoreModel.ts";

export type StatusEmprestimo = "ativo" | "devolvido";

export interface DadosEmprestimo {
  id?: string;
  usuarioId: string;
  livroId: string;
  dataEmprestimo: Date;
  dataDevolucao: Date | null;
  status: StatusEmprestimo;
}

// Classe que representa um Empréstimo
export default class EmprestimoModelo extends ModeloBase {
  private id?: string;
  private usuarioId: string;
  private livroId: string;
  private dataEmprestimo: Date;
  private dataDevolucao: Date | null;
  private status: StatusEmprestimo;

  constructor(dados: DadosEmprestimo) {
    super();
    this.id = dados.id;
    this.usuarioId = dados.usuarioId;
    this.livroId = dados.livroId;
    this.dataEmprestimo = dados.dataEmprestimo;
    this.dataDevolucao = dados.dataDevolucao;
    this.status = dados.status;
  }

  obterID() {
    return this.id;
  }

  obterUsuarioId() {
    return this.usuarioId;
  }

  obterLivroId() {
    return this.livroId;
  }

  obterDataEmprestimo() {
    return this.dataEmprestimo;
  }

  obterDataDevolucao() {
    return this.dataDevolucao;
  }

  definirDataDevolucao(novaData: Date | null) {
    this.dataDevolucao = novaData;
  }

  obterStatus() {
    return this.status;
  }

  definirStatus(novoStatus: StatusEmprestimo) {
    this.status = novoStatus;
  }

  obterDados() {
    return {
      usuario_id: this.usuarioId,
      livro_id: this.livroId,
      data_emprestimo: this.dataEmprestimo,
      data_devolucao: this.dataDevolucao,
      status: this.status,
    };
  }

  paraJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      livroId: this.livroId,
      dataEmprestimo: this.dataEmprestimo,
      dataDevolucao: this.dataDevolucao,
      status: this.status,
    };
  }
}
