import { index } from "./controllers/livroController.ts";


Deno.serve(async (req) => {
  const url = new URL(req.url);

  console.log(index())
  
  if (url.pathname === "/") { 
    const  resultado = await index();
    console.log(resultado)
    return Response.json(resultado);
  }

  if (url.pathname === "/users") {
    // return Response.json(result);
  }

  return new Response("Not Found", { status: 404 });
});