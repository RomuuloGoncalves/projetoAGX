import Autor from "../../models/autor.ts";
import { Request, Response } from 'express';
import { validarAutor } from "./autorRules.ts";

async function index(_req: Request, res: Response) {
    try {
        const result = await Autor.find()
        return res.send_ok('Autores listados com sucesso', result);
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar autores', error);
    }
}

async function find(req: Request, res: Response) {
    const id = (req.body) ? req.body : null

    try {
        if(id){
            const result = await Autor.findOne(id)
            return res.send_ok('Autor encontrado', result);
        }
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar autor', error);
    }
}

async function store(req: Request, res: Response) {
    try{
        const erros = validarAutor(req.body)
        
        if (erros && Object.keys(erros).length > 0) {
            return res.status(400).json({ message: "Dados inválidos", erros })
        }

        const autor = await Autor.create(req.body)
        return res.send_created("Autor criado com sucesso", autor)
    } catch (error: unknown) {
        return res.send_internalServerError("Erro ao inserir novo autor", error)
    }
}

async function exclude(req: Request, res: Response) {
    const id = (req.body) ? req.body : null

    try {
        if(id){
            const result = await Autor.deleteOne(id)
            return res.send_ok('Autor excluído', result);
        }
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao excluir autor', error);
    }
}

export {index, find, store, exclude}
