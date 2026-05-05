

## Documentação de Problemas Resolvidos (Troubleshooting)

### Conexão com Mongoose vs Módulo Nativo Deno (`bad auth : authentication failed`)

**O que aconteceu:**
Durante o desenvolvimento, a inicialização com o Web Driver nativo do MongoDB (`npm:mongodb`) funcionava com sucesso, no entanto, ao migrar para a conexão via `npm:mongoose` com a mesma *Connection String*, o terminal sistematicamente apresentava a mensagem de falha `MongoServerError: bad auth : authentication failed`, abortando a aplicação.

**Qual era o problema:**
A confusão não envolvia erro de digitação nem problema com o banco gerado na nuvem (Atlas). O core do Deno utiliza *polyfills* para habilitar os módulos clássicos do Node.js. 
Acontece que o ambiente do projeto estava forçando o *download* do `mongoose@9.x`, o qual demanda internamente suporte para o driver original de conexão `mongodb@7.x`. Esse driver v7 conta com novos recursos de algoritmos de hash como o SCRAM (mecanismo que criptografa e embaralha as senhas antes do envio via rede). Como o módulo `node:crypto` não executava de forma congruente na V8 atual do Deno, a criptografia da URL se quebrava. Em virtude disso, o MongoDB Atlas recusava o acesso (devolvendo a premissa de `bad auth`), ocultando a verdadeira barreira técnica.

**Qual foi a solução:**
A solução imediata efetuada no projeto foi o de realizar um leve *downgrade* alterando o registro atrelado ao `deno.json`. Retornamos à última estirpe mais madura e compatível: `npm:mongoose@^8.9.5`. 
Ao forçar a execução por meio da versão v8, o Mongoose volta a alocar as metodologias de encriptação fornecidas pelo nativo `mongodb@6.1.0` (as mesmas utilizadas na versão pura que funcionava o tempo todo), eliminando as incompatibilidades de hash e solidificando as transações na nuvem.