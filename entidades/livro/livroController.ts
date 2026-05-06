import Livro from "../../models/livro.ts";
import { Request, Response } from 'express';
// import is from "@zarco/isness"
// import throwlhos from 'throwlhos'
import * as isness from "@zarco/isness";


async function index(_req: Request, res: Response) {
    try {
        const result = await Livro.find().limit(5)
        return res.send_ok('Livros listados com sucesso', result);
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar livros', error);
    }
}

async function find(req: Request, res: Response) {
    const id = (req.body) ? req.body : null

    try {
        if(id){
            const result = await Livro.findOne(id)
            return res.send_ok('Livro encontrado', result);
        }
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar livros', error);
    }
}

async function store(req: Request, res: Response) {
    try{
        if(!isness.alphanumeric(req.body.titulo))
            return res.send_badRequest("O nome precisa ser um texto alfanumérico")

        const livro = await Livro.create(req.body)
        return res.send_created("Livro criado com sucesso", livro)
    } catch (error: unknown) {
        return res.send_internalServerError("Erro ao inserir novo livro", error)
    }
}

export {index, find, store}