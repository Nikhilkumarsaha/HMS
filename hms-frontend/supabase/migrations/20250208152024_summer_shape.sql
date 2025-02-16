/*
  # Initial HMS Database Setup

  1. Tables
    - users (handled by Supabase Auth)
    - patients
      - id (uuid, primary key)
      - user_id (references auth.users)
      - first_name (text)
      - last_name (text)
      - date_of_birth (date)
      - gender (text)
      - contact_number (text)
      - address (text)
      - medical_history (text)
      - created_at (timestamp)
    
  2. Security
    - Enable RLS on patients table
    - Add policies for authenticated users
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  contact_number text,
  address text,
  medical_history text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own patient profile"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient profile"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();