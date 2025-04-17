import { MetricsService } from '../services/metricsService.js';
export class MetricsController {
    constructor(mongo_db) {
        this.mongo_db = mongo_db;
        this.metricsService = new MetricsService(mongo_db);
    }

    async listMetrics(req, res) {
        try {
            const { year } = req.params;
            const { session_id } = req.headers;
            console.log(year);
            if (!session_id) {
                return res.status(401).json({ error: 'Session ID is required' });
            }
            const metrics = await this.metricsService.getMetrics(year);
            res.status(200).json({ metrics: metrics });
        } catch (error) {
            console.error('Error getting metrics:', error);
            res.status(500).json({ error: 'Failed to get metrics' });
        }
    }
}

