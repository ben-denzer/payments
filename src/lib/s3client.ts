import { S3 } from '@aws-sdk/client-s3';

const s3Client = new S3({
  endpoint: process.env.DIGITAL_OCEAN_STORAGE_URL!,
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_STORAGE_KEY_ID!,
    secretAccessKey: process.env.DIGITAL_OCEAN_STORAGE_KEY_SECRET!,
  },
  // `region` is verified and it has to be  an AWS region even though
  // we are using Digital Ocean Spaces.
  // It is not actually used, the endpoint is used instead.
  region: 'us-east-1',
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
});

export { s3Client };
