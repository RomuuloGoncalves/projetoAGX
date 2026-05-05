// models/Movie.ts
import { conn } from "../connection/conn.ts";

const livroSchema = new conn.mongoose.Schema({
  title: String
});

const Livro = conn.mongoose.model("Livro", livroSchema);

export default Livro;