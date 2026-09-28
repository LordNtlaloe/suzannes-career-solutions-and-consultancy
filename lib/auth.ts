// ./lib/auth.ts
import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

const dialect = new LibsqlDialect({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export const auth = betterAuth({
    database: dialect,
    type: "sqlite",
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                required: false,
            }
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // update session every 24 hours
    }
});