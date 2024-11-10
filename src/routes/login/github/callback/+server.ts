// routes/login/github/callback/+server.ts
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/session';
import { github } from '$lib/server/github_oauth';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { encodeBase64url } from '@oslojs/encoding';

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase64url(bytes);
	return id;
}

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('github_oauth_state') ?? null;
	console.log(code, state, storedState);
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
		console.error('GHUB err: ', e);
		// Invalid code or client credentials
		return new Response(null, {
			status: 400
		});
	}
	console.log('tokens: ', JSON.stringify(tokens));
	const githubUserResponse = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`
		}
	});
	console.log('githubUserResponse: ', JSON.stringify(githubUserResponse));
	const githubUser = await githubUserResponse.json();
	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;

	// TODO: Replace this with your own DB query.
	const existingUser = await db.query.user.findFirst({
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

	// TODO: Replace this with your own DB query.
	// const user = await createUser(githubUserId, githubUsername);
	const userId = generateUserId();
	const userVal = await db.insert(user).values({
		githubId: githubUserId,
		username: githubUsername,
		createdAt: new Date(),
		profilePictureUrl: githubUser.avatar_url,
		email: githubUser.email,
		id: userId,
		bio: 'Hi, I am new on SnapGram!'
	});

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, userId);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
