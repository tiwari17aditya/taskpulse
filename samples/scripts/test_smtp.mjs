import nodemailer from '../../main-code/node_modules/nodemailer/lib/nodemailer.js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('./main-code/.env'), 'utf-8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
});

console.log('Testing SMTP connection with:');
console.log('Host:', env.SMTP_HOST);
console.log('Port:', env.SMTP_PORT);
console.log('User:', env.SMTP_USER);
console.log('Pass length:', env.SMTP_PASS ? env.SMTP_PASS.length : 0);

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587', 10),
  secure: env.SMTP_PORT === '465',
  auth: {
    user: env.SMTP_USER,
    pass: (env.SMTP_PASS || '').replace(/\s+/g, '')
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify()
  .then(async () => {
    console.log('✅ SMTP connection successfully verified with Gmail server!');
    console.log('Dispatching test email to tiwari17aditya@gmail.com...');
    const info = await transporter.sendMail({
      from: env.SMTP_FROM_EMAIL || `"TaskPulse" <${env.SMTP_USER}>`,
      to: 'tiwari17aditya@gmail.com',
      subject: '⚡ TaskPulse Email Dispatcher Online Test',
      html: `
        <div style="font-family: sans-serif; background-color: #020617; color: #f8fafc; padding: 24px; border-radius: 12px;">
          <h2 style="color: #818cf8;">TaskPulse SMTP Test Successful! 🚀</h2>
          <p>Your SMTP credentials configured in <code>.env</code> are working properly.</p>
          <p style="color: #94a3b8; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });
    console.log('✅ Email successfully dispatched! Message ID:', info.messageId);
    console.log('Server response:', info.response);
  })
  .catch(err => {
    console.error('❌ SMTP dispatch failed:', err);
  });

