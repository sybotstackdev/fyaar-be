const { s3 } = require('../config/aws');
const environment = require('../config/environment');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const logger = require('../utils/logger');
const heicConvert = require('heic-convert');

// function buildCdnUrl(key) {
//     return `${process.env.AWS_CLOUDFRONT_DOMAIN.replace(/\/$/, '')}/${key}`;
// }

const uploadToS3 = async (file, folder) => {
    try {
        const fileName = `${folder}/${uuidv4()}.webp`;

        const optimizedBuffer = await sharp(file.buffer)
            .resize({ width: 1500, withoutEnlargement: true })
            .webp({ quality: 95 })
            .toBuffer();

        const params = {
            Bucket: environment.aws.s3BucketName,
            Key: fileName,
            Body: optimizedBuffer,
            ContentType: 'image/webp',
        };

        const data = await s3.upload(params).promise();
        logger.info(`Successfully uploaded image to S3: ${data.Location}`);
        return data.Location;

    } catch (error) {
        logger.error("Error optimizing or uploading image to S3:", error);
        throw new Error("Failed to process image.");
    }
};

const deleteFromS3 = async (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string') {
        logger.warn("deleteFromS3 called with invalid or empty fileUrl.");
        return;
    }

    try {
        const url = new URL(fileUrl);
        const key = url.pathname.substring(1);

        const params = {
            Bucket: environment.aws.s3BucketName,
            Key: key,
        };

        await s3.deleteObject(params).promise();
        logger.info(`Successfully deleted file from S3: ${key}`);
    } catch (error) {
        logger.error(`Error deleting file from S3 using URL ${fileUrl}:`, error);
    }
};

/**
 * Uploads an image for a user profile to S3.
 * Converts the image to JPEG format for compatibility without resizing.
 * @param {Object} file - The file object from multer.
 * @param {string} folder - The S3 folder to upload to.
 * @returns {string} The URL of the uploaded image.
 */
const uploadProfileImageS3 = async (file, folder) => {
    try {
        const fileName = `${folder}/${uuidv4()}.jpeg`;
        let inputBuffer = file.buffer;

        const isHeic = /heic|heif/.test(file.mimetype) || /\.heic$/i.test(file.originalname);
        if (isHeic) {
            logger.info('HEIC image detected. Converting to JPEG...');
            inputBuffer = await heicConvert({
                buffer: file.buffer,
                format: 'JPEG',
                quality: 1
            });
            logger.info('HEIC image converted successfully.');
        }

        const outputBuffer = await sharp(inputBuffer)
            .resize({
              width: 1024,
              height: 1024,
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 95 })
            .toBuffer();

        const params = {
            Bucket: environment.aws.s3BucketName,
            Key: fileName,
            Body: outputBuffer,
            ContentType: 'image/jpeg',
        };

        const data = await s3.upload(params).promise();
        logger.info(`Successfully uploaded profile image to S3: ${data.Location}`);
        return data.Location;

    } catch (error) {
        logger.error("Error processing or uploading profile image to S3:", error);
        throw new Error("Failed to process image.");
    }
};


module.exports = { uploadToS3, deleteFromS3, uploadProfileImageS3 };