import { MongoClient } from "mongodb";
import throwlhos from 'throwlhos'

//internos
import { env } from "../config/env.ts";

const mongo_uri = env.mongo_uri
const db_name = env.db_name

// Preciso validar se as variaveis de acesso estão no corretas
if(!mongo_uri){
  throw throwlhos.default.err_internalServerError('MONGO_URI não definida')
}

if(!db_name){
  throw throwlhos.default.err_internalServerError('DB_NAME não definido')
}

const client = new MongoClient(mongo_uri);
await client.connect();

const db = client.db(db_name)

export const conn = {
    client: client,
    db: db
}
