/*
  # Complete HMS Schema Implementation

  1. New Tables
    - doctors
      - Basic information about doctors
      - Specializations and qualifications
      - Work schedule
    
    - appointments
      - Patient-doctor appointments
      - Status tracking
      - Appointment notes
    
    - medical_records
      - Patient medical history
      - Diagnoses and treatments
      - Prescriptions
    
    - bills
      - Patient billing information
      - Payment tracking
      - Insurance details
    
    - inventory
      - Medical supplies tracking
      - Stock management
    
    - pharmacy_items
      - Medicine inventory
      - Stock levels
      - Supplier information
    
    - lab_tests
      - Laboratory test records
      - Results tracking
      - Test types
    
    - notifications
      - System notifications
      - User notifications
      - Appointment reminders

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each role
*/

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  specialization text NOT NULL,
  qualifications text[] NOT NULL,
  license_number text UNIQUE NOT NULL,
  contact_number text NOT NULL,
  email text NOT NULL,
  available_days text[] NOT NULL,
  available_hours jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients NOT NULL,
  doctor_id uuid REFERENCES doctors NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reason text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients NOT NULL,
  doctor_id uuid REFERENCES doctors NOT NULL,
  visit_date date NOT NULL,
  diagnosis text NOT NULL,
  treatment text NOT NULL,
  prescription text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients NOT NULL,
  appointment_id uuid REFERENCES appointments,
  amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  payment_date timestamptz,
  insurance_claim_id text,
  insurance_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'cancelled'))
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  reorder_level integer NOT NULL,
  supplier text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pharmacy Items table
CREATE TABLE IF NOT EXISTS pharmacy_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  generic_name text NOT NULL,
  category text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  reorder_level integer NOT NULL,
  supplier text NOT NULL,
  expiry_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lab Tests table
CREATE TABLE IF NOT EXISTS lab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients NOT NULL,
  doctor_id uuid REFERENCES doctors NOT NULL,
  test_type text NOT NULL,
  test_date date NOT NULL,
  results text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('appointment', 'billing', 'inventory', 'lab', 'general'))
);

-- Enable RLS on all tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Doctors policies
CREATE POLICY "Public doctors are viewable by everyone"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Doctors can update their own profile"
  ON doctors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
      UNION
      SELECT user_id FROM doctors WHERE id = doctor_id
    )
  );

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
    )
  );

-- Medical Records policies
CREATE POLICY "Users can view their medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
      UNION
      SELECT user_id FROM doctors WHERE id = doctor_id
    )
  );

-- Bills policies
CREATE POLICY "Users can view their bills"
  ON bills FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
    )
  );

-- Inventory policies
CREATE POLICY "Staff can view inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM doctors
    )
  );

-- Pharmacy policies
CREATE POLICY "Staff can view pharmacy items"
  ON pharmacy_items FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM doctors
    )
  );

-- Lab Tests policies
CREATE POLICY "Users can view their lab tests"
  ON lab_tests FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
      UNION
      SELECT user_id FROM doctors WHERE id = doctor_id
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacy_items_updated_at
  BEFORE UPDATE ON pharmacy_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_tests_updated_at
  BEFORE UPDATE ON lab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();