const { s3 } = require('../config/aws');
const environment = require('../config/environment');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const logger = require('../utils/logger');

// function buildCdnUrl(key) {
//     return `${process.env.AWS_CLOUDFRONT_DOMAIN.replace(/\/$/, '')}/${key}`;
// }

const uploadToS3 = async (file, folder) => {
    try {
        const fileName = `${folder}/${uuidv4()}.webp`;

        const optimizedBuffer = await sharp(file.buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 90 })
            .toBuffer();

        const params = {
            Bucket: environment.aws.s3BucketName,
            Key: fileName,
            Body: optimizedBuffer,
            ContentType: 'image/webp',
            // ACL: 'public-read'
        };

        const data = await s3.upload(params).promise();
        logger.info(`Successfully uploaded image to S3: ${data.Location}`);
        return buildCdnUrl(fileName);

    } catch (error) {
        logger.error("Error optimizing or uploading image to S3:", error);
        throw new Error("Failed to process image.");
    }
};

module.exports = { uploadToS3 };