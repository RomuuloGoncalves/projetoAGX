import { conn } from "../connection/conn.ts";

const autorSchema = new conn.mongoose.Schema({
   "nome": String,
   "nacionalidade": String
});

const Autor = conn.mongoose.model("Autor", autorSchema);

export default Autor;
