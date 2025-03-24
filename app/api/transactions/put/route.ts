import { getCollection, closeDatabaseConnection } from '@/app/utils/mongodb.util';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request) {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transactionId') as string;

    try {
        const body = await request.json();
        let updateData: any = {};

        if (body.name || body.amount || body.type) {
            updateData = {
                name: body.name,
                amount: parseFloat(body.amount),
                type: body.type,
            };
        }

        if (body.receiptFileId) {
            updateData.receiptFileId = new ObjectId(body.receiptFileId);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No changes requested" }, { status: 200 });
        }

        const transactionsCollection = await getCollection('transactions', 'transactions');

        const result = await transactionsCollection.updateOne(
            { _id: new ObjectId(transactionId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        if (result.modifiedCount === 0) {
            return NextResponse.json({ message: "No changes made" }, { status: 200 });
        }

        const response = NextResponse.json({ message: "Transaction updated successfully" }, { status: 200 });

        // CORS headers (used for development)
        response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081');
        response.headers.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;

    } catch (error) {
        console.error('Update transaction error: ', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await closeDatabaseConnection();
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:8081',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Credentials': 'true',
        },
    });

    return response;
}
