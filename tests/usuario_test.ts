import { assertEquals, assertExists } from "@std/assert";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../server.ts";
import { UsuarioMongoDB } from "../connection/mongooseModels.ts";
const request = supertest(app);
let usuarioIdCriado: string;
// ===================== CRIAR =====================
Deno.test({
  name: "POST /usuario - [POSITIVO] Deve criar um usuario com dados validos",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const usuarioValido = {
      nome: "Joao Teste",
      email: "joao.teste@email.com",
      senha: "senha12345",
      cpf: "529.982.247-25",
      data_nascimento: "1990-05-15",
    };
    const response = await request.post("/usuario").send(usuarioValido);
    assertEquals(response.status, 201);
    assertExists(response.body.data.id);
    usuarioIdCriado = response.body.data.id;
  },
});
Deno.test({
  name: "POST /usuario - [NEGATIVO] Deve retornar erro 400 se o email for invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const usuarioInvalido = {
      nome: "Maria Teste",
      email: "email-invalido",
      senha: "senha12345",
      cpf: "529.982.247-25",
      data_nascimento: "1990-05-15",
    };
    const response = await request.post("/usuario").send(usuarioInvalido);
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /usuario - [NEGATIVO] Deve retornar erro 400 se a senha tiver menos de 8 caracteres",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const usuarioInvalido = {
      nome: "Pedro Teste",
      email: "pedro@email.com",
      senha: "abc",
      cpf: "529.982.247-25",
      data_nascimento: "1990-05-15",
    };
    const response = await request.post("/usuario").send(usuarioInvalido);
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /usuario - [NEGATIVO] Deve retornar erro 400 se o CPF for invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const usuarioInvalido = {
      nome: "Ana Teste",
      email: "ana@email.com",
      senha: "senha12345",
      cpf: "000.000.000-00",
      data_nascimento: "1990-05-15",
    };
    const response = await request.post("/usuario").send(usuarioInvalido);
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /usuario - [NEGATIVO] Deve retornar erro 400 se o corpo estiver vazio",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/usuario").send({});
    assertEquals(response.status, 400);
  },
});
// ===================== LISTAR =====================
Deno.test({
  name: "GET /usuario - [POSITIVO] Deve retornar a lista de usuarios com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/usuario");
    assertEquals(response.status, 200);
    assertEquals(typeof response.body.data, "object");
  },
});
// ===================== BUSCAR =====================
Deno.test({
  name: "GET /usuario/:usuarioId - [POSITIVO] Deve buscar o usuario pelo ID criado",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get(`/usuario/${usuarioIdCriado}`);
    assertEquals(response.status, 200);
    assertEquals(response.body.data.id, usuarioIdCriado);
    assertEquals(response.body.data.nome, "Joao Teste");
  },
});
Deno.test({
  name: "GET /usuario/:usuarioId - [NEGATIVO] Deve retornar erro 400 para ID invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/usuario/id_invalido_xyz");
    assertEquals(response.status, 400);
  },
});
// ===================== ATUALIZAR =====================
Deno.test({
  name: "PUT /usuario/:usuarioId - [POSITIVO] Deve atualizar o usuario com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.put(`/usuario/${usuarioIdCriado}`).send({
      nome: "Joao Teste Atualizado",
    });
    assertEquals(response.status, 200);
  },
});
Deno.test({
  name: "PUT /usuario/:usuarioId - [NEGATIVO] Deve retornar erro para ID inexistente",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const idInexistente = "507f1f77bcf86cd799439099";
    const response = await request.put(`/usuario/${idInexistente}`).send({
      nome: "Ninguem",
    });
    assertEquals(response.status, 400);
  },
});
// ===================== DELETAR =====================
Deno.test({
  name: "DELETE /usuario/:usuarioId - [NEGATIVO] Deve retornar erro para ID invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.delete("/usuario/id_invalido_xyz");
    assertEquals(response.status, 400);
  },
});
// ===================== TEARDOWN =====================
Deno.test({
  name: "Teardown - Limpeza de dados de teste (Usuario)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    if (usuarioIdCriado) {
      await UsuarioMongoDB.findByIdAndDelete(usuarioIdCriado);
    }
    await mongoose.disconnect();
  },
});