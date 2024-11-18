import { db } from '$lib/server/db/index.js';
import { comments, likes } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

const full_user_query = db.query.users
	.findFirst({
		where: (user, { eq }) => eq(user.id, sql.placeholder('user_id'))
	})
	.prepare('get_full_user');

const full_extended_user_query = db.query.users
	.findFirst({
		where: (user, { eq }) => eq(user.id, sql.placeholder('user_id')),
		columns: {},
		with: {
			followers: {
				with: {
					followingUser: true
				}
			},
			following: {
				with: {
					user: true
				}
			}
		}
	})
	.prepare('get_full_extended_user');

export const GET = async (event) => {
	if (!event.locals.user) {
		return new Response(null, {
			status: 401
		});
	}
	if (event.url.searchParams.has('extended')) {
		const user = await full_extended_user_query.execute({
			user_id: event.locals.user.id
		});
		return json(user);
	}
	const user = await full_user_query.execute({
		user_id: event.locals.user.id
	});
	return json(user);
};

export type FullUser =
	Awaited<ReturnType<typeof full_user_query.execute>> extends infer U ? U : never;

export type FullExtendedUser =
	Awaited<ReturnType<typeof full_extended_user_query.execute>> extends infer U ? U : never;
