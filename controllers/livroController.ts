// import {conn} from "../connection/conn.ts"
import Livro from "../models/livro.ts";
import { Request, Response } from 'express';

// const app = express();
// app.use(responser);
// const collection = conn.db.collection("movies")

async function index(req: Request, res: Response) {
    try {
        const result = await Livro.find().limit(5);
        return res.send_ok('Livros listados com sucesso', result);
    } catch (error) {
        return res.send_internalServerError('Erro ao buscar livros');
    }
}

// function find() {
    // const result = collection.find({_id: '573a1390f29313caabcd42e8'}).toArray()
    // return result
// }

function store() {

}

export {index, store}