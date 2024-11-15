import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

const full_followings_query = db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.userId, sql.placeholder('user_id')),
}).prepare('get_full_followers');

export const GET = async (event) => {
	if (!event.locals.user) {
		return new Response(null, {
			status: 401
		});
	}
	const followings = await full_followings_query.execute({
		user_id: event.locals.user.id
	});
	return json(followings);
};

export type FullFollowings = Awaited<ReturnType<typeof full_followings_query.execute>> extends infer U ? U : never;