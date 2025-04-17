import express from 'express';
import { MetricsController } from '../controllers/metricsController.js';

export class MetricsRoutes {
    constructor(mongo_db) {
        this.router = express.Router();
        this.mongo_db = mongo_db;
        this.metricsController = new MetricsController(mongo_db);
        this.initializeRoutes();
    }
    
    initializeRoutes() {
        this.router.get('/get/all/:year', this.metricsController.listMetrics.bind(this.metricsController));
    }

    getRouter() {
        return this.router;
    }
}

export const createMetricsRoutes = (mongo_db) => {
    const metricsRoutes = new MetricsRoutes(mongo_db);
    return metricsRoutes.getRouter();
}