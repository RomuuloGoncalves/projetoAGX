import { assertEquals, assertExists } from "@std/assert";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../server.ts";
import { AutorMongoDB } from "../connection/mongooseModels.ts";
const request = supertest(app);
let autorIdCriado: string;
// ===================== CRIAR =====================
Deno.test({
  name: "POST /autor - [POSITIVO] Deve criar um autor com dados validos",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const autorValido = {
      nome: "Machado de Assis",
      nacionalidade: "Brasileira",
    };
    const response = await request.post("/autor").send(autorValido);
    assertEquals(response.status, 201);
    assertExists(response.body.data.id);
    autorIdCriado = response.body.data.id;
  },
});
Deno.test({
  name: "POST /autor - [NEGATIVO] Deve retornar erro 400 se o nome estiver vazio",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const autorInvalido = {
      nome: "",
      nacionalidade: "Brasileira",
    };
    const response = await request.post("/autor").send(autorInvalido);
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /autor - [NEGATIVO] Deve retornar erro 400 se a nacionalidade estiver vazia",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const autorInvalido = {
      nome: "Autor Teste",
      nacionalidade: "",
    };
    const response = await request.post("/autor").send(autorInvalido);
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /autor - [NEGATIVO] Deve retornar erro 400 se o corpo estiver vazio",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/autor").send({});
    assertEquals(response.status, 400);
  },
});
// ===================== LISTAR =====================
Deno.test({
  name: "GET /autor - [POSITIVO] Deve retornar a lista de autores com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/autor");
    assertEquals(response.status, 200);
    assertEquals(typeof response.body.data, "object");
  },
});
// ===================== BUSCAR =====================
Deno.test({
  name: "GET /autor/:autorId - [POSITIVO] Deve buscar o autor pelo ID criado",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get(`/autor/${autorIdCriado}`);
    assertEquals(response.status, 200);
    assertEquals(response.body.data.id, autorIdCriado);
    assertEquals(response.body.data.nome, "Machado de Assis");
  },
});
Deno.test({
  name: "GET /autor/:autorId - [NEGATIVO] Deve retornar erro 400 para ID invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/autor/id_invalido_xyz");
    assertEquals(response.status, 400);
  },
});
// ===================== ATUALIZAR =====================
Deno.test({
  name: "PUT /autor/:autorId - [POSITIVO] Deve atualizar o autor com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.put(`/autor/${autorIdCriado}`).send({
      nome: "Machado de Assis (Atualizado)",
    });
    assertEquals(response.status, 200);
  },
});
Deno.test({
  name: "PUT /autor/:autorId - [NEGATIVO] Deve retornar erro para ID inexistente",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const idInexistente = "507f1f77bcf86cd799439099";
    const response = await request.put(`/autor/${idInexistente}`).send({
      nome: "Ninguem",
    });
    assertEquals(response.status, 400);
  },
});
// ===================== DELETAR =====================
Deno.test({
  name: "DELETE /autor/:autorId - [NEGATIVO] Deve retornar erro para ID invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.delete("/autor/id_invalido_xyz");
    assertEquals(response.status, 400);
  },
});
// ===================== Limpar Testes =====================
Deno.test({
  name: "Limpar Testes - Limpeza de dados de teste (Autor)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    if (autorIdCriado) {
      await AutorMongoDB.findByIdAndDelete(autorIdCriado);
    }
    await mongoose.disconnect();
  },
});