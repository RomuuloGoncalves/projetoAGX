import Livro from "../../models/livro.ts";
import { Request, Response } from 'express';
import { validarLivro } from "./livroRules.ts";

async function index(_req: Request, res: Response) {
    try {
        const result = await Livro.find()
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
        const erros = validarLivro(req.body)
        
        if (erros && Object.keys(erros).length > 0) {
            return res.status(400).json({ message: "Dados inválidos", erros })
        }

        const livro = await Livro.create(req.body)
        return res.send_created("Livro criado com sucesso", livro)
    } catch (error: unknown) {
        return res.send_internalServerError("Erro ao inserir novo livro", error)
    }
}

async function exclude(req: Request, res: Response) {
    const id = (req.body) ? req.body : null

    try {
        if(id){
            const result = await Livro.deleteOne(id)
            return res.send_ok('Livro exlcuído', result);
        }
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao excluír livros', error);
    }
}

export {index, find, store, exclude}