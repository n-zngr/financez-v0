import { getCollection } from "@/app/utils/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    try {
        const { fullname, email, password, country } = await req.json();

        if (!fullname || !email || !password || !country) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const usersCollection = getCollection("users");

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            userId: new ObjectId().toString(),
            fullname,
            email,
            password: hashedPassword,
            country,
            createdAt: new Date(),
        };

        await usersCollection.insertOne(newUser);
      
        return NextResponse.json({ message: "User created successfully" });
    } catch (error) {
          console.error("Signup error:", error);
          return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}