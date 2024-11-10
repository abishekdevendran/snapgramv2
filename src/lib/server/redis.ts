import { Redis } from '@upstash/redis/cloudflare';
import { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } from '$env/static/private';

const redisClient = new Redis({
	url: UPSTASH_REDIS_REST_URL,
	token: UPSTASH_REDIS_REST_TOKEN,
	automaticDeserialization: false,
	retry: {
		retries: 5
	}
});

export default redisClient;
