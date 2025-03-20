import { getCollection, closeDatabaseConnection } from '@/app/utils/mongodb.util';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const usersCollection = await getCollection('users', 'users');
        const user = await usersCollection.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const response = NextResponse.json({ message: "Login successful" });

        // CORS headers
        response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081'); // Or use the origin from the request, or '*' during development.
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        /* Temporarily remove tokens
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Detects if web-request from web (cookies) or mobile (JWT in response)
        const isWeb = request.headers.get('user-agent')?.includes('Mozilla');

        const response = NextResponse.json({ message: "Login successful", token: isWeb ? undefined : token });

        if (isWeb) {
            response.cookies.set('session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });
        }*/

        return response;
        //return NextResponse.json({ message: "Login successful" }); // Temporary new response
    } catch (error) {
        console.error('Login error: ', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await closeDatabaseConnection();
    }
}

export async function OPTIONS(request: Request) {
    const response = new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:8081', // Or use the origin from the request, or '*' during development.
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Credentials': 'true',
        },
    });

    return response;
}