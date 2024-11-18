import { db } from '$lib/server/db';
import { comments, followers, likes, posts, type Image } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';

const full_post_query = db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.id, sql.placeholder('post_id')),
    orderBy: (posts, { desc }) => desc(posts.createdAt),
    with: {
        images: true,
        comments: {
            orderBy: (comments, { desc }) => desc(comments.createdAt),
            limit: 20,
            with: {
                user: true
            }
        },
        likes: {
            orderBy: (likes, { desc }) => desc(likes.createdAt),
            limit: 20,
            with: {
                user: true
            }
        },
        // user:{
        //     with:{
        //         followers:{
        //             extras:{
        //                 isFollowing: db.$count(followers, sql`followers.user_id = users.id AND followers.follower_id = ${sql.placeholder('pc_user_id')}`).as('isFollowing')
        //             }
        //         }
        //     }
        // }
    },
    extras: {
        // TODO: Fix this once Drizzle fixes the issue with $count
        likeCount: db.$count(likes, sql`likes.post_id = posts.id`).as('likesCount'),
        commentCount: db.$count(comments, sql`comments.post_id = posts.id`).as('commentCount'),
        isFollowing: db.$count(followers, sql`followers.user_id = posts.user_id AND followers.following_user_id = ${sql.placeholder('pc_user_id')}`).as('isFollowing')
        // ifFollowing: db.$count(followers, and(eq(followers.userId, sql`posts.userId`), eq(followers.follower_id, sql`pc_user_id`))).as('isFollowing')
    }
}).prepare('get_full_posts');

export const GET = async (event) => {
    if (!event.locals.user) {
        return new Response(null, {
            status: 401
        });
    }
    // optional page param
    const page = event.url.searchParams.get('page');
    const post = await full_post_query.execute({
        pc_user_id: event.locals.user.id,
        post_id: event.params.id,
        page: page ? parseInt(page) : 0
    });
    console.log(post);
    // Check if post is accessible by user (if it's their own post, OR if it's a public post OR if it's a post by a following user)
    if (!post || (post.isPrivate && post.userId !== event.locals.user.id && !post.isFollowing)) {
        return new Response(null, {
            status: 401
        });
    }
    return json(post);
};

export type FullPost = Awaited<ReturnType<typeof full_post_query.execute>> extends infer U ? U : never;