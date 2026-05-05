import { index } from "./controllers/livroController.ts";

import responser from 'responser'
import express, { Request, Response } from 'express'

const app = express()
const router = express.Router()

const responserMiddleware = typeof responser === 'function' ? responser : (responser as any).default;
app.use(responserMiddleware) // add responser middleware
app.use(router)

router.get('/hello', (req: Request, res: Response) => {
  res.send_badRequest('Request is wrong!')
})

router.get('/', index)

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