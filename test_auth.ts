import { MongoClient } from "npm:mongodb";
import "@std/dotenv/load";
const uri = Deno.env.get("MONGO_URI");
const client = new MongoClient(uri!);
try {
  await client.connect();
  console.log("MongoDB Nativo: Conectou com a primeira URI!");
  await client.close();
} catch (e) {
  console.error("Erro driver Nativo com MONGO_URI:", e.message);
}

const uri2 = Deno.env.get("MONGO_URI_MONGOOSE");
const client2 = new MongoClient(uri2!);
try {
  await client2.connect();
  console.log("MongoDB Nativo: Conectou com MONGO_URI_MONGOOSE!");
  await client2.close();
} catch (e) {
  console.error("Erro driver Nativo com MONGO_URI_MONGOOSE:", e.message);
}
