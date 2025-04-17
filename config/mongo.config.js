import { MongoClient } from 'mongodb';

export class MongoConfig {
    static client = null;
    static db = null;

    static async connect() {
        try {
            this.client = await MongoClient.connect(process.env.MONGO_DB_URL);
            this.db = this.client.db(process.env.MONGO_DB_NAME);
            console.log('MongoDB connected successfully');
            return this.db;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }

    }

    static async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('MongoDB disconnected');
            this.client = null;
            this.db = null;
        }
    }
} 