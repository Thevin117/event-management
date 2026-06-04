CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  no_of_pax INTEGER NOT NULL,
  venue VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 2. Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  quantity_available INTEGER NOT NULL DEFAULT 1,
  hourly_rate DECIMAL(10, 2),
  daily_rate DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'booked',
  total_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_equipment_date ON bookings(equipment_id, booking_date);

-- 4. Client details table
CREATE TABLE IF NOT EXISTS client_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  client_whatsapp VARCHAR(20),
  company_name VARCHAR(255),
  special_requirements TEXT,
  appointment_required BOOLEAN DEFAULT FALSE,
  appointment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_details_email ON client_details(client_email);

-- 5. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  notification_type VARCHAR(50),
  recipient VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Seed: Default equipment
-- ============================================================
INSERT INTO equipment (name, type, description, quantity_available, hourly_rate, daily_rate)
VALUES
  ('LED Screen 4x3', 'led_screen', 'High-brightness LED display panel 4m x 3m', 5, 50.00, 300.00),
  ('Sound System Professional', 'sound_system', 'Full PA system with subwoofers and monitors', 8, 40.00, 250.00),
  ('Lighting Kit', 'lights', 'Stage lighting with moving heads and wash lights', 10, 30.00, 180.00),
  ('Full AV Package', 'full_package', 'Complete audio, video and lighting solution', 3, 100.00, 600.00)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read equipment (public catalog)
CREATE POLICY "Public can view equipment"
  ON equipment FOR SELECT USING (true);

-- Allow anyone to insert events (public booking form)
CREATE POLICY "Public can insert events"
  ON events FOR INSERT WITH CHECK (true);

-- Allow anyone to view events (for dashboard - tighten later with auth)
CREATE POLICY "Public can view events"
  ON events FOR SELECT USING (true);

-- Allow anyone to update events (for status changes - tighten with auth later)
CREATE POLICY "Public can update events"
  ON events FOR UPDATE USING (true);

-- Allow anyone to insert client details
CREATE POLICY "Public can insert client details"
  ON client_details FOR INSERT WITH CHECK (true);

-- Allow anyone to view client details
CREATE POLICY "Public can view client details"
  ON client_details FOR SELECT USING (true);

-- Allow anyone to read bookings (availability checking)
CREATE POLICY "Public can view bookings"
  ON bookings FOR SELECT USING (true);

-- Allow anyone to insert bookings
CREATE POLICY "Public can insert bookings"
  ON bookings FOR INSERT WITH CHECK (true);

-- Allow anyone to update bookings
CREATE POLICY "Public can update bookings"
  ON bookings FOR UPDATE USING (true);

-- Allow anyone to insert notifications
CREATE POLICY "Public can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- Allow anyone to view notifications
CREATE POLICY "Public can view notifications"
  ON notifications FOR SELECT USING (true);
