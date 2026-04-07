import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function updateTerms() {
  const content = `# Terms and Conditions
Last Updated: ${new Date().toLocaleDateString()}

## 1. Introduction
Welcome to **GlobalTrade Connect**. These Terms and Conditions govern your use of our website and services. By accessing our platform, you accept these terms in full.

## 2. Intellectual Property Rights
Unless otherwise stated, GlobalTrade Connect and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved.

## 3. Verified Supply Chain
As a B2B platform, we ensure that all products listed are verified. However, users are responsible for conducting their own due diligence before final procurement.

## 4. Shipping & Logistics
GlobalTrade Connect facilitates international shipping. We are not liable for delays caused by custom clearance or force majeure events once global tracking is initiated.

## 5. Payments
All transactions are governed by the specific trade agreement established at the time of purchase. Standard L/C or T/T terms apply unless otherwise specified.

## 6. User Conduct
Users must not use this website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of GlobalTrade Connect.

## 7. Contact Us
If you have any questions about these Terms, please contact us at support@globaltrade.com.`;

  const { error } = await supabase.from('pages').upsert({
    title: 'Terms & Conditions',
    slug: 'terms-conditions',
    content: content,
    is_active: true,
    updated_at: new Date().toISOString()
  }, { onConflict: 'slug' });

  if (error) {
    console.error('Error updating page:', error);
    process.exit(1);
  } else {
    console.log('Successfully updated Terms & Conditions page.');
    process.exit(0);
  }
}

updateTerms();
