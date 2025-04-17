import { ObjectId } from 'mongodb';
import { SharedServices } from './sharedServices.js';

export class DatasetService {   
    constructor(mongo_db) {
        this.mongo_db = mongo_db;
        console.log('DatasetService constructor');
    }

    async listDatasets() {
        const datasets = await this.mongo_db.collection('datasets').find({}).toArray();
        return datasets;
    }

    async getDataset(id) {
        try {
            const dataset = await this.mongo_db.collection('datasets').findOne({ _id: new ObjectId(id) });
            return dataset;
        } catch (error) {
            console.error('Error getting dataset:', error);
            throw error;
        }
    }

    async getSchema() {
        const schema = await SharedServices.getSchema();
        return schema;
    }
}
