-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  status BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public memberships viewable by everyone" ON memberships 
FOR SELECT USING (status = true);

-- Admin full access
CREATE POLICY "Admins have full access to memberships" ON memberships 
FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial dummy data
INSERT INTO memberships (name, logo_url, "order") VALUES 
('Export Promotion Council', 'https://api.placeholder.com/100', 1),
('Commerce & Industry Chamber', 'https://api.placeholder.com/100', 2),
('Trade Certification Bureau', 'https://api.placeholder.com/100', 3);
