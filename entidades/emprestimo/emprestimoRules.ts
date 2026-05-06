import requestCheck from 'request-check'
import * as isness from "@zarco/isness";

const rc = requestCheck.default()

rc.addRules('usuario_id', [
  { 
    validator: (usuario_id: string) => isness.string(usuario_id) && usuario_id.trim().length > 0, 
    message: 'O id do usuário é obrigatório' 
  }
])

rc.addRules('livro_id', [
  { 
    validator: (livro_id: string) => isness.string(livro_id) && livro_id.trim().length > 0, 
    message: 'O id do livro é obrigatório' 
  }
])

rc.addRules('data_emprestimo', [
  { 
    validator: (data_emprestimo: string) => isness.date(data_emprestimo), 
    message: 'A data de empréstimo precisa ser válida' 
  }
])

export const validarEmprestimo = (data: Record<string, unknown>) => {
  return rc.check(
    { usuario_id: data.usuario_id },
    { livro_id: data.livro_id },
    { data_emprestimo: data.data_emprestimo }
  )
}
