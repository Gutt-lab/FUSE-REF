import express, { json } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { header, validationResult } from 'express-validator';
import { MongoConfig } from './config/mongo.config.js';

import { createDatasetRoutes } from './src/routes/datasetRoutes.js';
import { createDataIngestionRoutes } from './src/routes/dataIngestionRoutes.js';
import { createMetricsRoutes } from './src/routes/metricsRoutes.js';

dotenv.config();

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    try {
        const _mongo_db = await MongoConfig.connect();
        const app = express();
        console.log(path.join(__dirname, 'public'));
        app.use(json());
        app.use(cors());

        // Serve static files from the 'public' directory
        app.use(express.static(path.join(__dirname, 'public')));

        app.use('/datasets', createDatasetRoutes(_mongo_db));
        app.use('/dataingestion', createDataIngestionRoutes(_mongo_db));
        app.use('/metrics', createMetricsRoutes(_mongo_db));
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

        process.on('SIGINT', async () => {
            await MongoConfig.disconnect();
            process.exit(0);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
}       

startServer().catch(console.error);
