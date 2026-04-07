
-- Supabase Schema for GlobalTrade Connect

-- 1. Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price DECIMAL(12, 2),
  description TEXT,
  main_image TEXT,
  video_url TEXT,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Product Images (Gallery)
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Product Specifications
CREATE TABLE product_specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  spec_key TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Pages (CMS)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Gallery (General)
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Partners
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  logo_url TEXT,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Public Access Policies (Read-only)
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (status = true);
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (status = true);
CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);
CREATE POLICY "Product specs are viewable by everyone" ON product_specifications FOR SELECT USING (true);
CREATE POLICY "Approved testimonials are viewable by everyone" ON testimonials FOR SELECT USING (status = 'approved');
CREATE POLICY "Active pages are viewable by everyone" ON pages FOR SELECT USING (is_active = true);
CREATE POLICY "Gallery images are viewable by everyone" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public partners are viewable by everyone" ON partners FOR SELECT USING (status = true);

-- Public Insert Policies
CREATE POLICY "Anyone can submit testimonials" ON testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can send contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- Admin Policies (Full access for authenticated users)
-- Note: In a real app, you'd check for an 'admin' role in a profiles table.
-- For this demo, we'll assume any authenticated user is an admin.
CREATE POLICY "Admins have full access to categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to product_images" ON product_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to product_specifications" ON product_specifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to pages" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to contact_messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to partners" ON partners FOR ALL USING (auth.role() = 'authenticated');

-- Initial Data for Pages
INSERT INTO pages (title, slug, content, is_active) VALUES
('About Us', 'about-us', '# About GlobalTrade Connect\n\nWe are a leading import-export firm...', true),
('Terms & Conditions', 'terms-conditions', '# Terms and Conditions\n\nPlease read these carefully...', true),
('Privacy Policy', 'privacy-policy', '# Privacy Policy\n\nYour privacy is important to us...', true),
('Gallery', 'gallery', '# Our Operations Gallery\n\nA visual journey through our global logistics, premium products, and international trade operations.', true);
