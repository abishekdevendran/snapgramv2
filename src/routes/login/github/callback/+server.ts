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
	console.log('tokens: ', JSON.stringify(tokens));
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
		console.log('GHUB err: ', await githubUserResponseClone.text());
		return new Response(null, {
			status: 400
		});
	}
	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;

	// TODO: Replace this with your own DB query.
	const existingUser = await db.query.user.findFirst({
		where: (users, { eq }) => eq(users.githubId, githubUserId)
	});

	if (existingUser) {
		console.log('existingUser: ', existingUser);
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

	console.log('new user: ', githubUser);

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

	console.log('inserted user: ', userVal);

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, userId);
	console.log('session: ', session);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	console.log('set cookie');
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
