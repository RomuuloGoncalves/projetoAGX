import { MongoClient } from "mongodb";

//imports internos
import { env } from "./config/env.ts";

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


Deno.serve(async (req) => {
  const url = new URL(req.url);

  // console.log(url)

  const collection = db.collection("movies");
  const result =  await collection.find({}).limit(10).toArray();
  console.log(result)
  if (url.pathname === "/") {
  }

  if (url.pathname === "/users") {
    // return Response.json(result);
  }

  return new Response("Not Found", { status: 404 });
});