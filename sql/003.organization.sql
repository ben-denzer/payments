-- Organization and File Management Schema
-- Run this script to set up the applicant_org and files tables

-- Create applicant_org table
CREATE TABLE IF NOT EXISTS applicant_org (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    primary_contact_name VARCHAR(255) NOT NULL,
    primary_contact_email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for applicant_org table
CREATE INDEX idx_applicant_org_primary_contact_email ON applicant_org(primary_contact_email);
CREATE INDEX idx_applicant_org_created_at ON applicant_org(created_at);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    applicant_org_id INT NOT NULL,
    file_category VARCHAR(255) NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_org_id) REFERENCES applicant_org(id) ON DELETE CASCADE
);

-- Create indexes for files table
CREATE INDEX idx_files_applicant_org_id ON files(applicant_org_id);
CREATE INDEX idx_files_type ON files(file_category);
CREATE INDEX idx_files_created_at ON files(created_at);

ALTER TABLE applicant_org ADD COLUMN storage_bucket_base VARCHAR(25) NOT NULL;

ALTER TABLE applicant_org ADD COLUMN status VARCHAR(25) NOT NULL DEFAULT 'invited';

CREATE INDEX idx_applicant_org_status ON applicant_org(status);
