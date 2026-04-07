import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedGalleryPage() {
  console.log('--- SEEDING GALLERY PAGE ---');
  
  const { data: existing } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'gallery')
    .maybeSingle();

  if (existing) {
    console.log('✅ Gallery page already exists in CMS.');
  } else {
    console.log('🚀 Creating Gallery page entry...');
    const { error } = await supabase.from('pages').insert({
      title: 'Gallery',
      slug: 'gallery',
      content: '# Gallery Operations\nExplore our high-fidelity visual archive of global trade and logistics operations.',
      is_active: true
    });

    if (error) {
      console.error('❌ Failed to seed Gallery page:', error.message);
    } else {
      console.log('✅ Gallery page successfully added to CMS!');
    }
  }
}

seedGalleryPage();
