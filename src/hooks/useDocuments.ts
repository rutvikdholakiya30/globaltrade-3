import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { DocumentCategory, DocumentItem } from '@/types';

export function useDocumentCategories(activeOnly = true) {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      let query = supabase.from('document_categories').select('*').order('name');
      if (activeOnly) {
        query = query.eq('status', true);
      }
      
      const { data, error } = await query;
      if (!error && data) setCategories(data);
      setLoading(false);
    }
    fetchCategories();
  }, [activeOnly]);

  return { categories, loading, setCategories };
}

export function useDocuments(activeOnly = true) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      let query = supabase
        .from('documents')
        .select('*, category:document_categories(*)')
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('status', true);
      }

      const { data, error } = await query;
      if (!error && data) setDocuments(data);
      setLoading(false);
    }
    fetchDocuments();
  }, [activeOnly]);

  return { documents, loading, setDocuments };
}
