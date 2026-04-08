-- Initialize the database for local development
-- This file is executed when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The database and user are already created by the environment variables
-- This file can be used for additional setup if needed in the future