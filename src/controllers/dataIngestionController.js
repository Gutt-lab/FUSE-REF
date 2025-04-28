import jwt from 'jsonwebtoken';
import { DataIngestionService } from '../services/dataIngestionService.js';
import multer from 'multer';

export class DataIngestionController {
    constructor(mongo_db) {
        this.dataIngestionService = new DataIngestionService(mongo_db);
    }
    //upload = multer({ storage: multer.memoryStorage() });

    localStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });
    memoryStorage = multer.memoryStorage({

        destination: (req, file, cb) => {
            if (file.fieldname === 'data_file' || file.fieldname === 'image_file') {
                cb(null, 'uploads/');
            } else {
                cb(null, '');
            }
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });

    upload = multer({ storage: this.localStorage });   
    uploadMemory = multer({ storage: this.memoryStorage, fileFilter: (req, file, cb) => {
        if (file.fieldname === 'data_file' || file.fieldname === 'image_file') {
            cb(null, file.fieldname+'_'+file.originalname);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }});

    async authenticateUser(req, res) {
        const { token } = req.headers;
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized: No token provided' });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (error) {
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
    }   

    async createDocument(req, res) {
        try {
            const { token } = req.headers;
            if (!token) {
                return res.status(401).json({ error: 'Unauthorized: No token provided' });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (error) {
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }

            const { alias } = req.user;
            const data = req.body;
            const result = await this.dataIngestionService.createDocument(data, alias);
            res.status(201).json({ message: 'Document created successfully', result });

        } catch (error) {
            res.status(500).json({ error: 'Failed to create document' });
        }
    }
    async ingestData(req, res) {
        try {
            const data = req.body;

            const result = await this.dataIngestionService.ingestData(data);
            res.status(201).json({ message: 'Data ingested successfully', result });
        } catch (error) {
            res.status(500).json({ error: 'Failed to ingest data' });
        }
    }

    async authorizeUser(req, res) {

        try {            
            const { token } = req.body;
            const contributor = await this.dataIngestionService.findContributorByToken(token);

            if (!contributor) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const payload = {
                alias: contributor.alias,
                name: contributor.name,
            };
            const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
            const schema = await this.dataIngestionService.getSchema();

            //res.cookie('token', jwtToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.status(200).json({success:true ,  token: jwtToken, alias: contributor.alias, name: contributor.name, schema: schema });
        } catch (error) {
            res.status(500).json({ success:false, error: 'Authorization failed' });
        }
    }
    async startSession(req, res) {
        try {
            const sessionId = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '2h' });
            res.status(200).json({ sessionId });
        } catch (error) {
            console.error('Failed to start session:', error);
            res.status(500).json({ error: 'Failed to start session' });
        }
    }

    async uploadFile(req, res) {
        try {
            if (!req.body.dataset_id) {
                return res.status(400).json({ error: 'No id provided' });
            }
            if (!req.body.resource_type) {
                return res.status(400).json({ error: 'No resource type provided' });
            }
            const files = req.files;
            for (const file of files) {

                if (!file) {
                    return res.status(400).json({ error: 'No file uploaded' });
                }
                file.resource_type = req.body.resource_type;
                file.q_value = req.body.q_value;
                file.dataset_id = req.body.dataset_id;
                const result = await this.dataIngestionService.uploadFile(file);
                if (result == -1) {
                    return res.status(500).json({ error: 'Failed to upload file: ' + file.originalname });
                }
                const file_details = {
                    q_value: file.q_value,
                    type: file.resource_type,
                    resource_type: file.fieldname,
                    url: result,
                }
                const resultUpdatingDocument = await this.dataIngestionService.updateDocumentAfterUploadingFile(file.dataset_id, 'files', file_details);
                if (resultUpdatingDocument == -1) {
                    return res.status(500).json({ error: 'Failed to update document' });
                }
            }
 
            //const result = await this.dataIngestionService.uploadFile(file);
            return res.status(200).json({ "uploaded": true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }

    async getFileContent(req, res) {
        try {
            const { dataset_id, file_name } = req.params;
            
            const fileContent = await this.dataIngestionService.getFileContent(dataset_id, file_name);
            res.status(200).json({ fileContent });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get file content' });
        }
    }
} 