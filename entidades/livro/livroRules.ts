import requestCheck from 'request-check'
import * as isness from "@zarco/isness";

const rc = requestCheck.default()

rc.addRules('titulo', [
  { 
    validator: (titulo: string) => isness.string(titulo) && titulo.trim().length > 0, 
    message: 'O título precisa ser um texto válido' 
  }
])

rc.addRules('isbn', [
  { 
    validator: (isbn: unknown) => isness.number(isbn), 
    message: 'ISBN inválido' 
  }
])

rc.addRules('ano', [
  { 
    validator: (ano: unknown) => isness.number(ano) && (ano as number) > 0, 
    message: 'Ano inválido' 
  }
])

rc.addRules('quantidade_total', [
  { 
    validator: (qtd: unknown) => isness.number(qtd) && (qtd as number) >= 0, 
    message: 'A quantidade total deve ser um número válido' 
  }
])

rc.addRules('quantidade_disponivel', [
  { 
    validator: (qtd: unknown) => isness.number(qtd) && (qtd as number) >= 0, 
    message: 'A quantidade disponível deve ser um número válido' 
  }
])

export const validarLivro = (data: Record<string, unknown>) => {
  return rc.check(
    { titulo: data.titulo },
    { isbn: data.isbn },
    { ano: data.ano },
    { quantidade_total: data.quantidade_total },
    { quantidade_disponivel: data.quantidade_disponivel }
  )
}
