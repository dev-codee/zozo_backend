import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import env from '../config/env.js';

cloudinary.config({ 
  cloud_name: env.CLOUDINARY.CLOUD_NAME, 
  api_key: env.CLOUDINARY.API_KEY, 
  api_secret: env.CLOUDINARY.API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file
        return response;
        
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        }
        return null;
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        if(!publicId) return null;
        
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };
