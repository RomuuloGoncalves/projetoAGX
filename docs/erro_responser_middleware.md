# Resolução de Erro: app.use() requires a middleware function (Deno + Express)

## O Problema

Ao utilizar bibliotecas npm mais antigas ou baseadas em CommonJS (como no caso do middleware `responser`) em um projeto Deno através da compatibilidade com o Node (`npm:` specifier), você pode se deparar com o seguinte erro ao utilizar o Express:

```text
error: Uncaught (in promise) TypeError: app.use() requires a middleware function
    throw new TypeError('app.use() requires a middleware function')
...
```

Isso acontece porque, no momento da importação do módulo npm, o Deno acaba encapsulando a "função pura" referenciando-a em uma propriedade chamada `default`.  
Sendo assim, em vez de `responser` ser a própria função de middleware, o objeto recebido acaba sendo:

```javascript
{ default: [Function: responser] }
```

Como o `app.use()` do Express espera estritamente uma função, ele lança a exceção ao identificar o objeto.

## A Solução

Para resolver esse comportamento no Deno sem quebrar eventuais compatibilidades futuras, o ideal é inspecionar o que a importação nos devolveu e extrair o `.default` de forma condicional:

```typescript
import responser from 'responser';
import express from 'express';

const app = express();

// Extrai a função independentemente de como o Deno resolver a exportação
const responserMiddleware = typeof responser === 'function' ? responser : (responser as any).default;

app.use(responserMiddleware);
```

Dessa maneira, mitigamos as diferenças de formato de importação de CommonJS/ESM no Deno e garantimos o funcionamento estável dos middlewares do Express.
