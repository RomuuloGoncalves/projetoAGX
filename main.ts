import app from "./server.ts";

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