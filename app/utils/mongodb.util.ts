import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('MongoDB URI not found in environment.');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(databaseName: string): Promise<Db> {
    if (cachedClient && cachedDb && cachedDb.databaseName === databaseName) {
        return cachedDb;
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(databaseName);

        cachedClient = client;
        cachedDb = db;

        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export async function getCollection(databaseName: string, collectionName: string): Promise<Collection> {
    const db = await connectToDatabase(databaseName);
    return db.collection(collectionName);
}


export async function closeDatabaseConnection() {
    if (cachedClient) {
        try {
            await cachedClient.close();
            cachedClient = null;
            cachedDb = null;
        } catch (error) {
            console.error("Error closing the database connection", error);
        }
    }
}
