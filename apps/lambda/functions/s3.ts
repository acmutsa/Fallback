import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import { env } from "../../env";


const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.BACKUPS_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.BACKUPS_BUCKET_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BACKUPS_BUCKET_SECRET_ACCESS_KEY!,
  },
});

async function uploadToS3(fileName: string, dumpFile: string) {
  const cmd = new PutObjectCommand({
    Key: fileName,
    Bucket: process.env.BACKUPS_BUCKET_NAME!,
    Body: Buffer.from(dumpFile, "utf-8"),
  });
  return S3.send(cmd);
}
