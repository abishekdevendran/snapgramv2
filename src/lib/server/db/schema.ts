import { relations } from 'drizzle-orm';
import {
	pgTable,
	serial,
	text,
	integer,
	timestamp,
	boolean,
	primaryKey,
	index,
	uniqueIndex,
	pgEnum
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Session table
export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		expiresAt: timestamp('expires_at', {
			withTimezone: true,
			mode: 'date'
		}).notNull()
	},
	(table) => [index('sessions_user_id_idx').on(table.userId)]
);

// User table
export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		githubId: integer('github_id'),
		googleId: text('google_id'),
		name: text('name').default('John Doe'),
		username: text('username').notNull(),
		email: text('email').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
		profilePictureUrl: text('profile_picture_url'),
		bio: text('bio')
	},
	(table) => {
		return [
			index('users_username_idx').on(table.username),
			uniqueIndex('users_email_idx').on(table.email),
			index('users_github_id_idx').on(table.githubId),
			index('users_google_id_idx').on(table.googleId)
		];
	}
);

// Post table
export const posts = pgTable(
	'posts',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		caption: text('caption'),
		isPrivate: boolean('is_private').default(false),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
	},
	(table) => {
		return [
			index('posts_user_id_idx').on(table.userId),
			index('posts_created_at_idx').on(table.createdAt)
		];
	}
);

// Image table
export const images = pgTable(
	'images',
	{
		id: serial('id').primaryKey(),
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id),
		url: text('url').notNull(), // URL of the image in Cloudflare R2 or other storage
		width: integer('width'), // Width of the image
		height: integer('height'), // Height of the image
		idx: integer('idx').notNull(), // Index of the image in the post
		blurhash: text('blurhash'), // Blurhash of the image
		caption: text('caption'), // Optional caption for the image
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
	},
	(table) => {
		return [index('images_post_id_idx').on(table.postId), index('images_idx_idx').on(table.idx)];
	}
);

// Like table
export const likes = pgTable(
	'likes',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
	},
	(table) => {
		return [
			index('likes_user_id_idx').on(table.userId),
			index('likes_post_id_idx').on(table.postId),
			uniqueIndex('likes_user_post_id_idx').on(table.userId, table.postId)
		];
	}
);

// Comment table
export const comments = pgTable(
	'comments',
	{
		id: serial('id').primaryKey(),
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		content: text('content').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
	},
	(table) => {
		return [
			index('comments_post_id_idx').on(table.postId),
			index('comments_user_id_idx').on(table.userId),
			index('comments_post_user_id_idx').on(table.postId, table.userId)
		];
	}
);

// Follower table
export const followers = pgTable(
	'followers',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		followingUserId: integer('following_user_id')
			.notNull()
			.references(() => users.id),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
	},
	(table) => {
		return [
			primaryKey({ columns: [table.userId, table.followingUserId] }),
			index('followers_user_id_idx').on(table.userId),
			index('followers_following_user_id_idx').on(table.followingUserId)
		];
	}
);

// Notification table
export const notifications = pgTable(
	'notifications',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		type: text('type').notNull(),
		read: boolean('read').default(false),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
	},
	(table) => [
		index('notifications_user_id_idx').on(table.userId),
		index('notifications_type_idx').on(table.type),
		index('notifications_user_type_idx').on(table.userId, table.type)
	]
);

// Uploads table
export const uploadStatus = pgEnum('UploadStatus', ['INITIATED', 'COMPLETED', 'FAILED']);
export const uploads = pgTable(
	'uploads',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id),
		url: text('url').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
		status: uploadStatus('status').notNull()
	},
	(table) => [index('uploads_user_id_idx').on(table.userId)]
);

// Relations
export const sessionRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const userRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	posts: many(posts),
	likes: many(likes),
	comments: many(comments),
	followers: many(followers, {
		relationName: 'follower'
	}),
	notifications: many(notifications),
	following: many(followers, {
		relationName: 'followingUser'
	}),
	uploads: many(uploads)
}));

export const postRelations = relations(posts, ({ many, one }) => ({
	user: one(users, {
		fields: [posts.userId],
		references: [users.id]
	}),
	images: many(images),
	likes: many(likes),
	comments: many(comments)
}));

export const imageRelations = relations(images, ({ one }) => ({
	post: one(posts, {
		fields: [images.postId],
		references: [posts.id]
	})
}));

export const likeRelations = relations(likes, ({ one }) => ({
	user: one(users, {
		fields: [likes.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [likes.postId],
		references: [posts.id]
	})
}));

export const commentRelations = relations(comments, ({ one }) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	})
}));

export const followerRelations = relations(followers, ({ one }) => ({
	user: one(users, {
		fields: [followers.userId],
		references: [users.id],
		relationName: 'follower'
	}),
	followingUser: one(users, {
		fields: [followers.followingUserId],
		references: [users.id],
		relationName: 'followingUser'
	})
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	})
}));

export const uploadRelations = relations(uploads, ({ one }) => ({
	user: one(users, {
		fields: [uploads.userId],
		references: [users.id]
	})
}));

// Validation schemas
export const userUpdateSchema = z.object({
	name: z.string().optional(),
	username: z.string().optional(),
	profilePictureUrl: z.string().optional(),
	bio: z.string().optional()
});

// Types for each table
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Image = typeof images.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Follower = typeof followers.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
