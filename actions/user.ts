// ./app/actions/user.ts
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateUserRole(userId: string, role: "user" | "admin" | "moderator") {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Only admins can change roles
    if (session?.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    // Use Better Auth's updateUser endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/update-user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
            role
        })
    });

    if (!response.ok) {
        throw new Error("Failed to update user role");
    }

    return response.json();
}