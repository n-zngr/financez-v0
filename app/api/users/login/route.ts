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
        }

        return response;
    } catch (error) {
        console.error('Login error: ', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await closeDatabaseConnection();
    }
}