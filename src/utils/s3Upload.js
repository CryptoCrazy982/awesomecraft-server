// utils/s3Upload.js
import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (file, folder = "templates") => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

export const deleteFromS3 = async (url) => {
  if (!url) return;
  const key = decodeURIComponent(url.split(".com/")[1]);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  await s3.deleteObject(params).promise();
};
