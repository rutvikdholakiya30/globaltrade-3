-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  status BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid duplicate error)
DROP POLICY IF EXISTS "Public memberships viewable by everyone" ON memberships;
DROP POLICY IF EXISTS "Admins have full access to memberships" ON memberships;

-- Public read access (only active ones)
CREATE POLICY "Public memberships viewable by everyone"
ON memberships FOR SELECT
USING (status = true);

-- Authenticated admin can do everything
CREATE POLICY "Admins have full access to memberships"
ON memberships FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
