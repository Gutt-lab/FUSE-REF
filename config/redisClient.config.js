import { createClient } from 'redis';      

// Create a Redis client
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle connection errors
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis
await redisClient.connect();

// Export the Redis client for use in other parts of the application
export default redisClient; 