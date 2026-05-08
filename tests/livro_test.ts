import { assertEquals, assertExists } from "@std/assert";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../server.ts";
import { LivroMongoDB, AutorMongoDB } from "../connection/mongooseModels.ts";
const request = supertest(app);
let autorIdCriado: string;
let livroIdCriado: string;
// ===================== SETUP =====================
Deno.test({
  name: "Setup - Criar autor para vincular ao livro",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/autor").send({
      nome: "Autor Livro Teste",
      nacionalidade: "Brasileira",
    });
    assertEquals(response.status, 201);
    autorIdCriado = response.body.data.id;
  },
});
// ===================== CRIAR =====================
Deno.test({
  name: "POST /livro - [POSITIVO] Deve criar um livro com dados validos",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const livroValido = {
      titulo: "O Hobbit",
      isbn: 9780261102217,
      ano: 1937,
      autor_id: autorIdCriado,
      quantidade_total: 3,
      quantidade_disponivel: 3,
    };
    const response = await request.post("/livro").send(livroValido);
    // Espera sucesso na criação (201 Created)
    assertEquals(response.status, 201);
    // O middleware responser deve retornar o livro no nó 'data'
    assertExists(response.body.data.id);
    livroIdCriado = response.body.data.id; // Salvamos para testar no FIND
    livroIdCriado = response.body.data.id;
  },
});
Deno.test({
  name: "POST /livro - [NEGATIVO] Deve retornar erro 400 se o titulo estiver vazio",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const livroInvalido = {
      titulo: "",
      isbn: 1234567890,
      ano: 2020,
      autor_id: autorIdCriado,
      quantidade_total: 1,
      quantidade_disponivel: 1,
    };
    const response = await request.post("/livro").send(livroInvalido);
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /livro - [NEGATIVO] Deve retornar erro 400 se o ISBN nao for numero",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const livroInvalido = {
      titulo: "Livro Teste",
      isbn: "deveria_ser_numero",
      ano: 2020,
      autor_id: autorIdCriado,
      quantidade_total: 1,
      quantidade_disponivel: 1,
    };
    const response = await request.post("/livro").send(livroInvalido);
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /livro - [NEGATIVO] Deve retornar erro 400 se o ano for negativo",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const livroInvalido = {
      titulo: "Livro Teste",
      isbn: 1234567890,
      ano: -500,
      autor_id: autorIdCriado,
      quantidade_total: 1,
      quantidade_disponivel: 1,
    };
    const response = await request.post("/livro").send(livroInvalido);
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /livro - [NEGATIVO] Deve retornar erro 400 se o corpo estiver vazio",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/livro").send({});
    assertEquals(response.status, 400);
  },
});
// ===================== LISTAR =====================
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
// ===================== BUSCAR =====================
Deno.test({
  name: "GET /livro/:livroId - [POSITIVO] Deve buscar o livro pelo ID criado",
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
  name: "GET /livro/:livroId - [NEGATIVO] Deve retornar erro 400 para ID invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/livro/id_invalido_xyz");
    assertEquals(response.status, 400);
  },
});
// ===================== ATUALIZAR =====================
Deno.test({
  name: "PUT /livro/:livroId - [POSITIVO] Deve atualizar o livro com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.put(`/livro/${livroIdCriado}`).send({
      titulo: "O Hobbit (Edicao Atualizada)",
    });
    assertEquals(response.status, 200);
  },
});
Deno.test({
  name: "PUT /livro/:livroId - [NEGATIVO] Deve retornar erro para ID inexistente",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const idInexistente = "507f1f77bcf86cd799439099";
    const response = await request.put(`/livro/${idInexistente}`).send({
      titulo: "Ninguem",
    });
    assertEquals(response.status, 400);
  },
});
// ===================== DELETAR =====================
Deno.test({
  name: "DELETE /livro/:livroId - [NEGATIVO] Deve retornar erro para ID invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.delete("/livro/id_invalido_xyz");
    assertEquals(response.status, 400);
  },
});
// ===================== Limpar Testes =====================
Deno.test({
  name: "Limpar Testes - Limpeza de dados de teste (Livro)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    if (livroIdCriado) {
      await LivroMongoDB.findByIdAndDelete(livroIdCriado);
    }
    if (autorIdCriado) {
      await AutorMongoDB.findByIdAndDelete(autorIdCriado);
    }
    await mongoose.disconnect();
  },
});