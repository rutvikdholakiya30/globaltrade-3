-- Table to track admin access for security monitoring
CREATE TABLE admin_access_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address VARCHAR(255),
    location TEXT,
    user_agent TEXT,
    is_success BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read logs
CREATE POLICY "Admins can view access logs" ON admin_access_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow inserts (usually from the dashboard when logged in)
CREATE POLICY "Anyone can log access" ON admin_access_logs
    FOR INSERT WITH CHECK (true);
