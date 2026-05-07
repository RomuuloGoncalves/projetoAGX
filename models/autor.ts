import ModeloBase from "../core/CoreModel.ts";

export interface DadosAutor {
  id?: string;
  nome: string;
  nacionalidade: string;
}

// Classe que representa um Autor
export default class AutorModelo extends ModeloBase {
  private id?: string;
  private nome: string;
  private nacionalidade: string;

  constructor(dados: DadosAutor) {
    super();
    this.id = dados.id;
    this.nome = dados.nome;
    this.nacionalidade = dados.nacionalidade;
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

  obterNacionalidade() {
    return this.nacionalidade;
  }

  definirNacionalidade(novaNac: string) {
    this.nacionalidade = novaNac;
  }

  obterDados() {
    return {
      nome: this.nome,
      nacionalidade: this.nacionalidade,
    };
  }

  paraJSON() {
    return {
      id: this.id,
      nome: this.nome,
      nacionalidade: this.nacionalidade,
    };
  }
}
