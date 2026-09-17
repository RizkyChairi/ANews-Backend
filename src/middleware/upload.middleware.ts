import multer from "multer";

const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, 
    },
    fileFilter: (_req, file, cb) => {
        console.log(' File upload:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
         cb(null, true);
    },
}).single("image");