import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_AP_SECRET,
    timeout: 60000,
});

// Ireturn valur
interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
}

export const uploadToCloudinary = (fileBuffer: Buffer): Promise<CloudinaryUploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "posts", 
                resource_type: "image", 
                timeout: 60000,
            },
            (error: any, result: any) => { 
                if (error || !result) {
                    return reject(error);
                }
                resolve({
                    secure_url: result.secure_url, 
                    public_id: result.public_id,
                });
            }
        );

       
        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};


export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export default cloudinary;