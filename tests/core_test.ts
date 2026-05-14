import { assertEquals } from "@std/assert";
import { tratarErroHttp } from "../features/httpErrorHandler.ts";
import RepositoryBase from "../core/CoreRepository.ts";
import { authMiddleware } from "../core/authMiddleware.ts";
import ModeloBase from "../core/CoreModel.ts";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

Deno.test("Core - httpErrorHandler", async (t) => {
  let statusCalled = 0;
  let _bodyCalled: unknown = null;

  const fakeResponse = {
    send_forbidden: (msg: string) => { statusCalled = 403; _bodyCalled = msg; return fakeResponse; },
    send_notFound: (msg: string) => { statusCalled = 404; _bodyCalled = msg; return fakeResponse; },
    send_internalServerError: (msg: string, data?: unknown) => { statusCalled = 500; _bodyCalled = { msg, data }; return fakeResponse; }
  };

  await t.step("Deve capturar 403", () => {
    statusCalled = 0;
    tratarErroHttp(fakeResponse as unknown as Response, { statusCode: 403, mensagem: "Forb" });
    assertEquals(statusCalled, 403);
  });

  await t.step("Deve capturar 404", () => {
    statusCalled = 0;
    tratarErroHttp(fakeResponse as unknown as Response, { statusCode: 404, mensagem: "Not Found" });
    assertEquals(statusCalled, 404);
  });

  await t.step("Deve capturar 500 default", () => {
    statusCalled = 0;
    tratarErroHttp(fakeResponse as unknown as Response, { mensagem: "Erro" });
    assertEquals(statusCalled, 500);
  });
});

Deno.test("Core - authMiddleware", async (t) => {
  await t.step("Deve retornar unauthorized para token mal formatado", () => {
    let unauthCalled = false;
    const req = { headers: { authorization: "Basic 123" } };
    const res = { send_unauthorized: () => { unauthCalled = true; } };
    authMiddleware(req as unknown as Request, res as unknown as Response, () => {});
    assertEquals(unauthCalled, true);
  });

  await t.step("Deve chamar next() para token valido", () => {
    let nextCalled = false;
    const secret = env.jwt_secret || "super_secret_jwt_key_agx_biblioteca";
    const token = jwt.sign({ id: "123" }, secret);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { locals: {} };
    authMiddleware(req as unknown as Request, res as unknown as Response, () => { nextCalled = true; });
    assertEquals(nextCalled, true);
  });

  await t.step("Deve usar secret default se env.jwt_secret estiver vazio", () => {
    const origSecret = env.jwt_secret;
    
    env.jwt_secret = "";
    
    let nextCalled = false;
    const defaultSecret = "super_secret_jwt_key_agx_biblioteca";
    const token = jwt.sign({ id: "123" }, defaultSecret);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { locals: {} };
    
    authMiddleware(req as unknown as Request, res as unknown as Response, () => { nextCalled = true; });
    
    assertEquals(nextCalled, true);
    
    env.jwt_secret = origSecret;
  });
});

Deno.test("Core - CoreRepository", async (t) => {
  class MockRepo extends RepositoryBase<ModeloBase> {
    constructor(model: unknown) { super(model as unknown as never); }
    converterParaModelo(doc: Record<string, unknown>): ModeloBase { return doc as unknown as never; }
  }

  const fakeModel = {
    find: () => ({ lean: () => [] }),
    findById: () => ({ lean: () => null }),
    findByIdAndUpdate: () => ({ lean: () => null }),
    findByIdAndDelete: () => ({ lean: () => null }),
  };

  const repo = new MockRepo(fakeModel);

  await t.step("obterTodos retorna array vazio quando nulo no BD", async () => {
    assertEquals(await repo.obterTodos(), []);
  });

  await t.step("obterPorId retorna null para ID inválido", async () => {
    assertEquals(await repo.obterPorId("invalido"), null);
  });

  await t.step("obterPorId retorna null quando não acha o documento", async () => {
    // Usar um MongoID válido falso
    const mongoIdValido = "507f1f77bcf86cd799439011";
    assertEquals(await repo.obterPorId(mongoIdValido), null);
  });

  await t.step("atualizarPorId retorna null quando não acha", async () => {
    const mongoIdValido = "507f1f77bcf86cd799439011";
    assertEquals(await repo.atualizarPorId(mongoIdValido, {}), null);
  });

  await t.step("deletarPorId retorna null quando não acha", async () => {
    const mongoIdValido = "507f1f77bcf86cd799439011";
    assertEquals(await repo.deletarPorId(mongoIdValido), null);
  });

  await t.step("criar retorna null quando o modelo falha", async () => {
    const failModel = {
      create: () => Promise.resolve([])
    };
    const failRepo = new MockRepo(failModel);
    assertEquals(await failRepo.criar({ obterDados: () => ({}) } as unknown as never), null);
  });

  await t.step("atualizarPorId retorna null para ID inválido", async () => {
    assertEquals(await repo.atualizarPorId("invalido", {}), null);
  });

  await t.step("deletarPorId retorna null para ID inválido", async () => {
    assertEquals(await repo.deletarPorId("invalido"), null);
  });
});
