import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis Client
export const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Test Function
export const connectRedis = async () => {
    try {
        await redisClient.set('system-check', 'Redis is Active 🚀');
        const data = await redisClient.get('system-check');
        console.log(`⚡ ${data}`);
    } catch (error) {
        console.error(`❌ Redis Connection Failed: ${error.message}`);
    }
};