export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  status: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  price: number;
  description: string;
  main_image: string;
  video_url?: string;
  is_video_main: boolean;
  status: boolean;
  created_at: string;
  category?: Category;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  features?: string[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  spec_key: string;
  spec_value: string;
}

export interface Testimonial {
  id: string;
  product_id?: string;
  name: string;
  company?: string;
  message: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  product?: Product;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_active: boolean;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

export interface Partner {
  id: string;
  name?: string;
  logo_url?: string;
  status: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}

export interface ContactInfo {
  addresses: string[];
  phones: string[];
  emails: string[];
  working_hours: string[];
}

export interface SiteSettings {
  id: string; // e.g., 'contact_info', 'smtp_config'
  data: any; // JSONB storage
  updated_at: string;
}
