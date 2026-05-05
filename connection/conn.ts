// import { MongoClient } from "mongodb";
import throwlhos from 'throwlhos'
import mongoose from "mongoose";

//internos
import { env } from "../config/env.ts";

const mongo_uri = env.mongo_uri
const db_name = env.db_name
const mongo_uri_mongoose = env.mongo_uri_mongoose

// Preciso validar se as variaveis de acesso estão no corretas
if(!mongo_uri){
  throw throwlhos.default.err_internalServerError('MONGO_URI não definida')
}

if(!db_name){
  throw throwlhos.default.err_internalServerError('DB_NAME não definido')
}

// Conexão drive nativo
// try {
//   client = new MongoClient(mongo_uri);
//   await client.connect();
//   db = client.db(db_name);
//   console.log("Conectou com sucesso com o Driver Nativo (mongodb)!");
// } catch (err) {
//   console.error("Erro no Driver Nativo:", err);
// }

// Conexão via mongoose
try {
  if (mongo_uri_mongoose) {
    await mongoose.connect(mongo_uri_mongoose, {
      dbName: db_name, 
      authSource: "admin", //Força o Mongoose a autenticar no banco 'admin'
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Conectado ao MongoDB Cluster via Mongoose: ${db_name}`);
  }
} catch (err: any) {
  console.error("Erro ao conectar no Mongoose:", err);
}

export const conn = {
    // client: client,
    // db: db,
    mongoose: mongoose 
};