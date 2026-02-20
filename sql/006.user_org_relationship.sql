-- Add organization relationship to users
-- This allows users to be associated with applicant organizations

ALTER TABLE users ADD COLUMN applicant_org_id INT NULL;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_applicant_org
  FOREIGN KEY (applicant_org_id) REFERENCES applicant_org(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_users_applicant_org_id ON users(applicant_org_id);