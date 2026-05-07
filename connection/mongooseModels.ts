import { conn } from "./conn.ts";

const autorSchema = new conn.mongoose.Schema({
  nome: String,
  nacionalidade: String,
});

const livroSchema = new conn.mongoose.Schema({
  titulo: String,
  isbn: Number,
  ano: Number,
  quantidade_total: Number,
  quantidade_disponivel: Number,
});

const usuarioSchema = new conn.mongoose.Schema({
  nome: String,
  email: String,
  senha: String,
  cpf: String,
  data_nascimento: Date,
});

const emprestimoSchema = new conn.mongoose.Schema({
  usuario_id: conn.mongoose.Schema.Types.ObjectId,
  livro_id: conn.mongoose.Schema.Types.ObjectId,
  data_emprestimo: Date,
  data_devolucao: { type: Date, default: null },
  status: { type: String, enum: ["ativo", "devolvido"], default: "ativo" },
});

export const AutorMongoDB = conn.mongoose.models.Autor ?? conn.mongoose.model("Autor", autorSchema);
export const LivroMongoDB = conn.mongoose.models.Livro ?? conn.mongoose.model("Livro", livroSchema);
export const UsuarioMongoDB = conn.mongoose.models.Usuario ?? conn.mongoose.model("Usuario", usuarioSchema);
export const EmprestimoMongoDB = conn.mongoose.models.Emprestimo ?? conn.mongoose.model("Emprestimo", emprestimoSchema);
