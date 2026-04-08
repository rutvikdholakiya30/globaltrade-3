-- 1. Document Categories Table
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES document_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public document categories viewable by everyone" ON document_categories FOR SELECT USING (status = true);
CREATE POLICY "Public documents viewable by everyone" ON documents FOR SELECT USING (status = true);

-- Admin full access
CREATE POLICY "Admins have full access to document_categories" ON document_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to documents" ON documents FOR ALL USING (auth.role() = 'authenticated');

-- Insert some default categories
INSERT INTO document_categories (name, slug) VALUES 
('Brochures', 'brochures'),
('Catalogs', 'catalogs'),
('Certifications', 'certifications');
