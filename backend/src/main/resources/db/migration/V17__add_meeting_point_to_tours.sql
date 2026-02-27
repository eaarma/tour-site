-- Add meeting_point to main tours table
ALTER TABLE tours
ADD COLUMN meeting_point VARCHAR(255);

-- Add meeting_point to Envers audit table
ALTER TABLE tours_aud
ADD COLUMN meeting_point VARCHAR(255);