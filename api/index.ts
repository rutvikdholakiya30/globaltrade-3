import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function getSmtpConfig() {
  try {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'smtp_config')
      .single();

    if (data) {
      return {
        host: data.smtp_host || process.env.SMTP_HOST,
        port: parseInt(data.smtp_port || process.env.SMTP_PORT || '587'),
        user: data.smtp_user || process.env.SMTP_USER,
        pass: data.smtp_pass || process.env.SMTP_PASS,
        adminEmail: data.admin_email || process.env.ADMIN_EMAIL || 'avinfotech50@gmail.com',
        senderName: data.sender_name || 'GlobalTrade Support',
        replyHeader: data.reply_header || 'GlobalTrade Support Response'
      };
    }
  } catch (err) {
    console.error('Error fetching SMTP config from DB:', err);
  }

  return {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    adminEmail: process.env.ADMIN_EMAIL || 'avinfotech50@gmail.com',
    senderName: 'GlobalTrade Support',
    replyHeader: 'GlobalTrade Support Response'
  };
}

const app = express();
app.use(express.json());

app.post('/api/contact-notification', async (req, res) => {
  const { name, email, subject, message } = req.body;
  const config = await getSmtpConfig();

  if (!config.host || !config.user || !config.pass) {
    return res.status(500).json({ error: 'SMTP not configured' });
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });

  try {
    await transporter.sendMail({
      from: `"${config.senderName}" <${config.user}>`,
      to: config.adminEmail,
      subject: `New Inquiry: ${subject || 'No Subject'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <hr style="border: 1px solid #eee;" />
          <p><strong>Message:</strong></p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('SMTP Error:', error);
    res.status(500).json({ error: 'Failed to send email notification' });
  }
});

app.post('/api/reply', async (req, res) => {
  const { to, subject, message } = req.body;
  const config = await getSmtpConfig();

  if (!config.host || !config.user || !config.pass) {
    return res.status(500).json({ error: 'SMTP not configured' });
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });

  try {
    await transporter.sendMail({
      from: `"${config.senderName}" <${config.user}>`,
      to,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">${config.replyHeader}</h2>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <hr style="border: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            This is a response to your recent inquiry. Thank you for choosing GlobalTrade.
          </p>
        </div>
      `,
    });
    res.json({ success: true });
  } catch (error) {
    console.error('SMTP Error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

export default app;
