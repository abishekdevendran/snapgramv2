import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

// User table
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	githubId: integer('github_id').notNull(),
	googleId: text('google_id'),
	username: text('username').notNull(),
	email: text('email').notNull().unique(), // Unique email for each user
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(), // Account creation date
	profilePictureUrl: text('profile_picture_url'), // Optional profile picture
	bio: text('bio'), // Optional user bio
});

// Post table - to store individual posts made by users
export const post = pgTable('post', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	caption: text('caption'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// Image table - to store images associated with posts
export const image = pgTable('image', {
	id: serial('id').primaryKey(),
	postId: integer('post_id')
		.notNull()
		.references(() => post.id),
	url: text('url').notNull(), // URL of the image in Cloudflare R2 or other storage
	width: integer('width'), // Width of the image
	height: integer('height'), // Height of the image
	isThumbnail: boolean('is_thumbnail').default(false), // Flag for thumbnail images
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// Like table - to store likes on posts
export const like = pgTable('like', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	postId: integer('post_id')
		.notNull()
		.references(() => post.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// Comment table - to store comments on posts
export const comment = pgTable('comment', {
	id: serial('id').primaryKey(),
	postId: integer('post_id')
		.notNull()
		.references(() => post.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	content: text('content').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// Follower table - to store follower relationships between users
export const follower = pgTable('follower', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	followingUserId: text('following_user_id')
		.notNull()
		.references(() => user.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// Notification table - to store notifications for users
export const notification = pgTable('notification', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	type: text('type').notNull(), // Type of notification, e.g., "like", "comment", "follow"
	read: boolean('read').default(false), // Flag to check if the notification is read
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// Types for each table
export type User = typeof user.$inferSelect;
export type Post = typeof post.$inferSelect;
export type Image = typeof image.$inferSelect;
export type Like = typeof like.$inferSelect;
export type Comment = typeof comment.$inferSelect;
export type Follower = typeof follower.$inferSelect;
export type Notification = typeof notification.$inferSelect;
