import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Universal Database Adapter with Dynamic Switcher
 * Supported DB Providers: 'supabase' | 'neondb' | 'postgres' | 'local'
 */
const DB_PROVIDER = process.env.NEXT_PUBLIC_DB_PROVIDER || 'supabase';

export async function fetchTasksFromDB() {
  if (DB_PROVIDER === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage adapter:', e.message);
    }
  } else if (DB_PROVIDER === 'neondb' || DB_PROVIDER === 'postgres') {
    // NeonDB / Postgres API Handler Integration
    try {
      const res = await fetch('/api/db/tasks');
      if (res.ok) {
        const data = await res.json();
        return data.tasks;
      }
    } catch (e) {
      console.warn('NeonDB fetch failed, falling back to local adapter:', e.message);
    }
  }

  // Fallback to local storage/default data
  return null;
}

export async function saveTaskToDB(task) {
  if (DB_PROVIDER === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('tasks').upsert([task]);
      if (!error) return { success: true, data };
    } catch (e) {
      console.error('Supabase save error:', e.message);
    }
  } else if (DB_PROVIDER === 'neondb' || DB_PROVIDER === 'postgres') {
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
  if (DB_PROVIDER === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('notes').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase notes fetch failed:', e.message);
    }
  }
  return null;
}

export function getCurrentDBProvider() {
  return DB_PROVIDER;
}
