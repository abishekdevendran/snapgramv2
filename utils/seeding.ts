import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/lib/server/db/schema';
import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { encodeBase64url } from '@oslojs/encoding';
import { encode } from 'blurhash';
import { getPixels } from '@unpic/pixels';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client, {
	schema: schema,
	logger: true
});

if (!process.env.TESTING_USER_ID) throw new Error('TESTING_USER_ID is not set');
const USER_ID = Number(process.env.TESTING_USER_ID);
if (isNaN(USER_ID)) throw new Error('TESTING_USER_ID is not a number');

// Function to generate random post
const generatePost = (userId: number) => ({
	userId,
	caption: faker.lorem.paragraph()
});

// Function to generate random image
const generateImage = async (postId: number, idx: number) => {
	const imgUrl = faker.image.url();
	const imgData = await getPixels(imgUrl);
	const data = Uint8ClampedArray.from(imgData.data);
	const blurhash = encode(data, imgData.width, imgData.height, 4, 4);
	return {
		postId,
		url: imgUrl,
		width: faker.number.int({ min: 100, max: 1000 }),
		height: faker.number.int({ min: 100, max: 1000 }),
		idx,
		caption: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }),
		blurhash
	};
};

// Function to generate random like
const generateLike = (postId: number, userId: number) => ({
	userId,
	postId
});

// Function to generate random comment
const generateComment = (postId: number, userId: number) => ({
	userId,
	postId,
	content: faker.lorem.paragraph()
});

// Function to generate random notification
const generateNotification = (userId: number) => ({
	userId,
	type: faker.helpers.arrayElement(['like', 'comment', 'follow'])
});

// Function to generate random user
const generateUser = async (userId?: number) => {
	// Generate 2 posts
	if (!userId) {
		// insert user
		const u=await db
			.insert(schema.users)
			.values({
				username: faker.internet.username(),
				name: faker.person.fullName(),
				email: faker.internet.email(),
				bio: faker.lorem.paragraph()
			})
			.returning();
		userId = u[0].id;
	}
	const posts = Array(2)
		.fill(null)
		.map(() => generatePost(userId));
	await db.insert(schema.posts).values(posts).execute();
	const generatedPosts = await db.query.posts.findMany({
		where: (post, { eq }) => eq(post.userId, userId)
	});
	const postIds = generatedPosts.map((post) => post.id);
	const imagesPromises = postIds.flatMap((postId) =>
		Array(2)
			.fill(null)
			.map((el, idx) => generateImage(postId, idx))
	);
	const images = await Promise.all(imagesPromises);
	await db.insert(schema.images).values(images).execute();
};

// generate random followers
const shuffleFollowers = async () => {
	// For every user, follow 3 random users
	const users = await db.query.users.findMany();
	const generatedPosts = await db.query.posts.findMany();
	const promises = users.map(async (user) => {
		// users cant follow themselves
		const userId = user.id;
		const randomUsers = faker.helpers.shuffle(users.filter((u) => u.id !== user.id)).slice(0, 3);
		const followers = randomUsers.map((randomUser) => ({
			userId: user.id,
			followingUserId: randomUser.id
		}));
		await db.insert(schema.followers).values(followers).execute();
		// select random posts(not their own) to leave likes on
		const randomPosts = faker.helpers
			.shuffle(generatedPosts.filter((el) => el.userId !== userId))
			.slice(0, 3);
		const likes = randomPosts.map((post) => generateLike(post.id, userId));
		await db.insert(schema.likes).values(likes).execute();
		// select random posts(not their own) to leave comments on
		const randomPosts2 = faker.helpers
			.shuffle(generatedPosts.filter((el) => el.userId !== userId))
			.slice(0, 3);
		const comments = randomPosts2.map((post) => generateComment(post.id, userId));
		await db.insert(schema.comments).values(comments).execute();
	});
	await Promise.all(promises);
};

const seedDatabase = async () => {
	try {
		console.log('Seeding database...');
		await generateUser(USER_ID);
		// Generate 5 random users
		console.log('Generating random users...');
		await Promise.all(
			Array(5)
				.fill(null)
				.map(() => generateUser())
		);
		// Generate random follows
		console.log('Generating random followers...');
		await shuffleFollowers();
		console.log('Database seeded!');
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error seeding database: ', error.message);
		} else {
			console.error('Error seeding database: ', error);
		}
	}
};

seedDatabase();
