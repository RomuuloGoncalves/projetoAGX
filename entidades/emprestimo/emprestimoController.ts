import Emprestimo from "../../models/emprestimo.ts";
import { Request, Response } from 'express';
import { validarEmprestimo } from "./emprestimoRules.ts";

async function index(_req: Request, res: Response) {
    try {
        const result = await Emprestimo.find()
        return res.send_ok('Empréstimos listados com sucesso', result);
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar empréstimos', error);
    }
}

async function find(req: Request, res: Response) {
    const id = (req.body) ? req.body : null

    try {
        if(id){
            const result = await Emprestimo.findOne(id)
            return res.send_ok('Empréstimo encontrado', result);
        }
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar empréstimo', error);
    }
}

async function store(req: Request, res: Response) {
    try{
        const erros = validarEmprestimo(req.body)
        
        if (erros && Object.keys(erros).length > 0) {
            return res.status(400).json({ message: "Dados inválidos", erros })
        }

        const emprestimo = await Emprestimo.create(req.body)
        return res.send_created("Empréstimo criado com sucesso", emprestimo)
    } catch (error: unknown) {
        return res.send_internalServerError("Erro ao inserir novo empréstimo", error)
    }
}

async function exclude(req: Request, res: Response) {
    const id = (req.body) ? req.body : null

    try {
        if(id){
            const result = await Emprestimo.deleteOne(id)
            return res.send_ok('Empréstimo excluído', result);
        }
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao excluir empréstimo', error);
    }
}

export {index, find, store, exclude}
