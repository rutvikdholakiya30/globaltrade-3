-- Subscribers Email Collection Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,     -- UNIQUE prevents duplicate emails
  name TEXT,
  source TEXT DEFAULT 'contact_form',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (when someone submits the contact form)
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Allow authenticated admins to view and manage
CREATE POLICY "Admins have full access to subscribers" ON subscribers
  FOR ALL USING (auth.role() = 'authenticated');
