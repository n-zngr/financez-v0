import { getCollection, closeDatabaseConnection } from "@/app/utils/mongodb.util";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { fullname, email, password, country } = await req.json();

        if (!fullname || !email || !password || !country) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const usersCollection = await getCollection('users', 'users');

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            fullname,
            email,
            password: hashedPassword,
            country,
            createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);

        if (!result.acknowledged) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }
        
        const userId = result.insertedId;

        return NextResponse.json({ message: "User created successfully", userId: userId.toString() });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await closeDatabaseConnection();
    }
}