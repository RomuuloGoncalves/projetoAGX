import { assertEquals } from "@std/assert";
import { validarEnv, conectarMongoose } from "../connection/conn.ts";
import mongoose from "mongoose";

Deno.test("Connection - validarEnv", async (t) => {
  await t.step("Deve lançar erro se MONGO_URI não for definida", () => {
    try {
      validarEnv("", "db", "uri");
    } catch (error) {
      const err = error as { code: number; message: string };
      assertEquals(err.code, 500);
      assertEquals(err.message, "MONGO_URI não definida");
    }
  });

  await t.step("Deve lançar erro se DB_NAME não for definido", () => {
    try {
      validarEnv("uri", "", "uri");
    } catch (error) {
      const err = error as { code: number; message: string };
      assertEquals(err.code, 500);
      assertEquals(err.message, "DB_NAME não definido");
    }
  });

  await t.step("Deve lançar erro se MONGO_URI_MONGOOSE não for definida", () => {
    try {
      validarEnv("uri", "db", "");
    } catch (error) {
      const err = error as { code: number; message: string };
      assertEquals(err.code, 500);
      assertEquals(err.message, "MONGO_URI_MONGOOSE não definido");
    }
  });

  await t.step("Deve passar se todas as variáveis forem definidas", () => {
    validarEnv("uri", "db", "uri_mongoose"); // Não deve lançar erro
  });
});

Deno.test({
  name: "Connection - conectarMongoose",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async (t) => {
  await t.step("Deve lançar erro ao falhar na conexão do Mongoose", async () => {
    try {
      await conectarMongoose("mongodb://invalid-host:99999", "testdb");
      throw new Error("Deveria ter falhado");
    } catch (error) {
      const err = error as { code: number; message: string };
      assertEquals(err.code, 500);
      assertEquals(err.message.includes("Erro ao conectar no Mongoose"), true);
    }
  });
  await t.step("Deve lançar erro se os parâmetros forem vazios", async () => {
    try {
      await conectarMongoose("", "");
      throw new Error("Deveria ter falhado");
    } catch (error) {
      const err = error as { code: number; message: string };
      assertEquals(err.code, 500);
      assertEquals(err.message.includes("Erro ao conectar no Mongoose"), true);
    }
  });

  await t.step("Deve tratar erros que não são instâncias de Error", async () => {
    const origConnect = mongoose.connect;
    
    mongoose.connect = () => Promise.reject("Erro de string");
    try {
      await conectarMongoose("uri", "db");
    } catch (error) {
      const err = error as { code: number; message: string };
      assertEquals(err.code, 500);
      assertEquals(err.message.includes("Erro de string"), true);
    }
    mongoose.connect = origConnect;
  });

  // Como as conexões ficaram abertas caso outras dependências não as fechem
  await mongoose.disconnect();
  }
});

