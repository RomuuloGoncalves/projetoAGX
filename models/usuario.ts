import ModeloBase from "../core/CoreModel.ts";

export interface DadosUsuario {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  dataNascimento: Date;
  role?: string;
}

// Classe que representa um Usuário
export default class UsuarioModelo extends ModeloBase {
  private id?: string;
  private nome: string;
  private email: string;
  private senha: string;
  private cpf: string;
  private dataNascimento: Date;
  private role: string;

  constructor(dados: DadosUsuario) {
    super();
    this.id = dados.id;
    this.nome = dados.nome;
    this.email = dados.email;
    this.senha = dados.senha;
    this.cpf = dados.cpf;
    this.dataNascimento = dados.dataNascimento;
    this.role = dados.role || "comum";
  }

  obterID() {
    return this.id;
  }

  obterNome() {
    return this.nome;
  }

  definirNome(novoNome: string) {
    this.nome = novoNome;
  }

  obterEmail() {
    return this.email;
  }

  definirEmail(novoEmail: string) {
    this.email = novoEmail;
  }

  obterSenha() {
    return this.senha;
  }

  definirSenha(novaSenha: string) {
    this.senha = novaSenha;
  }

  obterCPF() {
    return this.cpf;
  }

  definirCPF(novoCPF: string) {
    this.cpf = novoCPF;
  }

  obterDataNascimento() {
    return this.dataNascimento;
  }

  definirDataNascimento(novaData: Date) {
    this.dataNascimento = novaData;
  }

  obterRole() {
    return this.role;
  }

  definirRole(novaRole: string) {
    this.role = novaRole;
  }

  obterDados() {
    return {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      cpf: this.cpf,
      data_nascimento: this.dataNascimento,
      role: this.role,
    };
  }

  paraJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      cpf: this.cpf,
      dataNascimento: this.dataNascimento,
      role: this.role,
    };
  }
}
