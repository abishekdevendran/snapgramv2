import { PUBLIC_DEFAULT_BUCKET_NAME, PUBLIC_R2_URL } from '$env/static/public';
import { db } from '$lib/server/db/index.js';
import { uploads } from '$lib/server/db/schema.js';
import { s3Client } from '$lib/server/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

// zod enum type for uploadType 'profile-picture' or 'post-image'
const uploadTypeSchema = z.enum(['profile-picture', 'post-image']);
const countSchema = z.string().optional()
	.refine((val) => {
		if (val === undefined) return true;
		const parsed = parseInt(val, 10);
		return !isNaN(parsed) && parsed > 0;
	}, {
		message: 'Count must be a positive integer',
	})

function getFinalURL(fileName: string, uploadType: z.infer<typeof uploadTypeSchema>): string {
	return PUBLIC_R2_URL + `/${uploadType}/` + fileName;
}

export const GET = async ({ fetch, locals, url }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	// get uploadType from searchParams
	const uploadType = uploadTypeSchema.safeParse(url.searchParams.get('uploadType'));
	const count = countSchema.safeParse(url.searchParams.get('count'));
	if (!uploadType.success || !count.success) {
		return json({ message: 'Invalid uploadType or countType' }, { status: 400 });
	}
	if (uploadType.data === 'profile-picture' && count.data !== undefined) {
		return json({ message: 'Count should not be provided for profile-picture' }, { status: 400 });
	}
	const numberCount = parseInt(count.data ?? '1', 10) ?? 1;
	const fileNames = Array.from({ length: numberCount ?? 1 }, (_, i) => `${crypto.randomUUID()}.webp`);
	// const command = new PutObjectCommand({
	// 	Bucket: PUBLIC_DEFAULT_BUCKET_NAME,
	// 	Key: `${uploadType.data}/${fileName}`,
	// 	ContentType: 'image/webp'
	// });
	const commands = fileNames.map((fileName) => new PutObjectCommand({
		Bucket: PUBLIC_DEFAULT_BUCKET_NAME,
		Key: `${uploadType.data}/${fileName}`,
		ContentType: 'image/webp'
	}));

	// const presignedUrl = await getSignedUrl(s3Client, command, {
	// 	expiresIn: 600 // 10 minutes
	// });

	const presignedUrls = await Promise.all(commands.map((command) => getSignedUrl(s3Client, command, {
		expiresIn: 600 // 10 minutes
	})));

	// add an entry in uploads table
	// await db.insert(uploads).values({
	// 	userId: locals.user.id,
	// 	status: 'INITIATED',
	// 	url: getFinalURL(fileName, uploadType.data),
	// });

	const uploadPromises = db.insert(uploads).values(fileNames.map((fileName) => ({
		userId: locals.user!.id,
		status: 'INITIATED',
		url: getFinalURL(fileName, uploadType.data),
	})) as {
		userId: number;
		status: 'INITIATED';
		url: string;
	}[]);

	if (numberCount === 1) {

		return json({
			url: presignedUrls[0],
			fileName: fileNames[0]
		});
	} else {
		return json({
			urls: presignedUrls.map((url, index) => ({
				url,
				fileName: fileNames[index]
			}))
		});
	}
};

export type ImageUploadType = {
	url: string;
	fileName: string;
};
