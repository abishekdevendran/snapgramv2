import { CLOUDFLARE_ACC_ID, R2_ACCESS_ID, R2_ACCESS_KEY } from '$env/static/private';
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
	region: 'auto',
	endpoint: `https://${CLOUDFLARE_ACC_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_ID,
		secretAccessKey: R2_ACCESS_KEY
	}
});
