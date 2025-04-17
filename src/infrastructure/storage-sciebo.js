import { createClient } from "webdav";
import 'dotenv/config';


class StorageSciebo {

    constructor() {
        this.client = createClient(
            process.env.SCIEBO_LINK,
            {
                username: process.env.SCIEBO_USER_NAME,
                password: process.env.SCIEBO_PWD,
            }
        );
    }

    async uploadFile(file) {
        console.log("Uploading file: " + file.fieldname);
        if (file.q_value ) {
            file.q_value = file.q_value.replace(/\./g, 'PpP');
        }
        else {
            file.q_value = "NaN";
        }
        const folder_id = file.dataset_id;

        const file_extension = file.originalname.split(".")[1];
        const storage_file_name = file.fieldname + "_"
                            + file.resource_type + "_Q_" 
                            + file.q_value + "_" 
                            + folder_id + "." + file_extension;
        console.log("Storage file name: " + storage_file_name);
        const folderPath = String(process.env.SCIEBO_DATA_DIR + "/" + folder_id + "/");
        try {
            const folderExists = await this.client.exists(folderPath);
            if (!folderExists) {
                await this.client.createDirectory(folderPath);
            }
        } catch (error) {
            console.error(`Error creating folder: ${folderPath}`, error);
            return -1;
        }
        const uploadPath = String(folderPath + storage_file_name);

        const fileContent = file.buffer;
        const uploadSuccess = await this.client.putFileContents(uploadPath, fileContent);
        if (!uploadSuccess) return -1;
        const link = this.client.getFileDownloadLink(storage_file_name)
        
        console.log("Link: "+link);
        const file_name = link.slice(link.lastIndexOf("/") + 1)
        return String(process.env.SCIEBO_SHARING_LINK+folder_id+"&files="+file_name)
        
    }

    async isFileExist(fileName) {
        try {
            const existingFiles = await this.client.getDirectoryContents(process.env.SCIEBO_DATA_DIR);
            return existingFiles.some(item => item.basename === fileName);
        } catch (error) {
            console.error(`Error checking file existence: ${fileName}`, error);
            return false;
        }
    }

    async getFileContent(dataset_id, file_name) {
        const fileContent = await this.client.getFileContents(process.env.SCIEBO_DATA_DIR+"/"+dataset_id+"/"+file_name)
        
        return fileContent;
    }
}

export default StorageSciebo; 