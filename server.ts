import * as livroController from "./entidades/livro/livroController.ts";
import * as usuarioController from "./entidades/usuario/usuarioController.ts";
import * as autorController from "./entidades/autor/autorController.ts";
import * as emprestimoController from "./entidades/emprestimo/emprestimoController.ts";

import responser from "responser";
import express from "express";
import morgan from "morgan";

const app = express();
const router = express.Router();

// Para que o req.body consiga recuperar as informações
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs através do morgan
app.use(morgan("combined"));

// const responserMiddleware = typeof responser === 'function' ? responser : (responser as any).default;
const responserMiddleware = responser.default;

app.use(responserMiddleware);
app.use(router);

// Rotas para LIVRO
router.get("/livro", livroController.listar);
router.get("/livro/:livroId", livroController.buscar);
router.post("/livro", livroController.criar);
router.delete("/livro/:livroId", livroController.deletar);

// Rotas para USUARIO
router.get("/usuario", usuarioController.listar);
router.get("/usuario/:usuarioId", usuarioController.buscar);
router.post("/usuario", usuarioController.criar);
router.delete("/usuario/:usuarioId", usuarioController.deletar);

// Rotas para AUTOR
router.get("/autor", autorController.listar);
router.get("/autor/:autorId", autorController.buscar);
router.post("/autor", autorController.criar);
router.delete("/autor/:autorId", autorController.deletar);

// Rotas para EMPRESTIMO
router.get("/emprestimo", emprestimoController.listar);
router.get("/emprestimo/:emprestimoId", emprestimoController.buscar);
router.post("/emprestimo", emprestimoController.criar);
router.delete("/emprestimo/:emprestimoId", emprestimoController.deletar);

export default app;
