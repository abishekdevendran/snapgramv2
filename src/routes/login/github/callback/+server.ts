// routes/login/github/callback/+server.ts
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/auth';
import { github } from '$lib/server/github_oauth';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { encodeBase64url } from '@oslojs/encoding';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('github_oauth_state') ?? null;
	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400
		});
	}
	const githubUserResponse = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`,
			'User-Agent': 'SnapGram'
		}
	});
	let githubUser;
	let githubUserResponseClone = githubUserResponse.clone();
	try {
		githubUser = await githubUserResponse.json();
	} catch (e) {
		console.error('GHUB err: ', await githubUserResponseClone.text());
		return new Response(null, {
			status: 400
		});
	}
	if (!githubUser.email) {
		console.log('No email found, fetching emails');
		const githubUserEmailResponse = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`,
				'User-Agent': 'SnapGram',
				Accept: 'application/vnd.github+json'
			}
		});
		let githubUserEmail;
		let githubUserEmailResponseClone = githubUserEmailResponse.clone();
		try {
			githubUserEmail = await githubUserEmailResponse.json();
			console.log('GHUB emails: ', githubUserEmail);
		} catch (e) {
			console.error('GHUB err: ', await githubUserEmailResponseClone.text());
			return new Response(null, {
				status: 400
			});
		}
		githubUser.email = githubUserEmail.find(
			(email: { primary: boolean; email: string }) => email.primary
		)?.email;
	}
	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;

	// TODO: Replace this with your own DB query.
	const existingUser = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.githubId, githubUserId)
	});

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}

	// check if email is already in use
	const existingEmail = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, githubUser.email)
	});

	if (existingEmail) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login?error=Email already in use'
			}
		});
	}

	// TODO: Replace this with your own DB query.
	// const users = await createUser(githubUserId, githubUsername);
	const userVal = await db.insert(users).values({
		githubId: githubUserId,
		username: githubUsername,
		createdAt: new Date(),
		profilePictureUrl: githubUser.avatar_url,
		email: githubUser.email,
		bio: 'Hi, I am new on SnapGram!',
		name: githubUser.name ?? 'John Doe'
	}).returning();

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, userVal[0].id);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
