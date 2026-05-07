import { assertEquals, assertExists } from "@std/assert";
import supertest from "npm:supertest";
import mongoose from "mongoose";
import app from "../server.ts";
import { LivroMongoDB } from "../connection/mongooseModels.ts";

const request = supertest(app);
let livroIdCriado: string;

Deno.test({
  name: "POST /livro - [POSITIVO] Deve criar um livro com dados válidos",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const livroValido = {
      titulo: "O Hobbit",
      isbn: 9780261102217,
      ano: 1937,
      quantidade_total: 3,
      quantidade_disponivel: 3,
    };

    const response = await request.post("/livro").send(livroValido);

    // Espera sucesso na criação (201 Created)
    assertEquals(response.status, 201);

    // O middleware responser deve retornar o livro no nó 'data'
    assertExists(response.body.data._id);
    livroIdCriado = response.body.data._id; // Salvamos para testar no FIND
  },
});

Deno.test({
  name: "POST /livro - [NEGATIVO] Deve retornar erro 400 se os dados forem inválidos ou vazios",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const livroInvalido = {
      titulo: "", // Título vazio falha na validação
      isbn: "deveria_ser_numero",
      ano: -500, // Ano menor que 0 falha
    };

    const response = await request.post("/livro").send(livroInvalido);

    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});

Deno.test({
  name: "GET /livro - [POSITIVO] Deve retornar a lista de livros com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/livro");
    assertEquals(response.status, 200);
    assertEquals(typeof response.body.data, "object");
  },
});

Deno.test({
  name: "GET /livro/:livroId - [POSITIVO] Deve buscar o livro específico pelo ID criado",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get(`/livro/${livroIdCriado}`);

    assertEquals(response.status, 200);
    assertEquals(response.body.data.id, livroIdCriado);
    assertEquals(response.body.data.titulo, "O Hobbit");
  },
});

Deno.test({
  name: "GET /livro/:livroId - [NEGATIVO] Deve retornar erro 400 para ID inválido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/livro/bisteca123");

    assertEquals(response.status, 400);
  },
});

Deno.test({
  name: "Teardown - Limpeza de dados de teste e fechamento banco",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    if (livroIdCriado) {
      await LivroMongoDB.findByIdAndDelete(livroIdCriado);
    }

    await mongoose.disconnect();
  },
});
