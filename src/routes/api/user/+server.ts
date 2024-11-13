import { db } from '$lib/server/db/index.js';
import { json } from '@sveltejs/kit';

export const GET = async (event) => {
	if (!event.locals.user) {
		return new Response(null, {
			status: 401
		});
	}
	// return all user data
	const user = await db.query.users.findFirst({
		where: (user, { eq }) => eq(user.id, event.locals.user!.id),
		with: {
			notifications: true,
			posts: {
				with: {
					comments: {
						with: {
							user: true
						}
					},
					likes: {
						with: {
							user: true
						}
					},
					images: true
				}
			},
			followers: {
				with: {
					user: true
				}
			},
			following: {
				with: {
					followingUser: true
				}
			}
		}
	});

	console.log('USER: ', user);

	return json(user);
};
