import "@std/dotenv/load";

export const env = {
    mongo_uri: Deno.env.get('MONGO_URI'),
    db_name: Deno.env.get('DB_NAME')
}