import { conn } from "../connection/conn.ts";

const emprestimoSchema = new conn.mongoose.Schema({
   "usuario_id": conn.mongoose.Schema.Types.ObjectId,
   "livro_id": conn.mongoose.Schema.Types.ObjectId,
   "data_emprestimo": Date,
   "data_devolucao": { type: Date, default: null },
   "status": { type: String, enum: ['ativo', 'devolvido'], default: 'ativo' }
});

const Emprestimo = conn.mongoose.model("Emprestimo", emprestimoSchema);

export default Emprestimo;
