import { MongoClient } from "mongodb";

//imports internos
import { env } from "../config/env.ts";

const mongo_uri = env.mongo_uri
if(!mongo_uri){
  throw new Error("MONGO_URI não definida");
}

const db_name = env.db_name
if(!db_name){
  throw new Error("DB_NAME não definido");
}

const client = new MongoClient(mongo_uri);
await client.connect();

const db = client.db(db_name)

export const conn = {
    client: client,
    db: db
}
