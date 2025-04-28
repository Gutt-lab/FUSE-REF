import StorageSciebo from '../infrastructure/storage-sciebo.js';
import redisClient from '../../config/redisClient.config.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';



export class DataIngestionService {
    constructor(mongo_db) {
        this.mongo_db = mongo_db;
        this.storageSciebo = new StorageSciebo();
    }

    async createDocument(data, alias) {
        try {
            data.files = [];
            const today = new Date();
            data.created_on = today.toLocaleDateString('de-DE');
            data.alias = alias;
            const result = await this.mongo_db.collection('datasets').insertOne(data);
            return result.insertedId;
        } catch (error) {
            console.error('Data ingestion error:', error);
            throw new Error('Failed to ingest data');
        }
    }

    async findContributorByToken(token) {
        try 
        {
            const cachedContributor = await redisClient.get(token);
            if (cachedContributor) 
            {
                return JSON.parse(cachedContributor);
            }

            const contributorsCollection = this.mongo_db.collection('contributors');
            const contributor = await contributorsCollection.findOne({ "uuid":token });

            if (contributor) 
            {
                await redisClient.set(token, JSON.stringify(contributor), { EX: 1800 }); // Cache for 30 minutes
            }
            return contributor;
        } catch (error)     
        {
            console.error('Error finding contributor:', error);
            throw new Error('Failed to find contributor');
        }
    }

    async getSchema() {
        try
        {
            //const cacheSchema = await redisClient.get('schema');
            //if (cacheSchema)
            //{
            //    return JSON.parse(cacheSchema);
            //}
            const schemaPath = './schemas/dataIngestionSchema.json';
            const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
            //await redisClient.set('schema', JSON.stringify(schema), { EX: 1800 }); // Cache for 30 minutes
            return schema;
        } catch (error)
        {
            console.error('Error getting schema:', error);
            throw new Error('Failed to get schema');
        }
    }

    async uploadFile(file) {
        try {
            const result = await this.storageSciebo.uploadFile(file);
            return result;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file');
        }
    }

    async updateDocumentAfterUploadingFile(document_id, itemName, fileDetails) {
        try {
            const updateQuery = { $push: { [String(itemName)]: fileDetails } };
            const result = await this.mongo_db.collection('datasets').updateOne({ _id: new ObjectId(document_id) }, updateQuery);
            return result;
        } catch (error) {
            console.error('Error updating document:', error);
            throw new Error('Failed to update document');
        }
    }

    async getFileContent(dataset_id, file_name) {
        try {
            const result = await this.storageSciebo.getFileContent(dataset_id, file_name);
            return result;
        } catch (error) {
            console.error('Error getting file content:', error);
            throw new Error('Failed to get file content');
        }
    }
} 