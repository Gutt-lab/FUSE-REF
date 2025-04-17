

export class MetricsService {
    constructor(mongo_db) {
        this.mongo_db = mongo_db;
    }

    async getMetrics(year) {
        try {
            const metrics = await this.mongo_db.collection('metrics').findOne({ year: parseInt(year) });
            return metrics;
        } catch (error) {
            console.error('Error getting metrics:', error);
            throw new Error('Failed to get metrics');
        }
    }
}
