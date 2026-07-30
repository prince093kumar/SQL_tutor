import { createClient } from 'redis';
import { logger } from '../logger/index.js';

class RedisPubSub {
    constructor() {
        this.publisher = null;
        this.subscriber = null;
    }

    async init() {
        const url = process.env.REDIS_URL || 'redis://localhost:6379';
        
        this.publisher = createClient({ url });
        this.subscriber = createClient({ url });

        this.publisher.on('error', (err) => logger.error('Redis Publisher Error', err));
        this.subscriber.on('error', (err) => logger.error('Redis Subscriber Error', err));

        await this.publisher.connect();
        await this.subscriber.connect();
        logger.info('Redis Pub/Sub clients connected successfully.');
    }

    async publish(channel, message) {
        if (!this.publisher) await this.init();
        const payload = typeof message === 'string' ? message : JSON.stringify(message);
        await this.publisher.publish(channel, payload);
        logger.info(`Published event to channel: ${channel}`);
    }

    async subscribe(channel, callback) {
        if (!this.subscriber) await this.init();
        await this.subscriber.subscribe(channel, (message) => {
            try {
                const parsed = JSON.parse(message);
                callback(parsed);
            } catch (err) {
                callback(message); // fallback to string
            }
        });
        logger.info(`Subscribed to channel: ${channel}`);
    }
}

export const pubsub = new RedisPubSub();
