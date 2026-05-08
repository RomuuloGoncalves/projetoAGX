import { assertEquals, assertExists } from "@std/assert";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../server.ts";
import { UsuarioMongoDB } from "../connection/mongooseModels.ts";
const request = supertest(app);
// Dados do usuario que sera criado para os testes de autenticacao
const emailTeste = "auth.teste@email.com";
const senhaTeste = "senha12345";
let usuarioIdCriado: string;
let tokenValido: string;
// ===================== SETUP =====================
Deno.test({
  name: "Setup - Criar usuario para testes de autenticacao",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/usuario").send({
      nome: "Auth Teste",
      email: emailTeste,
      senha: senhaTeste,
      cpf: "529.982.247-25",
      data_nascimento: "1990-01-01",
    });
    assertEquals(response.status, 201);
    usuarioIdCriado = response.body.data.id;
  },
});
// ===================== LOGIN =====================
Deno.test({
  name: "POST /login - [POSITIVO] Deve fazer login e retornar um token JWT",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/login").send({
      email: emailTeste,
      senha: senhaTeste,
    });
    assertEquals(response.status, 200);
    assertExists(response.body.data.token);
    assertExists(response.body.data.usuario);
    tokenValido = response.body.data.token;
  },
});
Deno.test({
  name: "POST /login - [NEGATIVO] Deve retornar erro 400 com email invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/login").send({
      email: "nao-e-email",
      senha: senhaTeste,
    });
    assertEquals(response.status, 400);
    assertExists(response.body.message);
  },
});
Deno.test({
  name: "POST /login - [NEGATIVO] Deve retornar erro 400 sem senha",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/login").send({
      email: emailTeste,
      senha: "",
    });
    assertEquals(response.status, 400);
  },
});
Deno.test({
  name: "POST /login - [NEGATIVO] Deve retornar erro 401 com senha incorreta",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/login").send({
      email: emailTeste,
      senha: "senhaErrada99",
    });
    assertEquals(response.status, 401);
  },
});
Deno.test({
  name: "POST /login - [NEGATIVO] Deve retornar erro 401 com email inexistente",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/login").send({
      email: "naoexiste@email.com",
      senha: senhaTeste,
    });
    assertEquals(response.status, 401);
  },
});
// ===================== ACESSO PROTEGIDO =====================
Deno.test({
  name: "GET /emprestimo - [NEGATIVO] Deve retornar 401 sem token",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get("/emprestimo");
    assertEquals(response.status, 401);
  },
});
Deno.test({
  name: "GET /emprestimo - [NEGATIVO] Deve retornar 401 com token invalido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .get("/emprestimo")
      .set("Authorization", "Bearer token.invalido.aqui");
    assertEquals(response.status, 401);
  },
});
Deno.test({
  name: "GET /emprestimo - [POSITIVO] Deve retornar 200 com token valido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .get("/emprestimo")
      .set("Authorization", `Bearer ${tokenValido}`);
    assertEquals(response.status, 200);
  },
});
// ===================== ADMIN MIDDLEWARE =====================
Deno.test({
  name: "POST /emprestimo - [NEGATIVO] Deve retornar 403 para usuario sem role admin",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    // O usuario criado tem role "comum" por padrao
    const response = await request
      .post("/emprestimo")
      .set("Authorization", `Bearer ${tokenValido}`)
      .send({
        usuario_id: usuarioIdCriado,
        livro_id: "507f1f77bcf86cd799439011",
        data_emprestimo: "2026-05-08",
      });
    assertEquals(response.status, 403);
  },
});
// ===================== LOGOUT =====================
Deno.test({
  name: "POST /logout - [POSITIVO] Deve fazer logout e invalidar o token",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .post("/logout")
      .set("Authorization", `Bearer ${tokenValido}`);
    assertEquals(response.status, 200);
  },
});
Deno.test({
  name: "GET /emprestimo - [NEGATIVO] Deve retornar 401 apos logout (token na blacklist)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .get("/emprestimo")
      .set("Authorization", `Bearer ${tokenValido}`);
    assertEquals(response.status, 401);
  },
});
// ===================== TEARDOWN =====================
Deno.test({
  name: "Teardown - Limpeza de dados de teste (Auth)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    if (usuarioIdCriado) {
      await UsuarioMongoDB.findByIdAndDelete(usuarioIdCriado);
    }
    await mongoose.disconnect();
  },
});