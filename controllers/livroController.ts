// import {conn} from "../connection/conn.ts"
import Livro from "../models/livro.ts";


// const app = express();
// app.use(responser);
// const collection = conn.db.collection("movies")

function index() {
    // const result = collection.find({}).limit(5).toArray() 
    const result = Livro.find().limit(5) 
    return result 
}

// function find() {
    // const result = collection.find({_id: '573a1390f29313caabcd42e8'}).toArray()
    // return result
// }

function store() {

}

export {index, store}