
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load env from the project root
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...value] = line.split('=');
      return [key.trim(), value.join('=').trim()];
    })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function migrate() {
  console.log('Starting migration...');
  const { data, error } = await supabase.rpc('execute_sql', {
    query: 'ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category TEXT;'
  });
  
  if (error) {
    if (error.message.includes('function execute_sql(query text) does not exist')) {
      console.log('RPC execute_sql not found. This is expected. Please run this in Supabase SQL Editor: ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category TEXT;');
    } else {
      console.error('Migration Error:', error);
    }
  } else {
    console.log('Migration Success: category column added.');
  }
  process.exit(0);
}

migrate();
