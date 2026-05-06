import * as livroController from "./livro/livroController.ts";
import * as usuarioController from "./usuario/usuarioController.ts";

import responser from 'responser'
import express from 'express'
import morgan from 'morgan'

const app = express()
const router = express.Router()

// Para que o req.body consiga recuperar as informações
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs através do morgan
app.use(morgan('combined'))

// const responserMiddleware = typeof responser === 'function' ? responser : (responser as any).default;
const responserMiddleware = responser.default;

app.use(responserMiddleware)
app.use(router)

router.get('/livro/', livroController.index)
router.post('/livro/store', livroController.store)
router.get('/livro/find', livroController.find)

router.get('/usuario/', usuarioController.index)
router.post('/usuario/store', usuarioController.store)


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