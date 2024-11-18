import { PUBLIC_DEFAULT_BUCKET_NAME, PUBLIC_R2_URL } from '$env/static/public';
import { db } from '$lib/server/db/index.js';
import { uploads } from '$lib/server/db/schema.js';
import { s3Client } from '$lib/server/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

function getPfPFinalURL(fileName: string): string {
	return PUBLIC_R2_URL + '/profile-picture/' + fileName;
}

// zod enum type for uploadType 'profile-picture' or 'post-image'
const uploadTypeSchema = z.enum(['profile-picture', 'post-image']);

export const GET = async ({ fetch, locals, url }) => {
	if (!locals.user) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	const fileName = `${crypto.randomUUID()}.webp`;
	// get uploadType from searchParams
	const uploadType = uploadTypeSchema.safeParse(url.searchParams.get('uploadType'));
	if (!uploadType.success) {
		return json({ message: 'Invalid uploadType' }, { status: 400 });
	}
	const command = new PutObjectCommand({
		Bucket: PUBLIC_DEFAULT_BUCKET_NAME,
		Key: `${uploadType.data}/${fileName}`,
		ContentType: 'image/webp'
	});

	const presignedUrl = await getSignedUrl(s3Client, command, {
		expiresIn: 600 // 10 minutes
	});

	// add an entry in uploads table
	await db.insert(uploads).values({
		userId: locals.user.id,
		status: 'INITIATED',
		url: getPfPFinalURL(fileName),
	});

	return json({
		url: presignedUrl,
		fileName
	});
};

export type ImageUploadType = {
	url: string;
	fileName: string;
};
