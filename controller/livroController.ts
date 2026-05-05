import {conn} from "../connection/conn.ts"
import _express from 'express'
import _responser from 'responser'

// const app = express();
// app.use(responser);
const collection = conn.db.collection("movies")

function index() {
    const result = collection.find({}).limit(5).toArray() 
    return result 
}

function find() {
    // const result = collection.find({_id: '573a1390f29313caabcd42e8'}).toArray()
    // return result
}

function store() {

}

export {index, store}