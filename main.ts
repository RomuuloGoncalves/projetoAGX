import { index, find, store } from "./controllers/livroController.ts";

import responser from 'responser'
import express from 'express'

const app = express()
const router = express.Router()
app.use(express.json()); // <- ESSENCIAL pra JSON
app.use(express.urlencoded({ extended: true })); // opcional, mas comum

// const responserMiddleware = typeof responser === 'function' ? responser : (responser as any).default;

const responserMiddleware = responser.default;

app.use(responserMiddleware) // add responser middleware
app.use(router)

router.get('/', index)

router.post('/store', store)

router.get('/find', find)


app.listen(8000, () => {
  console.log("Servidor rodando na porta 8000");
});



// Deno.serve(async (req) => {
//   const url = new URL(req.url);

//   console.log(index())
  
//   if (url.pathname === "/") { 
//     const  resultado = await index();
//     console.log(resultado)
//     return Response.json(resultado);
//   }

//   if (url.pathname === "/users") {
//     // return Response.json(result);
//   }

//   return new Response("Not Found", { status: 404 });
// });