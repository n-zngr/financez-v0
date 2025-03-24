import { getCollection, closeDatabaseConnection } from '@/app/utils/mongodb.util';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
        }

        const transactionsCollection = await getCollection('transactions', 'transactions');
        const transactions = await transactionsCollection.find({ userId: new ObjectId(userId)}).toArray();

        const serializedTransactions = transactions.map(transaction => ({
            ...transaction,
            _id: transaction._id.toString(),
            userId: transaction.userId.toString()
        }));

        const response = NextResponse.json(serializedTransactions);

        response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;

    } catch (error) {
        console.error('Get transactions error: ', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await closeDatabaseConnection()
    }
}

export async function POST(request: Request) {
    try {

        const { userId, name, type, amount } = await request.json();

        if (!userId || !name || !type || !amount) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        if (type !== 'income' && type !== 'expense') {
            return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
        }

        const transactionsCollection = await getCollection('transactions', 'transactions');

        const newTransaction = {
            userId: new ObjectId(userId),
            name,
            type,
            amount: parseFloat(amount),
            createdAt: new Date(),
        };

        const result = await transactionsCollection.insertOne(newTransaction);

        if (!result.acknowledged) {
            return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 });
        }

        const response = NextResponse.json({ message: "Transaction added successfully", transactionId: result.insertedId }, { status: 201 });

        // CORS headers (used for development)
        response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;
    } catch (error) {
        console.error('Add transaction error: ', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await closeDatabaseConnection();
    }
}

export async function OPTIONS() {
    // CORS options (used for development)
    const response = new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:8081',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Credentials': 'true',
        },
    });

    return response;
}