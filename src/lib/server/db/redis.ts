import { Redis } from '@upstash/redis';
import { REDIS_TOKEN, REDIS_URL } from '$env/static/private';

const redisClient = new Redis({
	url: REDIS_URL,
	token: REDIS_TOKEN,
	agent: 'SnapGram',
	automaticDeserialization: false,
	retry: {
		retries: 5
	}
});

export default redisClient;
