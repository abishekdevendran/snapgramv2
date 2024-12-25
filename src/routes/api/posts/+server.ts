import { db } from '$lib/server/db';
import { comments, images, likes, posts, type Image } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { encode } from 'blurhash';
import { getPixels } from '@unpic/pixels';

const full_posts_query = db.query.posts
	.findMany({
		where: (post, { eq }) => eq(post.userId, sql.placeholder('pc_user_id')),
		orderBy: (posts, { desc }) => desc(posts.createdAt),
		with: {
			images: true
		},
		extras: {
			// TODO: Fix this once Drizzle fixes the issue with $count
			likeCount: db.$count(likes, sql`likes.post_id = posts.id`).as('likesCount'),
			commentCount: db.$count(comments, sql`comments.post_id = posts.id`).as('commentCount')
		}
	})
	.prepare('get_full_posts');

export const GET = async (event) => {
	if (!event.locals.user) {
		return new Response(null, {
			status: 401
		});
	}
	const posts = await full_posts_query.execute({
		pc_user_id: event.locals.user.id
	});
	return json(posts.filter((el) => el.images.length > 0));
};

const createPostEndpointSchema = z.object({
	caption: z.string(),
	images: z.array(
		z.object({
			url: z.string(),
			caption: z.string().optional().nullable()
		})
	),
	isPrivate: z.boolean()
});

export const POST = async (event) => {
	if (!event.locals.user) {
		return new Response(null, {
			status: 401
		});
	}
	const bodyRaw = await event.request.json();
	console.log(bodyRaw);
	const body = createPostEndpointSchema.safeParse(bodyRaw);
	if (!body.success) {
		console.error(JSON.stringify(body.error, null, 2));
		return new Response(null, {
			status: 400
		});
	}

	const post = (
		await db
			.insert(posts)
			.values({
				userId: event.locals.user.id,
				caption: body.data.caption,
				isPrivate: body.data.isPrivate
			})
			.returning()
	)[0];

	const formattedVals = await Promise.all(
		body.data.images.map((el, idx) => {
			return (async () => {
				const imgData = await getPixels(el.url);
				return {
					idx,
					postId: post.id,
					url: el.url,
					caption: el.caption,
					blurhash: encode(
						Uint8ClampedArray.from(imgData.data),
						imgData.width,
						imgData.height,
						4,
						4
					),
					width: imgData.width,
					height: imgData.height
				};
			})();
		})
	);

	const imagesResp = await db.insert(images).values(formattedVals).execute();

	return json(post);
};

export type FullPosts =
	Awaited<ReturnType<typeof full_posts_query.execute>> extends infer U ? U : never;
