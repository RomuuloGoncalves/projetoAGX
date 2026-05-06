import { conn } from "../connection/conn.ts";

const livroSchema = new conn.mongoose.Schema({
   "titulo": String,
   "isbn": Number,
   "ano": Number,
   "quantidade_total": Number,
   "quantidade_disponivel": Number
});

const Livro = conn.mongoose.model("Livro", livroSchema);

export default Livro;