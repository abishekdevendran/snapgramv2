import { db } from '$lib/server/db';
import { comments, likes, posts, type Image } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';

const full_posts_query = db.query.posts.findMany({
	where: (post, { eq }) => eq(post.userId, sql.placeholder('pc_user_id')),
	orderBy: (posts, { desc }) => desc(posts.createdAt),
	with: {
		images: true
	},
	extras: {
		// TODO: Fix this once Drizzle fixes the issue with $count
		likeCount: db.$count(likes, sql`likes.post_id = posts.id`).as('likesCount'),
		commentCount: db.$count(comments, sql`comments.post_id = posts.id`).as('commentCount'),
	}
}).prepare('get_full_posts');

export const GET = async (event) => {
	if (!event.locals.user) {
		return new Response(null, {
			status: 401
		});
	}
	const posts = await full_posts_query.execute({
		pc_user_id: event.locals.user.id
	});
	return json(posts);
};

export type FullPosts = Awaited<ReturnType<typeof full_posts_query.execute>> extends infer U ? U : never;