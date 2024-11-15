import { db } from '$lib/server/db/index.js';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

const full_user_query = db.query.users
	.findFirst({
		where: (user, { eq }) => eq(user.id, sql.placeholder('user_id'))
	})
	.prepare('get_full_user');

export const GET = async (event) => {
	if (!event.locals.user) {
		return new Response(null, {
			status: 401
		});
	}
	const user = await full_user_query.execute({
		user_id: event.locals.user.id
	});
	return json(user);
};

export type FullUser =
	Awaited<ReturnType<typeof full_user_query.execute>> extends infer U ? U : never;
