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
	});

	return json(user);
};
