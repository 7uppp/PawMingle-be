import {S3Client, S3ClientConfig, GetObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import multer from 'multer';
import dotenv from 'dotenv';
import path from "path";

dotenv.config();

// Check if all AWS related environment variables are set
if (!process.env.accessKeyId || !process.env.secretAccessKey || !process.env.AWS_REGION) {
    console.error("Missing AWS environment variables");
    process.exit(1);
}

const awsConfig: S3ClientConfig = {
    credentials: {
        accessKeyId: process.env.accessKeyId as string,
        secretAccessKey: process.env.secretAccessKey as string,
    },
    region: process.env.AWS_REGION as string,
};

const s3Client = new S3Client(awsConfig);

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: 'pawmingleuseravatar',
        metadata: function (req: any, file: any, cb: any) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req: any, file: any, cb: any) {
            cb(null, req.username + file.originalname);
        },
    }),
    limits: {
        fileSize: 2 * 1024 * 1024  // limit 2MB
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('.png,.jpg,jpeg only！'));
    }
});


async function deleteFromS3(key: string) {
    const deleteParams = {
        Bucket: 'pawmingleuseravatar',
        Key: key
    };

    try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
        console.error('There was an error deleting the old avatar:', error);
    }
}
export { upload,deleteFromS3 };
