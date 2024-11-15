import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

const full_followers_query = db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.followingUserId, sql.placeholder('user_id')),
}).prepare('get_full_followers');

export const GET = async (event) => {
	if (!event.locals.user) {
		return new Response(null, {
			status: 401
		});
	}
	const followers = await full_followers_query.execute({
		user_id: event.locals.user.id
	});
	return json(followers);
};

export type FullFollowers = Awaited<ReturnType<typeof full_followers_query.execute>> extends infer U ? U : never;