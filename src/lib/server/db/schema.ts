import { relations } from 'drizzle-orm';
import {
	pgTable,
	serial,
	text,
	integer,
	timestamp,
	boolean,
	primaryKey
} from 'drizzle-orm/pg-core';

// User table
export const users = pgTable('users', {
	id: text('id').primaryKey(),
	githubId: integer('github_id'),
	googleId: text('google_id'),
	name: text('name').default('John Doe'), // Default name for new users
	username: text('username').notNull(),
	email: text('email').notNull().unique(), // Unique email for each user
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(), // Account creation date
	profilePictureUrl: text('profile_picture_url'), // Optional profile picture
	bio: text('bio') // Optional user bio
});

// Post table - to store individual posts made by users
export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	caption: text('caption'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

// Image table - to store images associated with posts
export const images = pgTable('images', {
	id: serial('id').primaryKey(),
	postId: integer('post_id')
		.notNull()
		.references(() => posts.id),
	url: text('url').notNull(), // URL of the image in Cloudflare R2 or other storage
	width: integer('width'), // Width of the image
	height: integer('height'), // Height of the image
	isThumbnail: boolean('is_thumbnail').default(false), // Flag for thumbnail images
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

// Like table - to store likes on posts
export const likes = pgTable('likes', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	postId: integer('post_id')
		.notNull()
		.references(() => posts.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

// Comment table - to store comments on posts
export const comments = pgTable('comments', {
	id: serial('id').primaryKey(),
	postId: integer('post_id')
		.notNull()
		.references(() => posts.id),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	content: text('content').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

// Follower table - to store follower relationships between users
export const followers = pgTable(
	'followers',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		followingUserId: text('following_user_id')
			.notNull()
			.references(() => users.id),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
	},
	(t) => ({
		pk: primaryKey({
			columns: [t.userId, t.followingUserId]
		})
	})
);

// Notification table - to store notifications for users
export const notifications = pgTable('notifications', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	type: text('type').notNull(), // Type of notification, e.g., "like", "comment", "follow"
	read: boolean('read').default(false), // Flag to check if the notification is read
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow()
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
	posts: many(posts),
	likes: many(likes),
	comments: many(comments),
	followers: many(followers, {
		relationName: 'follower'
	}),
	notifications: many(notifications),
	following: many(followers, {
		relationName: 'followingUser'
	})
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

// Types for each table
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Image = typeof images.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Follower = typeof followers.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
