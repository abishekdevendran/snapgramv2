import { db } from '$lib/server/db/index.js';

export const load = async (event) => {
	if (!event.locals.user) {
		return {
			status: 401,
			body: { message: 'Unauthorized' }
		};
	}
	if (event.locals.user.username === event.params.username) {
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
		return { user };
	}
};
