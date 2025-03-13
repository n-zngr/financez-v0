import { getCollection, closeDatabaseConnection } from '@/app/utils/mongodb.util';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        /*const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, email: string };
            const userId = decoded.userId;

            if (!user) {
                return NextResponse.json({ error: "Unauthorized: User invalid or could not be found" }, { status: 401 });
            }

        } catch (jwtError) {
            return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
        }*/

        const { name, type, amount, userId } = await request.json();

        if (!name || !type || !amount || !userId) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        if (type !== 'income' && type !== 'expense') {
            return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
        }

        const transactionsCollection = await getCollection('transactions', 'transactions');

        const newTransaction = {
            name,
            type,
            amount: parseFloat(amount),
            userId: new ObjectId(userId),
            createdAt: new Date(),
        };

        const result = await transactionsCollection.insertOne(newTransaction);

        if (!result.acknowledged) {
            return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 });
        }

        return NextResponse.json({ message: "Transaction added successfully", transactionId: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('Add transaction error: ', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await closeDatabaseConnection();
    }
}