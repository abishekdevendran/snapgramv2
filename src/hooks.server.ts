import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/session';
import { encodeBase32LowerCase } from '@oslojs/encoding';

Sentry.init({
	dsn: 'https://c407ca5909c30175b1988f24d15081a7@o4508274259263488.ingest.de.sentry.io/4508274273026128',
	tracesSampleRate: 1
});

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(20));
	const token = encodeBase32LowerCase(bytes);
	return token;
}

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = sequence(Sentry.sentryHandle(), handleAuth);
export const handleError = Sentry.handleErrorWithSentry();
