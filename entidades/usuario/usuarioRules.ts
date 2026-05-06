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

rc.addRules('email', [
  { 
    validator: (email: string) => isness.email(email), 
    message: 'E-mail inválido' 
  },
])

rc.addRules('senha', [
  { 
    validator: (senha: string) => (isness.alphanumeric(senha) || isness.number(senha)), 
    message: 'A senha precisa ser alfanumérica' 
  },
  {
    validator: (senha: string) => senha.length >= 8,
    message: 'A senha precisa ter pelo menos 8 caracteres'
  }
])

rc.addRules('cpf', [
  { 
    validator: (cpf: string) => isness.cpf(cpf), 
    message: 'CPF inválido' 
  },
])

rc.addRules('dataNasc', [
  { 
    validator: (dataNasc: string) => isness.date(dataNasc), 
    message: 'Data de Nascimento inválida' 
  },
])

export const validarUsuario = (data: any) => {
  return rc.check(
    { nome: data.nome },
    { email: data.email }, 
    { senha: data.senha }, 
    { cpf: data.cpf },
    { dataNasc: data.dataNasc },
  )
} 