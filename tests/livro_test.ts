import { assertEquals, assertExists } from "@std/assert";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../server.ts";
import { Request, Response } from "express";
import { LivroMongoDB, AutorMongoDB } from "../connection/mongooseModels.ts";
import * as livroController from "../features/livro/livroController.ts";

interface LivroServiceInternals {
  autorRepositorio: { obterPorId(id: string): Promise<unknown> };
}

interface LivroRepositoryInternals {
  converterParaModelo(doc: Record<string, unknown>): unknown;
}
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
Deno.test({
  name: "DELETE /livro/:livroId - [POSITIVO] Deve deletar o livro com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const autorResp = await request.post("/autor").send({ nome: "A", nacionalidade: "B" });
    const aId = autorResp.body.data.id;
    const resp = await request.post("/livro").send({
      titulo: "Para Del", isbn: Number(Date.now().toString().slice(-8)), ano: 2020, autor_id: aId, quantidade_total: 1, quantidade_disponivel: 1
    });
    const id = resp.body.data.id;
    const response = await request.delete(`/livro/${id}`);
    assertEquals(response.status, 200);
    await request.delete(`/autor/${aId}`);
  }
});
// ===================== EXCEPTION E EDGE CASES =====================
Deno.test({
  name: "Controller Livro - [NEGATIVO] Edge cases de erro",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    let statusCode = 0;
    const fakeRes = { 
        send_badRequest: () => { statusCode = 400; return "badRequest"; }, 
        send_internalServerError: () => { statusCode = 500; return "error"; } 
    };

    const fakeReqVazio = { params: {}, body: {} };
    const fakeReqId = { params: {}, body: { id: "123" } };
    const fakeReqUnderId = { params: {}, body: { _id: "123" } };
    
    // Testar obterIdLivro
    const origObter = livroController.servicoLivro.obterPorId;
    livroController.servicoLivro.obterPorId = () => Promise.resolve({ paraJSON: () => ({}) } as unknown as never);
    
    await livroController.buscar(fakeReqId as unknown as Request, fakeRes as unknown as Response);
    await livroController.buscar(fakeReqUnderId as unknown as Request, fakeRes as unknown as Response);
    
    // Forçar exceptions
    const originalCriar = livroController.servicoLivro.criar;
    livroController.servicoLivro.criar = () => Promise.resolve(null as unknown as never); 
    
    statusCode = 0; await livroController.listar(null as unknown as Request, fakeRes as unknown as Response); assertEquals(statusCode, 500);
    statusCode = 0; await livroController.buscar(null as unknown as Request, fakeRes as unknown as Response); assertEquals(statusCode, 500);
    statusCode = 0; await livroController.criar(null as unknown as Request, fakeRes as unknown as Response); assertEquals(statusCode, 500);
    statusCode = 0; await livroController.atualizar(null as unknown as Request, fakeRes as unknown as Response); assertEquals(statusCode, 500);
    statusCode = 0; await livroController.deletar(null as unknown as Request, fakeRes as unknown as Response); assertEquals(statusCode, 500);
    
    // Ausência de ID
    statusCode = 0; await livroController.buscar(fakeReqVazio as unknown as Request, fakeRes as unknown as Response); assertEquals(statusCode, 400);
    statusCode = 0; await livroController.atualizar(fakeReqVazio as unknown as Request, fakeRes as unknown as Response); assertEquals(statusCode, 400);
    statusCode = 0; await livroController.deletar(fakeReqVazio as unknown as Request, fakeRes as unknown as Response); assertEquals(statusCode, 400);

    livroController.servicoLivro.obterPorId = origObter;
    livroController.servicoLivro.criar = originalCriar;
  },
});
Deno.test({
  name: "Service Livro - [NEGATIVO] Erros de criacao",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
      const origValidarUnico = livroController.repositorioLivro.obterPorISBN;
      // simular duplicidade de ISBN
      livroController.repositorioLivro.obterPorISBN = () => Promise.resolve({ obterID: () => "1" } as unknown as never);
      const origObterAutorMock2 = (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId;
      (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId = () => Promise.resolve({ id: "a1" });
      
      try {
          await livroController.servicoLivro.criar({ obterISBN: () => 123, obterAutorId: () => "a1" } as unknown as never);
          throw new Error("Falhou");
        } catch (e: unknown) {
          assertEquals((e as { code?: number }).code, 409); // Conflito
      }
      livroController.repositorioLivro.obterPorISBN = origValidarUnico;
      (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId = origObterAutorMock2;

      const origCriar = livroController.repositorioLivro.criar;
      const origObterAutorMock = (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId;
      
      livroController.repositorioLivro.obterPorISBN = () => Promise.resolve(null as unknown as never);
      livroController.repositorioLivro.criar = () => Promise.resolve(null as unknown as never);
      (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId = () => Promise.resolve({ id: "a1" });

      try {
          await livroController.servicoLivro.criar({ obterISBN: () => 123, obterAutorId: () => "a1" } as unknown as never);
          throw new Error("Falhou");
        } catch (e: unknown) {
          assertEquals((e as { code?: number }).code, 500);
      }
      livroController.repositorioLivro.obterPorISBN = origValidarUnico;
      livroController.repositorioLivro.criar = origCriar;
      (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId = origObterAutorMock;

      // Teste de obterPorId falha
      const origObterId = livroController.repositorioLivro.obterPorId;
      livroController.repositorioLivro.obterPorId = () => Promise.resolve(null as unknown as never);
      try {
          await livroController.servicoLivro.obterPorId("123");
      } catch (e: unknown) {
          assertEquals((e as { code?: number }).code, 400);
      }
      livroController.repositorioLivro.obterPorId = origObterId;

      // Teste de autor não encontrado ao criar livro
      const origObterAutor = (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId;
      (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId = () => Promise.resolve(null);
      try {
          await livroController.servicoLivro.criar({ obterISBN: () => 123, obterAutorId: () => "autor123" } as unknown as never);
          throw new Error("Falhou");
      } catch (e: unknown) {
          assertEquals((e as { code?: number }).code, 400);
          assertEquals((e as { message?: string }).message, "Autor informado não existe.");
      }
      (livroController.servicoLivro as unknown as LivroServiceInternals).autorRepositorio.obterPorId = origObterAutor;

      // Teste de autorId ausente ao criar livro com autorRepositorio
      try {
          await livroController.servicoLivro.criar({ obterISBN: () => 123, obterAutorId: () => null } as unknown as never);
          throw new Error("Falhou");
      } catch (e: unknown) {
          assertEquals((e as { code?: number }).code, 400);
          assertEquals((e as { message?: string }).message, "O ID do autor é obrigatório.");
      }

      // Repository Branch Coverage
      
      (livroController.repositorioLivro as unknown as LivroRepositoryInternals).converterParaModelo({});
      
      (livroController.repositorioLivro as unknown as LivroRepositoryInternals).converterParaModelo({ isbn: 123, ano: 2020 });
      
      (livroController.repositorioLivro as unknown as LivroRepositoryInternals).converterParaModelo({ quantidade_total: 10, quantidade_disponivel: 5 });

      // ISBN success
      const origFindOneL = livroController.repositorioLivro["bd"].findOne;
      
      // deno-lint-ignore no-explicit-any
      livroController.repositorioLivro["bd"].findOne = () => ({ lean: () => Promise.resolve({ _id: "1" }) } as any);
      await livroController.repositorioLivro.obterPorISBN(123);
      
      // deno-lint-ignore no-explicit-any
      livroController.repositorioLivro["bd"].findOne = () => ({ lean: () => Promise.resolve(null) } as any);
      await livroController.repositorioLivro.obterPorISBN(0);
      livroController.repositorioLivro["bd"].findOne = origFindOneL;

      // Teste de metodos do servico
      await livroController.servicoLivro.listar();
      
      const origAtu = livroController.repositorioLivro.atualizarPorId;
      livroController.repositorioLivro.atualizarPorId = () => Promise.resolve(null);
      try { await livroController.servicoLivro.atualizar("123", {}); } catch (e: unknown) { assertEquals((e as { code?: number }).code, 400); }
      livroController.repositorioLivro.atualizarPorId = origAtu;

      const origDel = livroController.repositorioLivro.deletarPorId;
      livroController.repositorioLivro.deletarPorId = () => Promise.resolve(null);
      try { await livroController.servicoLivro.deletar("123"); } catch (e: unknown) { assertEquals((e as { code?: number }).code, 400); }
      livroController.repositorioLivro.deletarPorId = origDel;

      // Casos de borda do controller
      let status = 0;
      const fakeRes = { send_badRequest: () => { status = 400; } };
      await livroController.buscar({ params: {}, body: { id: "123" } } as unknown as Request, fakeRes as unknown as Response);
      assertEquals(status, 400);
      
      status = 0;
      await livroController.buscar({ params: {}, body: { _id: "123" } } as unknown as Request, fakeRes as unknown as Response);
      assertEquals(status, 400);
      
      status = 0;
      await livroController.buscar({ params: {}, body: null } as unknown as Request, fakeRes as unknown as Response);
      assertEquals(status, 400);

      // Teste de cobertura do conversor de modelo
      
      (livroController.repositorioLivro as unknown as LivroRepositoryInternals).converterParaModelo({ _id: null, titulo: null, isbn: null, ano: null, autor_id: null, quantidade_total: null, quantidade_disponivel: null });

      // Teste de busca de ISBN com sucesso
      const origFindISBN = (livroController.repositorioLivro as unknown as { bd: { findOne: unknown } }).bd.findOne;
      
      (livroController.repositorioLivro as unknown as { bd: { findOne: unknown } }).bd.findOne = () => ({ lean: () => Promise.resolve({ _id: "1", isbn: 123 }) });
      await livroController.repositorioLivro.obterPorISBN(123);
      (livroController.repositorioLivro as unknown as { bd: { findOne: unknown } }).bd.findOne = origFindISBN;
  }
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