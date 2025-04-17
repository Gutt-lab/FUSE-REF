import express from 'express';
import { DataIngestionController } from '../controllers/dataIngestionController.js';

export class DataIngestionRoutes {
    constructor(mongo_db) {
        this.router = express.Router();
        this.mongo_db = mongo_db;
        this.dataIngestionController = new DataIngestionController(mongo_db);
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/create/document', this.dataIngestionController.createDocument.bind(this.dataIngestionController));
        this.router.post('/upload/file', this.dataIngestionController.uploadMemory.any(), this.dataIngestionController.uploadFile.bind(this.dataIngestionController));
        this.router.post('/auth/user/token', this.dataIngestionController.authorizeUser.bind(this.dataIngestionController));
        this.router.get('/get/file/content/:dataset_id/:file_name', this.dataIngestionController.getFileContent.bind(this.dataIngestionController));
    }

    getRouter() {
        return this.router;
    }
}

// Factory function to create router instance
export const createDataIngestionRoutes = (mongo_db) => {
    const dataIngestionRoutes = new DataIngestionRoutes(mongo_db);
    return dataIngestionRoutes.getRouter();
}; 