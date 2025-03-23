/*import { getCollection } from '@/app/utils/mongodb.util';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
    try {
        const { name, type, amount, userId } = await request.json();

        if (!name || !type || !amount || !userId) {
            return NextResponse.json({ error: "Name, type, amount, and userId are required" }, { status: 400 });
        }

        if (type !== 'income' && type !== 'expense') {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        const transactionsCollection = getCollection('transactions', 'transactions');

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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}*/