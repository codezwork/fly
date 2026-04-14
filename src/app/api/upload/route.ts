import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn("⚠️ MISSING R2 CONFIGURATION. CHECK .env.local");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, productId } = await req.json();

    if (!filename || !contentType || !productId) {
      return NextResponse.json({ error: "Filename, contentType, and productId are required" }, { status: 400 });
    }

    // Prepend productId as a folder and timestamp to avoid collisions
    const safeFilename = `${productId}/${Date.now()}_${filename.replace(/\s+/g, "_")}`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: safeFilename,
      ContentType: contentType,
    });

    // Generate presigned URL valid for 60 seconds
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    
    // Final public CDN URL reflecting the folder structure
    const publicUrl = `${R2_PUBLIC_URL}/${safeFilename}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
  }
}
