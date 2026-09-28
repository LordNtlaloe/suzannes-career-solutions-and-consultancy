export type User = {
    id: string;
    name: string;
    email: string;
    image?: string | null;

    emailVerified: boolean;

    createdAt: Date;
    updatedAt: Date;

    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: Date | null;

    role?: string | null;

};

export type Auth = {
    user: User;
};

export type Passkey = {
    id: string;
    name: string;
    authenticator: string | null;
    createdAt: Date;
    lastUsedAt: Date | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};