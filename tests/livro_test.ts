import { assertEquals, assertExists } from "@std/assert";
import supertest from "npm:supertest";
import mongoose from "mongoose";
import app from "../server.ts";
import Livro from "../models/livro.ts";

const request = supertest(app);
let livroIdCriado: string;

Deno.test({
  name: "POST /livro/store - [POSITIVO] Deve criar um livro com dados válidos",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const livroValido = {
      titulo: "O Hobbit",
      isbn: 9780261102217,
      ano: 1937,
      quantidade_total: 3,
      quantidade_disponivel: 3
    };

    const response = await request.post("/livro/store").send(livroValido);

    // Espera sucesso na criação (201 Created)
    assertEquals(response.status, 201);
    
    // O middleware responser deve retornar o livro no nó 'data'
    assertExists(response.body.data._id);
    livroIdCriado = response.body.data._id; // Salvamos para testar no FIND
  }
});

Deno.test({
  name: "POST /livro/store - [NEGATIVO] Deve retornar erro 400 se os dados forem inválidos ou vazios",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const livroInvalido = {
      titulo: "", // Título vazio falha na validação
      isbn: "deveria_ser_numero", 
      ano: -500 // Ano menor que 0 falha
    };

    const response = await request.post("/livro/store").send(livroInvalido);

    assertEquals(response.status, 400);
    assertEquals(response.body.message, "Dados inválidos");
    // Garante que o retorno informou quais propriedades falharam
    assertExists(response.body.erros);
  }
});

Deno.test({
  name: "GET /livro/ - [POSITIVO] Deve retornar a lista de livros com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/livro/");
    assertEquals(response.status, 200);
    assertEquals(typeof response.body.data, "object");
  }
});

Deno.test({
  name: "GET /livro/find - [POSITIVO] Deve buscar o livro específico pelo ID criado",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/livro/find").send({ _id: livroIdCriado });
    
    assertEquals(response.status, 200);
    assertEquals(response.body.data._id, livroIdCriado);
    assertEquals(response.body.data.titulo, "O Hobbit");
  }
});

Deno.test({
  name: "GET /livro/find - [NEGATIVO] Deve retornar erro interno se o formato do JSON de busca for um ID quebrado",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/livro/find").send({ _id: "bisteca123" });
    
    assertEquals(response.status, 500);
  }
});

Deno.test({
  name: "Teardown - Limpeza de dados de teste e fechamento banco",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {

    if (livroIdCriado) {
      await Livro.findByIdAndDelete(livroIdCriado);
    }
    
    await mongoose.disconnect();
  }
});