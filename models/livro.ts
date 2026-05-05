// models/Movie.ts
import { conn } from "../connection/conn.ts";

const livroSchema = new conn.mongoose.Schema({
  
});

const Livro = conn.mongoose.model("Movie", livroSchema);

export default Livro;