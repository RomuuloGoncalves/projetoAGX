// import { MongoClient } from "mongodb";
import throwlhos from 'throwlhos'
import mongoose from "mongoose";

//internos
import { env } from "../config/env.ts";

const mongo_uri = env.mongo_uri
const db_name = env.db_name
const mongo_uri_mongoose = env.mongo_uri_mongoose

export function validarEnv(uri: string | undefined, name: string | undefined, uri_mongoose: string | undefined) {
  if (!uri) {
    throw throwlhos.default.err_internalServerError('MONGO_URI não definida');
  }
  if (!name) {
    throw throwlhos.default.err_internalServerError('DB_NAME não definido');
  }
  if (!uri_mongoose) {
    throw throwlhos.default.err_internalServerError('MONGO_URI_MONGOOSE não definido');
  }
}

validarEnv(mongo_uri, db_name, mongo_uri_mongoose);

// Conexão com mongoose
export async function conectarMongoose(uri_mongoose: string | undefined, name: string | undefined) {
  try {
    if (!uri_mongoose || !name) throw new Error("Parâmetros inválidos para conexão");
    await mongoose.connect(uri_mongoose, {
      dbName: name,
      authSource: "admin",
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Conectado ao MongoDB Cluster via Mongoose: ${name}`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw throwlhos.default.err_internalServerError(`Erro ao conectar no Mongoose: ${errorMessage}`);
  }
}

await conectarMongoose(mongo_uri_mongoose, db_name);

export const conn = {
    // client: client,
    // db: db,
    mongoose: mongoose 
};