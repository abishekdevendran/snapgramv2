import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from './db';
import { user, type User } from './db/schema';
import { redisClient } from '$lib/server/db/redis';

export const sessionCookieName = 'auth-session';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};
	await redisClient.set(
		`session:${session.id}`,
		JSON.stringify({
			id: session.id,
			user_id: session.userId,
			expires_at: Math.floor(Number(session.expiresAt) / 1000)
		}),
		{ ex: Math.floor(Number(session.expiresAt) / 1000) }
	);
	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = (await redisClient.get(`session:${sessionId}`)) as {
		id: string;
		user_id: string;
		expires_at: number;
	} | null;
	if (result === null) {
		return {
			session: null,
			user: null
		};
	}
	// get user
	const user = await db.query.user.findFirst({
		where: (user, { eq }) => eq(user.id, result.user_id)
	});
	if (!user) {
		await redisClient.del(`session:${sessionId}`);
		return {
			session: null,
			user: null
		};
	}
	const session: Session = {
		id: result.id,
		userId: result.user_id,
		expiresAt: new Date(result.expires_at * 1000)
	};
	if (Date.now() >= session.expiresAt.getTime()) {
		await redisClient.del(`session:${sessionId}`);
		return {
			session: null,
			user: null
		};
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await redisClient.set(
			`session:${session.id}`,
			JSON.stringify({
				id: session.id,
				user_id: session.userId,
				expires_at: Math.floor(Number(session.expiresAt) / 1000)
			}),
			{ ex: Math.floor(Number(session.expiresAt) / 1000) }
		);
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await redisClient.del(`session:${sessionId}`);
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set(sessionCookieName, token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set(sessionCookieName, '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/'
	});
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };
