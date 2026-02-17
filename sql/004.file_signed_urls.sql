-- File Signed URLs Migration
-- Add columns for caching signed URLs to reduce API calls and improve performance

ALTER TABLE files ADD COLUMN signed_url TEXT;
ALTER TABLE files ADD COLUMN signed_url_expires_at TIMESTAMP NULL;

-- Create index for signed URL expiration to optimize cleanup queries
CREATE INDEX idx_files_signed_url_expires_at ON files(signed_url_expires_at);

-- Optional: Add a comment to document the signed URL expiration policy
-- Signed URLs expire after 7 days maximum (AWS S3/Digital Ocean Spaces limitation)