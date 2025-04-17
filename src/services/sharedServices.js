import fs from 'fs';

export class SharedServices {
    
    static async getSchema() {
        try {
            const schemaPath = './schemas/dataIngestionSchema.json';
            const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
            return schema;
        } catch (error) {
            console.error('Error getting schema:', error);
            throw new Error('Failed to get schema');
        }
    }
}


