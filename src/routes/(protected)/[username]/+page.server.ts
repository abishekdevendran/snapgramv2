import { db } from '$lib/server/db/index.js';
import { users, userUpdateSchema } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
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

export type FullUser =
	Awaited<ReturnType<typeof full_user_query.execute>> extends infer U ? U : never;

export const actions = {
	patchUser: async (event) => {
		if (!event.locals.user) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}
		const formData = await event.request.formData();
		// convert formdata to object
		const object: {
			[key: string]: string;
		} = {};
		for (const [key, value] of formData.entries()) {
			object[key] = value as string;
		}
		console.log(object);
		// validate partial user data on formdata
		const resp = userUpdateSchema.safeParse(object);
		if (!resp.success) {
			// return new Response(JSON.stringify(resp.error), {
			// 	status: 400
			// });
			return fail(400, {
				error: resp.error.flatten()
			});
		}
		if (resp.data.username && event.locals.user.username !== resp.data.username) {
			const user = await db.query.users.findFirst({
				where: (user, { eq }) => eq(user.username, resp.data.username!)
			});
			if (user) {
				// return new Response(JSON.stringify({ message: 'Username already exists' }), {
				// 	status: 400
				// });
				return fail(400, {
					error: 'Username already exists'
				});
			}
		}
		if (
			resp.data.profilePictureUrl &&
			event.locals.user.profilePictureUrl !== resp.data.profilePictureUrl
		) {
			const user = await db.query.users.findFirst({
				where: (user, { eq }) => eq(user.profilePictureUrl, resp.data.profilePictureUrl!)
			});
			if (user) {
				// return new Response(JSON.stringify({ message: 'Identity theft is not a joke, Jim!' }), {
				// 	status: 400
				// });
				return fail(400, {
					error: 'Identity theft is not a joke, Jim!'
				});
			}
		}
		// update user data
		const user = await db
			.update(users)
			.set(resp.data)
			.where(eq(users.id, event.locals.user!.id))
			.returning();
		return {
			success: true,
			user
		};
	}
};
