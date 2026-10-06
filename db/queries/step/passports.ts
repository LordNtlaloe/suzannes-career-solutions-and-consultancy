// db/queries/step/passports.ts
import "server-only";

import { database as db } from "@/db/database";
import type {
    StepPassport,
    StepPassportEntry,
    StepPassportShare,
} from "@/types/step";

export async function getLatestPassport(participantId: string): Promise<StepPassport | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_passports WHERE participant_id = ? ORDER BY version DESC LIMIT 1`,
        args: [participantId],
    });
    return (result.rows[0] as unknown as StepPassport | undefined) ?? null;
}

export async function createPassport(input: {
    id: string;
    participantId: string;
    version: number;
}): Promise<void> {
    await db.execute({
        sql: `INSERT INTO step_passports (id, participant_id, version, status, created_at) VALUES (?, ?, ?, 'draft', unixepoch())`,
        args: [input.id, input.participantId, input.version],
    });
}

export async function verifyPassport(passportId: string, verifiedBy: string): Promise<void> {
    await db.execute({
        sql: `UPDATE step_passports SET status = 'verified', verified_by = ?, verified_at = unixepoch() WHERE id = ?`,
        args: [verifiedBy, passportId],
    });
}

export async function addPassportEntry(input: {
    id: string;
    passportId: string;
    enrolmentId: string | null;
    entryType: string;
    title: string;
    sourceType: string;
    sourceId: string;
    verifiedBy: string;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_passport_entries (
                id, passport_id, enrolment_id, entry_type, title,
                source_type, source_id, verified_by, verified_at, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), 'verified', unixepoch())
        `,
        args: [
            input.id,
            input.passportId,
            input.enrolmentId,
            input.entryType,
            input.title,
            input.sourceType,
            input.sourceId,
            input.verifiedBy,
        ],
    });
}

export async function revokePassportEntry(entryId: string): Promise<void> {
    await db.execute({
        sql: `UPDATE step_passport_entries SET status = 'revoked' WHERE id = ?`,
        args: [entryId],
    });
}

export async function listPassportEntries(passportId: string): Promise<StepPassportEntry[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_passport_entries WHERE passport_id = ? ORDER BY created_at ASC`,
        args: [passportId],
    });
    return result.rows as unknown as StepPassportEntry[];
}

export async function createPassportShare(input: {
    id: string;
    passportId: string;
    token: string;
    scope: string;
    fields: string | null;
    expiresAt: number | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_passport_shares (id, passport_id, token, scope, fields, expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, unixepoch())
        `,
        args: [input.id, input.passportId, input.token, input.scope, input.fields, input.expiresAt],
    });
}

export async function revokePassportShare(shareId: string): Promise<void> {
    await db.execute({
        sql: `UPDATE step_passport_shares SET revoked_at = unixepoch() WHERE id = ?`,
        args: [shareId],
    });
}

export async function getPassportById(passportId: string): Promise<StepPassport | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_passports WHERE id = ?`,
        args: [passportId],
    });
    return (result.rows[0] as unknown as StepPassport | undefined) ?? null;
}

export async function listPassportShares(passportId: string): Promise<StepPassportShare[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_passport_shares WHERE passport_id = ? ORDER BY created_at DESC`,
        args: [passportId],
    });
    return result.rows as unknown as StepPassportShare[];
}

export async function getPassportShareById(shareId: string): Promise<StepPassportShare | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_passport_shares WHERE id = ?`,
        args: [shareId],
    });
    return (result.rows[0] as unknown as StepPassportShare | undefined) ?? null;
}

export async function getPassportShareByToken(
    token: string,
): Promise<(StepPassportShare & { participant_id: string | null }) | null> {
    const result = await db.execute({
        sql: `
            SELECT ps.*, p.participant_id AS participant_id
            FROM step_passport_shares ps
            JOIN step_passports p ON p.id = ps.passport_id
            WHERE ps.token = ?
              AND ps.revoked_at IS NULL
              AND (ps.expires_at IS NULL OR ps.expires_at > unixepoch())
              AND p.status = 'verified'
        `,
        args: [token],
    });
    return (
        (result.rows[0] as unknown as
            | (StepPassportShare & { participant_id: string | null })
            | undefined) ?? null
    );
}

/**
 * Public share view: the share, the participant's display name and the
 * verified entries permitted by the share's scope/field filter.
 */
export async function getPassportShareView(token: string): Promise<{
    share: StepPassportShare & { participant_id: string | null };
    participantName: string | null;
    passportStatus: string;
    entries: StepPassportEntry[];
} | null> {
    const share = await getPassportShareByToken(token);
    if (!share) return null;

    const passport = await getPassportById(share.passport_id);
    if (!passport) return null;

    const participantResult = await db.execute({
        sql: `
            SELECT u.name AS name
            FROM step_participants p
            JOIN user u ON u.id = p.user_id
            WHERE p.id = ?
        `,
        args: [share.participant_id ?? ""],
    });

    const allEntries = await listPassportEntries(share.passport_id);
    const verified = allEntries.filter((e) => e.status === "verified");

    // Field permissions: a JSON array of permitted entry types (or source
    // types). No permitted fields on a limited share → identity/status only.
    let permitted: string[] | null = null;
    if (share.fields) {
        try {
            permitted = JSON.parse(share.fields) as string[];
        } catch {
            permitted = null;
        }
    }

    const entries =
        share.scope === "full"
            ? verified
            : permitted && permitted.length > 0
              ? verified.filter(
                    (e) =>
                        permitted!.includes(e.entry_type) ||
                        (e.source_type ? permitted!.includes(e.source_type) : false),
                )
              : [];

    return {
        share,
        participantName: (participantResult.rows[0] as { name?: string } | undefined)?.name ?? null,
        passportStatus: passport.status,
        entries,
    };
}
