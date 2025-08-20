const { s3 } = require('../config/aws');
const environment = require('../config/environment');
const { v4: uuidv4 } = require('uuid');
// const sharp = require('sharp');
const logger = require('../utils/logger');

const uploadAndOptimizeImage = async (file) => {
    try {
        const fileName = `${uuidv4()}.webp`;
        return fileName;
        // Optimize image with sharp
        // const optimizedBuffer = await sharp(file.buffer)
        //     .resize({ width: 1200, withoutEnlargement: true })
        //     .webp({ quality: 90 })
        //     .toBuffer();

        // const params = {
        //     Bucket: environment.aws.s3BucketName,
        //     Key: fileName,
        //     Body: optimizedBuffer,
        //     ContentType: 'image/webp'
        // };

        // const data = await s3.upload(params).promise();
        // logger.info(`Successfully uploaded image to S3: ${data.Location}`);
        // return data.Location;

    } catch (error) {
        logger.error("Error optimizing or uploading image to S3:", error);
        throw new Error("Failed to process image.");
    }
};

module.exports = {
    uploadAndOptimizeImage
};