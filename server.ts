import * as livroController from "./entidades/livro/livroController.ts";
import * as usuarioController from "./entidades/usuario/usuarioController.ts";
import * as autorController from "./entidades/autor/autorController.ts";
import * as emprestimoController from "./entidades/emprestimo/emprestimoController.ts";

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
router.get('/livro/find', livroController.find)
router.post('/livro/store', livroController.store)
router.delete('/livro/exclude', livroController.exclude)

router.get('/usuario/', usuarioController.index)
router.get('/usuario/find', usuarioController.find)
router.post('/usuario/store', usuarioController.store)
router.delete('/usuario/exclude', usuarioController.exclude)

router.get('/autor/', autorController.index)
router.get('/autor/find', autorController.find)
router.post('/autor/store', autorController.store)
router.delete('/autor/exclude', autorController.exclude)

router.get('/emprestimo/', emprestimoController.index)
router.get('/emprestimo/find', emprestimoController.find)
router.post('/emprestimo/store', emprestimoController.store)
router.delete('/emprestimo/exclude', emprestimoController.exclude)

export default app;