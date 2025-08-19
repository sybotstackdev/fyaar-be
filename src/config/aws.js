const AWS = require('aws-sdk');
const environment = require('./environment');

AWS.config.update({
    accessKeyId: environment.aws.accessKeyId,
    secretAccessKey: environment.aws.secretAccessKey,
    region: environment.aws.region
});

const s3 = new AWS.S3();

module.exports = { s3 };
