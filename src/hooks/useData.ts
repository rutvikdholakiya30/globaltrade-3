import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category, Product, Testimonial, Page, GalleryItem, Partner, ContactInfo } from '@/types';

const DEFAULT_CONTACT_INFO: ContactInfo = {
  addresses: ['123 Trade Center, Logistics Bay, Dubai, United Arab Emirates'],
  phones: ['+971 4 123 4567'],
  emails: ['contact@globaltrade.com'],
  working_hours: ['Mon - Fri: 9:00 AM - 6:00 PM (GMT)']
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', true)
        .order('name');
      
      if (!error && data) setCategories(data);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  return { categories, loading };
}

export function useProducts(categoryId?: string, limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (!error && data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, [categoryId, limit]);

  return { products, loading };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*), specifications:product_specifications(*)')
        .eq('slug', slug)
        .single();
      
      if (!error && data) setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  return { product, loading };
}

export function useTestimonials(limit?: number) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      let query = supabase
        .from('testimonials')
        .select('*, product:products(title)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = query;
      if (!error && data) setTestimonials(data);
      setLoading(false);
    }
    fetchTestimonials();
  }, [limit]);

  return { testimonials, loading };
}

export function usePage(slug: string) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle(); 
      
      if (!error && data) setPage(data);
      setLoading(false);
    }
    fetchPage();
  }, [slug]);

  return { page, loading };
}

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setItems(data);
      setLoading(false);
    }
    fetchGallery();
  }, []);

  return { items, loading };
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });
      
      if (!error && data) setPartners(data);
      setLoading(false);
    }
    fetchPartners();
  }, []);

  return { partners, loading };
}

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(DEFAULT_CONTACT_INFO);
  const [loading, setLoading] = useState(true);

  const fetchContactInfo = async () => {
    const { data, error } = await supabase
        .from('pages')
        .select('content')
        .eq('slug', 'site-contact-settings')
        .maybeSingle(); 
      
    if (!error && data && data.content) {
      try {
        const parsed = JSON.parse(data.content);
        setContactInfo({
          addresses: parsed.addresses || DEFAULT_CONTACT_INFO.addresses,
          phones: parsed.phones || DEFAULT_CONTACT_INFO.phones,
          emails: parsed.emails || DEFAULT_CONTACT_INFO.emails,
          working_hours: Array.isArray(parsed.working_hours) 
            ? parsed.working_hours 
            : DEFAULT_CONTACT_INFO.working_hours,
        });
      } catch (e) {
        console.error('Failed to parse contact settings:', e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContactInfo();

    // Use unique channel name based on slug to avoid conflicts
    const channel = supabase.channel('site-settings-changes');

    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pages',
          filter: 'slug=eq.site-contact-settings',
        },
        () => {
          fetchContactInfo();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connected for contact info');
        }
      });

    return () => {
      // Correct cleanup pattern to prevent memory leaks and crashes
      supabase.removeChannel(channel);
    };
  }, []);

  return { contactInfo, loading };
}
