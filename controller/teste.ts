import {conn} from "../connection/connect.ts"

function index() {
    const collection = conn.db.collection("movies")
    const result = collection.find({}).limit(10).toArray() 
    return result
}

function store() {

}

export {index, store}