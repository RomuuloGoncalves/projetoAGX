import mongoose from "npm:mongoose@8.9.5";
import "@std/dotenv/load";
const uri = Deno.env.get("MONGO_URI");
try {
  await mongoose.connect(uri!);
  console.log("Mongoose v8: Conectou com sucesso!");
  await mongoose.disconnect();
} catch (e) {
  console.error("Erro Mongoose v8:", e.message);
}
