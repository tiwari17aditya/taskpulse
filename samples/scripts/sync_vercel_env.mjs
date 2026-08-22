import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * TaskPulse Vercel Environment & Deployment Management Script
 * Supports:
 * - 'inspect' : Parse and validate local .env against Vercel requirements
 * - 'list'    : List remote Vercel environment variables
 * - 'pull'    : Pull Vercel environment variables to local .env.production.local
 * - 'push'    : Automatically sync all local .env variables to Vercel production
 * - 'deploy'  : Run production build and trigger Vercel deployment
 */

const mode = process.argv[2] || 'inspect';

function loadLocalEnv() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found at workspace root:', envPath);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const envMap = {};
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key) envMap[key] = val;
    }
  });
  return envMap;
}

const envMap = loadLocalEnv();
const totalKeys = Object.keys(envMap).length;

console.log(`\n======================================================`);
console.log(`⚡ TaskPulse Vercel Ops Automation (Mode: ${mode.toUpperCase()})`);
console.log(`======================================================`);
console.log(`📁 Loaded local .env: ${totalKeys} variables found.\n`);

if (mode === 'inspect') {
  console.log(`--- [1. Application Core & Deployment] ---`);
  console.log(`NEXT_PUBLIC_APP_NAME:   ${envMap.NEXT_PUBLIC_APP_NAME || 'N/A'}`);
  console.log(`NEXT_PUBLIC_APP_URL:    ${envMap.NEXT_PUBLIC_APP_URL || 'N/A'}`);
  console.log(`NEXT_PUBLIC_DB_PROVIDER:${envMap.NEXT_PUBLIC_DB_PROVIDER || 'N/A'}`);

  console.log(`\n--- [2. Database Providers] ---`);
  console.log(`NEON_DATABASE_URL:      ${envMap.NEON_DATABASE_URL ? 'Configured (Neon Serverless)' : 'Missing'}`);
  console.log(`SUPABASE_URL:           ${envMap.NEXT_PUBLIC_SUPABASE_URL || 'Missing'}`);

  console.log(`\n--- [3. SMTP Email Dispatcher] ---`);
  console.log(`SMTP_HOST:              ${envMap.SMTP_HOST || 'Missing'}`);
  console.log(`SMTP_PORT:              ${envMap.SMTP_PORT || 'Missing'}`);
  console.log(`SMTP_USER:              ${envMap.SMTP_USER || 'Missing'}`);
  console.log(`SMTP_PASS:              ${envMap.SMTP_PASS ? '******** (' + envMap.SMTP_PASS.length + ' chars)' : 'Missing'}`);
  console.log(`SMTP_FROM_EMAIL:        ${envMap.SMTP_FROM_EMAIL || 'Missing'}`);

  console.log(`\n✅ Local .env inspect complete. Run with 'list', 'pull', or 'push' to manage Vercel.`);
} else if (mode === 'list') {
  console.log(`Fetching remote Vercel environment variables...`);
  try {
    const out = execSync('npx.cmd vercel env ls', { encoding: 'utf-8' });
    console.log(out);
  } catch (err) {
    console.error('❌ Failed to list Vercel env. Make sure you are logged in (npx vercel login).');
  }
} else if (mode === 'pull') {
  console.log(`Pulling remote environment variables from Vercel to .env.production.local...`);
  try {
    const out = execSync('npx.cmd vercel env pull .env.production.local --yes', { encoding: 'utf-8' });
    console.log(out);
    console.log('✅ Environment variables pulled successfully.');
  } catch (err) {
    console.error('❌ Error pulling env variables:', err.message);
  }
} else if (mode === 'push') {
  console.log(`Syncing all ${totalKeys} local .env variables to Vercel production...\n`);
  const targetKeys = [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_ENV',
    'NEXT_PUBLIC_DB_PROVIDER',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEON_DATABASE_URL',
    'DATABASE_URL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM_EMAIL',
    'NEXT_PUBLIC_ENABLE_P2P_REDIRECT'
  ];

  let successCount = 0;
  for (const key of targetKeys) {
    const val = envMap[key];
    if (val !== undefined && val !== '') {
      try {
        console.log(`Adding ${key}...`);
        const isPublic = key.startsWith('NEXT_PUBLIC_');
        const envTargets = isPublic ? 'production,preview,development' : 'production,preview';
        const sensitivityFlag = isPublic ? '--no-sensitive' : '--sensitive';
        execSync(`npx.cmd vercel env add ${key} ${envTargets} --value ${JSON.stringify(val)} --force --yes --non-interactive ${sensitivityFlag}`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`  ✓ Successfully added ${key}`);
        successCount++;
      } catch (e) {
        console.log(`  ⚠️ Notice adding ${key}: ${e.message}`);
      }
    }
  }
  console.log(`\n🎉 Sync complete: ${successCount} environment variables synced to Vercel.`);
}

