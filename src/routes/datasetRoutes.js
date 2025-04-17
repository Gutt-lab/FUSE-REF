import express from 'express';
import { DatasetController } from "../controllers/datasetController.js";

export class DatasetRoutes {
    constructor(mongo_db) {
        this.router = express.Router();
        this.mongo_db = mongo_db;
        this.datasetController = new DatasetController(mongo_db);
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/', this.datasetController.listDatasets.bind(this.datasetController));
        this.router.get('/get/:id', this.datasetController.getDataset.bind(this.datasetController));
        //this.router.get('/get/files/:id', this.datasetController.getFiles.bind(this.datasetController));
        this.router.get('/schemas/get/uischema', this.datasetController.getSchema.bind(this.datasetController));
        this.router.post('/session/start', this.datasetController.startSession.bind(this.datasetController));
    }

    getRouter() {
        return this.router;
    }
}

// Factory function to create router instance
export const createDatasetRoutes = (mongo_db) => {
    const datasetRoutes = new DatasetRoutes(mongo_db);
    return datasetRoutes.getRouter();
}; 