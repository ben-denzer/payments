-- Authentication Schema for Round Robin App
-- Run this script to set up the user authentication tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE USER 'swish'@'localhost' IDENTIFIED BY '<INSERT PASSWORD HERE>';

GRANT SELECT, INSERT, UPDATE, DELETE ON roundRobin.* TO 'swish'@'localhost';
FLUSH PRIVILEGES;

-- Optional: Create sessions table for session management (if needed later)
-- CREATE TABLE IF NOT EXISTS sessions (
--     id VARCHAR(255) PRIMARY KEY,
--     user_id INT NOT NULL,
--     expires_at TIMESTAMP NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- Create password_reset_tokens table for forgot password functionality
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- Grant permissions to your application user (adjust username/database as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON your_database.users TO 'app_user'@'localhost';
-- FLUSH PRIVILEGES;
