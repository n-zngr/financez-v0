import { connectToDatabase, getCollection, closeDatabaseConnection } from '@/app/utils/mongodb.util';
import { NextResponse } from 'next/server';
import { ObjectId, GridFSBucket } from 'mongodb';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const fileId = url.searchParams.get('fileId');

        if (!fileId) {
            return NextResponse.json({ error: 'FileId is required' }, { status: 400 });
        }

        const db = await connectToDatabase('receipts');
        const bucket = new GridFSBucket(db, { bucketName: 'receipts' });
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        const chunks: Uint8Array[] = [];

        for await (const chunk of downloadStream) {
            chunks.push(chunk);
        }

        const fileBuffer = Buffer.concat(chunks);

        const response = new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'image/jpeg', // Adjust content type as needed
            },
        });

        response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;

    } catch (error) {
        console.error('Failed to fetch receipt', error);
        NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await closeDatabaseConnection();
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('receipt') as Blob | null;
        const userId = formData.get('userId') as string | null;
        const transactionId = formData.get('transactionId') as string | null;
        const fileName = formData.get('fileName') as string | null;

        if (!file || !userId || !transactionId || !fileName) {
            return NextResponse.json({ error: 'Missing file, userId, transactionId, or filename' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        // Get the database using connectToDatabase
        const db = await connectToDatabase('receipts');
        const bucket = new GridFSBucket(db, { bucketName: 'receipts' });

        const uploadStream = bucket.openUploadStream(fileName); // use filename from form data.
        uploadStream.write(Buffer.from(buffer));
        uploadStream.end();

        await new Promise((resolve, reject) => {
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
        });

        const fileId = uploadStream.id;

        const transactionsCollection = await getCollection('transactions', 'transactions');
        await transactionsCollection.updateOne(
            { _id: new ObjectId(transactionId) },
            { $set: { receiptFileId: fileId } }
        );

        const response = NextResponse.json({ message: 'Receipt uploaded successfully', fileId: fileId.toString() }, { status: 201 });

        response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;

    } catch (error) {
        console.error('Upload receipt error: ', error);
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
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Credentials': 'true',
        },
    });

    return response;
}