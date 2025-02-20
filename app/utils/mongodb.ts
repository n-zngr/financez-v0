import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error('MongoDB URI not found in environment.')
}

let client = new MongoClient(uri);
const db = client.db('users');

export const getCollection = (name: string) => db.collection(name);