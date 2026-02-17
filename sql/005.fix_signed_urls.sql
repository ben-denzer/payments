-- Fix Signed URLs Migration
-- Clear existing signed URL data that may have incorrect datetime format
-- This will force regeneration of signed URLs with proper Date object storage

-- Clear signed URL data for all files
UPDATE files SET signed_url = NULL, signed_url_expires_at = NULL WHERE signed_url IS NOT NULL;