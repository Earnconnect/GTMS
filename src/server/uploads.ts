/** Whether real file upload is available (Vercel Blob configured). */
export function isUploadEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
