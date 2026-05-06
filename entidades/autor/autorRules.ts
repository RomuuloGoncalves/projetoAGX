import requestCheck from 'request-check'
import * as isness from "@zarco/isness";

const rc = requestCheck.default()

// add rules
rc.addRules('nome', [
  { 
    validator: (nome: string) => isness.string(nome) && nome.trim().length > 0, 
    message: 'O nome precisa ser um texto válido' 
  }
])

rc.addRules('nacionalidade', [
  { 
    validator: (nacionalidade: string) => typeof nacionalidade === 'string' && nacionalidade.trim().length > 0, 
    message: 'A nacionalidade precisa ser um texto válido' 
  }
])

export const validarAutor = (data: Record<string, unknown>) => {
  return rc.check(
    { nome: data.nome },
    { nacionalidade: data.nacionalidade }
  )
}
