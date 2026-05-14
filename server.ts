import * as livroController from "./features/livro/livroController.ts";
import * as usuarioController from "./features/usuario/usuarioController.ts";
import * as autorController from "./features/autor/autorController.ts";
import * as emprestimoController from "./features/emprestimo/emprestimoController.ts";
import * as authController from "./features/auth/authController.ts";
import { authMiddleware } from "./core/authMiddleware.ts";
import { adminMiddleware } from "./core/adminMiddleware.ts";

import responser from "responser";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json" with { type: "json" };

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

// Documentação Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas de AUTENTICACAO
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);

// Rotas para LIVRO
router.get("/livro", livroController.listar);
router.get("/livro/:livroId", livroController.buscar);
router.post("/livro", livroController.criar);
router.put("/livro/:livroId", livroController.atualizar);
router.delete("/livro/:livroId", livroController.deletar);

// Rotas para USUARIO
router.get("/usuario", usuarioController.listar);
router.get("/usuario/:usuarioId", usuarioController.buscar);
router.post("/usuario", usuarioController.criar);
router.put("/usuario/:usuarioId", usuarioController.atualizar);
router.delete("/usuario/:usuarioId", usuarioController.deletar);

// Rotas para AUTOR
router.get("/autor", autorController.listar);
router.get("/autor/:autorId", autorController.buscar);
router.post("/autor", autorController.criar);
router.put("/autor/:autorId", autorController.atualizar);
router.delete("/autor/:autorId", autorController.deletar);

// Rotas para EMPRESTIMO (Rotas Privadas)
router.get("/emprestimo", authMiddleware, emprestimoController.listar);
router.get("/emprestimo/:emprestimoId", authMiddleware, emprestimoController.buscar);
router.post("/emprestimo", authMiddleware, adminMiddleware, emprestimoController.criar);
router.put("/emprestimo/:emprestimoId", authMiddleware, adminMiddleware, emprestimoController.atualizar);
router.post("/emprestimo/:emprestimoId/devolver", authMiddleware, adminMiddleware, emprestimoController.devolver);
router.delete("/emprestimo/:emprestimoId", authMiddleware, adminMiddleware, emprestimoController.deletar);

export default app;
