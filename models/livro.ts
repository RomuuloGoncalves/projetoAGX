import ModeloBase from "../core/CoreModel.ts";

// Interface com os dados que o Livro precisa receber
export interface DadosLivro {
  id?: string;
  titulo: string;
  isbn: number;
  ano: number;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
}

// Classe que representa um Livro
export default class LivroModelo extends ModeloBase {
  private id?: string;
  private titulo: string;
  private isbn: number;
  private ano: number;
  private quantidadeTotal: number;
  private quantidadeDisponivel: number;

  constructor(dados: DadosLivro) {
    super();
    this.id = dados.id;
    this.titulo = dados.titulo;
    this.isbn = dados.isbn;
    this.ano = dados.ano;
    this.quantidadeTotal = dados.quantidadeTotal;
    this.quantidadeDisponivel = dados.quantidadeDisponivel;
  }

  // Getters - para ler os valores
  obterID() {
    return this.id;
  }

  obterTitulo() {
    return this.titulo;
  }

  obterISBN() {
    return this.isbn;
  }

  obterAno() {
    return this.ano;
  }

  obterQuantidadeTotal() {
    return this.quantidadeTotal;
  }

  obterQuantidadeDisponivel() {
    return this.quantidadeDisponivel;
  }

  // Setters - para modificar os valores
  definirTitulo(novoTitulo: string) {
    this.titulo = novoTitulo;
  }

  definirQuantidadeTotal(nova: number) {
    this.quantidadeTotal = nova;
  }

  definirQuantidadeDisponivel(nova: number) {
    this.quantidadeDisponivel = nova;
  }

  // Retorna os dados em formato de objeto para salvar no banco
  obterDados() {
    return {
      titulo: this.titulo,
      isbn: this.isbn,
      ano: this.ano,
      quantidade_total: this.quantidadeTotal,
      quantidade_disponivel: this.quantidadeDisponivel,
    };
  }

  // Retorna todos os dados incluindo o ID (para mostrar no resultado)
  paraJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      isbn: this.isbn,
      ano: this.ano,
      quantidadeTotal: this.quantidadeTotal,
      quantidadeDisponivel: this.quantidadeDisponivel,
    };
  }
}
