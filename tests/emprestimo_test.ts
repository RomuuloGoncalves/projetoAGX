import { assertEquals, assertExists } from "@std/assert";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../server.ts";
import {
  AutorMongoDB,
  LivroMongoDB,
  UsuarioMongoDB,
  EmprestimoMongoDB,
} from "../connection/mongooseModels.ts";
const request = supertest(app);
// IDs criados durante os testes para cleanup
let autorIdCriado: string;
let livroIdCriado: string;
let usuarioAdminId: string;
let usuarioClienteId: string;
let emprestimoIdCriado: string;
let tokenAdmin: string;
const emailAdmin = "biblio.emprestimo@email.com";
const senhaAdmin = "senha12345";
// ===================== SETUP =====================
Deno.test({
  name: "Setup - Criar autor para o livro",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/autor").send({
      nome: "Autor Emprestimo Teste",
      nacionalidade: "Brasileira",
    });
    assertEquals(response.status, 201);
    autorIdCriado = response.body.data.id;
  },
});
Deno.test({
  name: "Setup - Criar livro com estoque",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/livro").send({
      titulo: "Livro Emprestimo Teste",
      isbn: 1111111111,
      ano: 2020,
      autor_id: autorIdCriado,
      quantidade_total: 2,
      quantidade_disponivel: 2,
    });
    assertEquals(response.status, 201);
    livroIdCriado = response.body.data.id;
  },
});
Deno.test({
  name: "Setup - Criar usuario admin (bibliotecario)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/usuario").send({
      nome: "Bibliotecario Teste",
      email: emailAdmin,
      senha: senhaAdmin,
      cpf: "529.982.247-25",
      data_nascimento: "1985-03-10",
    });
    assertEquals(response.status, 201);
    usuarioAdminId = response.body.data.id;
    // Promover para admin diretamente no banco
    await UsuarioMongoDB.findByIdAndUpdate(usuarioAdminId, { role: "admin" });
  },
});
Deno.test({
  name: "Setup - Criar usuario cliente (comum)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/usuario").send({
      nome: "Cliente Teste",
      email: "cliente.emprestimo@email.com",
      senha: "senha12345",
      cpf: "987.654.321-00",
      data_nascimento: "2000-06-20",
    });
    assertEquals(response.status, 201);
    usuarioClienteId = response.body.data.id;
  },
});
Deno.test({
  name: "Setup - Login do admin para obter token",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/login").send({
      email: emailAdmin,
      senha: senhaAdmin,
    });
    assertEquals(response.status, 200);
    tokenAdmin = response.body.data.token;
  },
});
// ===================== CRIAR EMPRESTIMO =====================
Deno.test({
  name: "POST /emprestimo - [POSITIVO] Admin deve conseguir criar um emprestimo",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .post("/emprestimo")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({
        usuario_id: usuarioClienteId,
        livro_id: livroIdCriado,
        data_emprestimo: "2026-05-08",
      });
    assertEquals(response.status, 201);
    assertExists(response.body.data.id);
    emprestimoIdCriado = response.body.data.id;
  },
});
Deno.test({
  name: "GET /livro/:livroId - [POSITIVO] Estoque deve ter diminuido apos emprestimo",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get(`/livro/${livroIdCriado}`);
    assertEquals(response.status, 200);
    assertEquals(response.body.data.quantidadeDisponivel, 1);
  },
});
Deno.test({
  name: "POST /emprestimo - [NEGATIVO] Deve retornar erro 400 sem dados obrigatorios",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .post("/emprestimo")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({});
    assertEquals(response.status, 400);
  },
});
Deno.test({
  name: "POST /emprestimo - [NEGATIVO] Deve retornar 401 sem token",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.post("/emprestimo").send({
      usuario_id: usuarioClienteId,
      livro_id: livroIdCriado,
      data_emprestimo: "2026-05-08",
    });
    assertEquals(response.status, 401);
  },
});
// ===================== DELETAR EMPRESTIMO ATIVO =====================
Deno.test({
  name: "DELETE /emprestimo/:id - [NEGATIVO] Nao deve excluir emprestimo ativo",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .delete(`/emprestimo/${emprestimoIdCriado}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    assertEquals(response.status, 400);
  },
});
// ===================== DEVOLVER =====================
Deno.test({
  name: "POST /emprestimo/:id/devolver - [POSITIVO] Admin deve conseguir devolver o livro",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .post(`/emprestimo/${emprestimoIdCriado}/devolver`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    assertEquals(response.status, 200);
  },
});
Deno.test({
  name: "GET /livro/:livroId - [POSITIVO] Estoque deve ter voltado apos devolucao",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request.get(`/livro/${livroIdCriado}`);
    assertEquals(response.status, 200);
    assertEquals(response.body.data.quantidadeDisponivel, 2);
  },
});
Deno.test({
  name: "POST /emprestimo/:id/devolver - [NEGATIVO] Nao deve devolver emprestimo ja devolvido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .post(`/emprestimo/${emprestimoIdCriado}/devolver`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    assertEquals(response.status, 409);
  },
});
// ===================== DELETAR EMPRESTIMO DEVOLVIDO =====================
Deno.test({
  name: "DELETE /emprestimo/:id - [POSITIVO] Deve excluir emprestimo ja devolvido",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const response = await request
      .delete(`/emprestimo/${emprestimoIdCriado}`)
      .set("Authorization", `Bearer ${tokenAdmin}`);
    assertEquals(response.status, 200);
    emprestimoIdCriado = ""; // ja foi deletado
  },
});
// ===================== TEARDOWN =====================
Deno.test({
  name: "Teardown - Limpeza de dados de teste (Emprestimo)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    if (emprestimoIdCriado) {
      await EmprestimoMongoDB.findByIdAndDelete(emprestimoIdCriado);
    }
    if (livroIdCriado) {
      await LivroMongoDB.findByIdAndDelete(livroIdCriado);
    }
    if (autorIdCriado) {
      await AutorMongoDB.findByIdAndDelete(autorIdCriado);
    }
    if (usuarioAdminId) {
      await UsuarioMongoDB.findByIdAndDelete(usuarioAdminId);
    }
    if (usuarioClienteId) {
      await UsuarioMongoDB.findByIdAndDelete(usuarioClienteId);
    }
    await mongoose.disconnect();
  },
});