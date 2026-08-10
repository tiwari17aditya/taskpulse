import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Universal Database Adapter with Dynamic Auto-Detection & Provider Switcher
 * Supported DB Providers: 'neondb' | 'supabase' | 'postgres' | 'local'
 */

export function getCurrentDBProvider() {
  if (typeof window !== 'undefined' && window.__ACTIVE_DB_PROVIDER) {
    return window.__ACTIVE_DB_PROVIDER;
  }

  const envProvider = (process.env.NEXT_PUBLIC_DB_PROVIDER || '').toLowerCase();
  
  if (envProvider === 'neondb') return 'neondb';
  if (envProvider === 'postgres') return 'postgres';
  if (envProvider === 'local') return 'local';
  if (envProvider === 'supabase' && isSupabaseConfigured()) return 'supabase';

  // Smart auto-detect: If NeonDB connection string is present in env, default to NeonDB
  const neonUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
  if (neonUrl && neonUrl.includes('neon.tech')) {
    return 'neondb';
  }

  if (isSupabaseConfigured()) return 'supabase';

  return 'neondb'; // Default to NeonDB per user configuration
}

export async function fetchTasksFromDB() {
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch failed:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/tasks');
      if (res.ok) {
        const data = await res.json();
        return data.tasks;
      }
    } catch (e) {
      console.warn('NeonDB API fetch failed:', e.message);
    }
  }

  return null;
}

export async function saveTaskToDB(task) {
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('tasks').upsert([task]);
      if (!error) return { success: true, data };
    } catch (e) {
      console.error('Supabase save error:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      return await res.json();
    } catch (e) {
      console.error('NeonDB save error:', e.message);
    }
  }

  return { success: false, mode: 'local' };
}

export async function fetchNotesFromDB() {
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('notes').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase notes fetch failed:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/notes');
      if (res.ok) {
        const data = await res.json();
        return data.notes;
      }
    } catch (e) {
      console.warn('NeonDB notes fetch failed:', e.message);
    }
  }
  return null;
}

export async function saveNoteToDB(note) {
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('notes').upsert([note]);
      if (!error) return { success: true, data };
    } catch (e) {
      console.error('Supabase save error:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      return await res.json();
    } catch (e) {
      console.error('NeonDB save note error:', e.message);
    }
  }

  return { success: false, mode: 'local' };
}
