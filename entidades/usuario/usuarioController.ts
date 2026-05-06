import { Request, Response } from 'express';

import Livro from "../../models/livro.ts";
import Usuario from "../../models/usuario.ts";
// import * as isness from "@zarco/isness";


async function index(_req: Request, res: Response) {
    try {
        const result = await Usuario.find().limit(5)
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
            const result = await Usuario.findOne(id)
            return res.send_ok('Livro encontrado', result);
        }
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar livros', error);
    }
}

async function store(req: Request, res: Response) {
    try{
        console.log(req.body)
        const usuario = await Usuario.create(req.body)
        return res.send_created("Usuario criado com sucesso", usuario)
    } catch (error: unknown) {
        return res.send_internalServerError("Erro ao inserir novo livro", error)
    }
}

export {index, find, store}