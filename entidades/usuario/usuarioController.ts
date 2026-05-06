import { Request, Response } from 'express';
import Usuario from "../../models/usuario.ts";
import { validarUsuario } from "./usuarioRules.ts";

async function index(_req: Request, res: Response) {
    try {
        const result = await Usuario.find()
        return res.send_ok('Usuários listados com sucesso', result);
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar usuários', error);
    }
}

async function find(req: Request, res: Response) {
    const id = (req.body) ? req.body : null

    try {
        if(id){
            const result = await Usuario.findOne(id)
            return res.send_ok('Usuário encontrado', result);
        }
    } catch (error: unknown) {
        console.error(error)
        return res.send_internalServerError('Erro ao buscar usuário', error);
    }
}

async function store(req: Request, res: Response) {
    try{
        const erros = validarUsuario(req.body)
        
        if (erros && Object.keys(erros).length > 0) {
            return res.send_badRequest("Dados inválidos", erros )
        }

        console.log(req.body)
        const usuario = await Usuario.create(req.body)
        return res.send_created("Usuário criado com sucesso", usuario)
    } catch (error: unknown) {
        return res.send_internalServerError("Erro ao inserir novo usuário", error)
    }
}

export {index, find, store}