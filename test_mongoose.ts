import mongoose from "npm:mongoose";
import "@std/dotenv/load";
const uri = Deno.env.get("MONGO_URI");
try {
  await mongoose.connect(uri!);
  console.log("Mongoose: Conectou com a primeira URI!");
  await mongoose.disconnect();
} catch (e) {
  console.error("Erro Mongoose com MONGO_URI:", e.message);
}
