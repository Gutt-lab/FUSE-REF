import { DatasetService } from "../services/datasetService.js";
import { SharedServices } from "../services/sharedServices.js";

import jwt from 'jsonwebtoken';
export class DatasetController {
    constructor(mongo_db) {
        this.mongo_db = mongo_db;
        this.datasetService = new DatasetService(mongo_db);
    }

    async listDatasets(req, res) {
        const { session_id } = req.headers;
        if (!session_id) {
            return res.status(401).json({ error: 'Session ID is required' });
        }

        try {
            jwt.verify(session_id, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid session ID' });
        }
        const datasets = await this.datasetService.listDatasets();
        // Logic to retrieve and return a list of datasets
        res.json({ datasets: datasets });
        //res.render('datasets', { datasets: datasets });
    }

    async getDataset(req, res) {
        const { id } = req.params;
        const dataset = await this.datasetService.getDataset(id);  
        res.json({ dataset: dataset });
    }
    async startSession(req, res) {
        try {
            const session_id = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '2h' });
            res.status(200).json({ session_id });
        } catch (error) {
            console.error('Failed to start session:', error);
            res.status(500).json({ error: 'Failed to start session' }); 
        }
    }

    async getSchema(req, res) {
        const { session_id } = req.headers;
        if (!session_id) {
            return res.status(401).json({ error: 'Session ID is required' });
        }
        try {
            jwt.verify(session_id, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid session ID' });
        }
        const schema = await SharedServices.getSchema();
        res.status(200).json({ schema: schema });
    }
    
}; 