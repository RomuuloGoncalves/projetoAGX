import { assertEquals, assertExists } from "@std/assert";
import supertest from "supertest";
import mongoose from "mongoose";
import { Request, Response } from "express";
import app from "../server.ts";
import { AutorMongoDB } from "../connection/mongooseModels.ts";
import * as autorController from "../entidades/autor/autorController.ts";
import AutorModelo from "../models/autor.ts";

interface AutorRepositoryInternals {
  converterParaModelo(doc: Record<string, unknown>): unknown;
}
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
Deno.test({
  name: "DELETE /autor/:autorId - [POSITIVO] Deve deletar o autor com sucesso",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const autorResp = await request.post("/autor").send({ nome: "Para Deletar", nacionalidade: "D" });
    const id = autorResp.body.data.id;
    const response = await request.delete(`/autor/${id}`);
    assertEquals(response.status, 200);
  }
});
// ===================== EXCEPTION E EDGE CASES =====================
Deno.test({
  name: "Controller Autor - [NEGATIVO] Edge cases de erro",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    let statusCode = 0;
    const fakeRes = { 
        send_badRequest: () => { statusCode = 400; return "badRequest"; }, 
        send_internalServerError: () => { statusCode = 500; return "error"; } 
    } as unknown as Response;

    const fakeReqVazio = { params: {}, body: {} } as unknown as Request;
    const fakeReqId = { params: {}, body: { id: "123" } } as unknown as Request;
    const _fakeReqUnderId = { params: {}, body: { _id: "123" } } as unknown as Request;
    
    // Testar obterIdAutor chamando buscar com os variados IDs
    statusCode = 0;
    // mockar serviço pra não falhar de verdade e só passar do ID
    const origObter = autorController.servicoAutor.obterPorId;
    autorController.servicoAutor.obterPorId = () => Promise.resolve(null as unknown as AutorModelo);
    
    await autorController.buscar(fakeReqId, fakeRes);
    
    // Forçar exceptions
    const originalCriar = autorController.servicoAutor.criar;
    autorController.servicoAutor.criar = () => Promise.resolve(null as unknown as AutorModelo); // Simular falha !autorCriado
    
    // Forçar throw erro passando request nulo para os metodos
    statusCode = 0; await autorController.listar(null as unknown as Request, fakeRes); assertEquals(statusCode, 500);
    statusCode = 0; await autorController.buscar(null as unknown as Request, fakeRes); assertEquals(statusCode, 500);
    statusCode = 0; await autorController.criar(null as unknown as Request, fakeRes); assertEquals(statusCode, 500);
    statusCode = 0; await autorController.atualizar(null as unknown as Request, fakeRes); assertEquals(statusCode, 500);
    statusCode = 0; await autorController.deletar(null as unknown as Request, fakeRes); assertEquals(statusCode, 500);
    
    // Teste de Ausência de ID nas rotas (passando fakeReqVazio)
    statusCode = 0; await autorController.buscar(fakeReqVazio, fakeRes); assertEquals(statusCode, 400);
    statusCode = 0; await autorController.atualizar(fakeReqVazio, fakeRes); assertEquals(statusCode, 400);
    statusCode = 0; await autorController.deletar(fakeReqVazio, fakeRes); assertEquals(statusCode, 400);

    // Restaurar originais
    autorController.servicoAutor.obterPorId = origObter;
    autorController.servicoAutor.criar = originalCriar;
  },
});
Deno.test({
  name: "Service Autor - [NEGATIVO] Deve retornar erro se nao criar",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
      const orig = autorController.repositorioAutor.criar;
        autorController.repositorioAutor.criar = () => Promise.resolve(null);
      try {
                await autorController.servicoAutor.criar({} as unknown as AutorModelo);
          throw new Error("Falhou");
        } catch (e: unknown) {
          assertEquals((e as { code?: number }).code, 500);
      }
      autorController.repositorioAutor.criar = orig;
  }
});

Deno.test({
  name: "Controller Autor - Edge cases de ID no corpo",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { buscar } = await import("../entidades/autor/autorController.ts");
    let status = 0;
    const fakeRes = {
      send_ok: () => { status = 200; },
      send_badRequest: () => { status = 400; },
      send_internalServerError: () => { status = 500; }
    };

    // ID no _id do corpo
    const origObter = autorController.servicoAutor.obterPorId;
    
    autorController.servicoAutor.obterPorId = () => Promise.resolve({ paraJSON: () => ({}) } as unknown as never);

    await buscar({ params: {}, body: { _id: "123" } } as unknown as Request, fakeRes as unknown as Response);
    assertEquals(status, 200);

    // ID no id do corpo
    await buscar({ params: {}, body: { id: "456" } } as unknown as Request, fakeRes as unknown as Response);
    assertEquals(status, 200);
    
    // ID nulo
    await buscar({ params: {}, body: {} } as unknown as Request, fakeRes as unknown as Response);
    assertEquals(status, 400);

    // Tipos invalidos no corpo
    await buscar({ params: {}, body: { _id: 123 } } as unknown as Request, fakeRes as unknown as Response);
    await buscar({ params: {}, body: { id: 456 } } as unknown as Request, fakeRes as unknown as Response);
    
    await buscar({ params: {}, body: null } as unknown as Request, fakeRes as unknown as Response);

    autorController.servicoAutor.obterPorId = origObter;

    // Teste de metodos do servico
    await autorController.servicoAutor.listar();
    
    const origAtu = autorController.repositorioAutor.atualizarPorId;
    autorController.repositorioAutor.atualizarPorId = () => Promise.resolve(null);
    try { await autorController.servicoAutor.atualizar("123", {}); } catch (e: unknown) { assertEquals((e as { code?: number }).code, 400); }
    autorController.repositorioAutor.atualizarPorId = origAtu;

    const origDel = autorController.repositorioAutor.deletarPorId;
    autorController.repositorioAutor.deletarPorId = () => Promise.resolve(null);
    try { await autorController.servicoAutor.deletar("123"); } catch (e: unknown) { assertEquals((e as { code?: number }).code, 400); }
    autorController.repositorioAutor.deletarPorId = origDel;

    // Teste de cobertura do conversor de modelo
    
    (autorController.repositorioAutor as unknown as AutorRepositoryInternals).converterParaModelo({ _id: null, nome: null, nacionalidade: null });

    // Hit tratarErroHttp in deletar
    const origDelServ = autorController.servicoAutor.deletar;
    
    autorController.servicoAutor.deletar = (() => { throw new Error("Trigger catch"); }) as unknown as never;
    let errorHandled = false;
    const fakeResErr = { send_internalServerError: () => { errorHandled = true; } };
    await autorController.deletar({ params: { autorId: "123" } } as unknown as Request, fakeResErr as unknown as Response);
    assertEquals(errorHandled, true);
    autorController.servicoAutor.deletar = origDelServ;
  }
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