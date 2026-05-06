import { conn } from "../connection/conn.ts";

const usuarioSchema = new conn.mongoose.Schema({
   "nome": String,
   "email": String,
   "senha": String,
   "cpf": Number,
   "dataNasc": Date,
});

const Usuario = conn.mongoose.model("Usuario", usuarioSchema);

export default Usuario;