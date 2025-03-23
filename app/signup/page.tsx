"use client";

import { useState } from 'react';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        country: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
    
        try {
            const res = await fetch("/api/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
    
            const data = await res.json();
    
            if (res.ok) {
                setMessage("User created successfully!");
                setFormData({ fullname: "", email: "", password: "", country: "" });
            } else {
                setMessage(data.error || "Signup failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setMessage("Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
    
            {message && <p className="mb-4 text-red-600">{message}</p>}
        
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                    className="p-2 border rounded"
                />
        
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="p-2 border rounded"
                />
        
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="p-2 border rounded"
                />
        
                <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="p-2 border rounded"
                />
        
                <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
}