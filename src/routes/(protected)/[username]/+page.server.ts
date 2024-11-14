import { db } from '$lib/server/db/index.js';
import { redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

const full_user_query = db.query.users
	.findFirst({
		where: (user, { eq }) => eq(user.id, sql.placeholder('user_id')),
		with: {
			notifications: {
				with: {
					user: {
						columns: {
							id: true,
							username: true,
							profilePictureUrl: true
						}
					}
				}
			},
			posts: {
				with: {
					comments: {
						with: {
							user: {
								columns: {
									id: true,
									username: true,
									profilePictureUrl: true
								}
							}
						}
					},
					likes: {
						with: {
							user: {
								columns: {
									id: true,
									username: true,
									profilePictureUrl: true
								}
							}
						}
					},
					images: true
				}
			},
			followers: {
				with: {
					followingUser: {
						columns: {
							id: true,
							username: true,
							profilePictureUrl: true
						}
					}
				}
			},
			following: {
				with: {
					user: {
						columns: {
							id: true,
							username: true,
							profilePictureUrl: true
						}
					}
				}
			}
		}
	})
	.prepare('get_full_user');

export const load = async (event) => {
	if (!event.locals.user) {
		return {
			status: 401,
			body: { message: 'Unauthorized' }
		};
	}
	if (event.locals.user.username === event.params.username) {
		const user = await full_user_query.execute({
			user_id: event.locals.user.id
		});
		return { user };
	} else {
		return redirect(301, '/dashboard?error=Unauthorized');
	}
};

export type FullUser = Awaited<ReturnType<typeof full_user_query.execute>> extends (infer U) ? U : never;
