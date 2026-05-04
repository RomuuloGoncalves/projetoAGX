import { MongoClient } from "npm:mongodb@6.1.0";

const client = new MongoClient(
  "mongodb+srv://romulogoncalves_db_user:iApzowQfe1T8tuTY@cluster0.1ci50pm.mongodb.net/test?retryWrites=true&w=majority&authSource=admin"
);

await client.connect();

const db = client.db("sample_mflix");
const collection = db.collection("movies");

// busca tudo (limitado)
// const result = await collection.find({}).limit(10).toArray();


// const result = await collection.find({});

// for await (const doc of result) {
//   console.log(doc);
// }

const result = await collection.find({}).limit(10).toArray();

console.log(result)
