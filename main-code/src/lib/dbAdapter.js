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

export function normalizeTask(t) {
  if (!t) return t;
  return {
    ...t,
    subtasks: typeof t.subtasks === 'string' ? JSON.parse(t.subtasks || '[]') : (t.subtasks || []),
    tags: typeof t.tags === 'string' ? JSON.parse(t.tags || '[]') : (t.tags || []),
    media: typeof t.media === 'string' ? JSON.parse(t.media || '[]') : (t.media || []),
  };
}

export function normalizeNote(n) {
  if (!n) return n;
  return {
    ...n,
    tags: typeof n.tags === 'string' ? JSON.parse(n.tags || '[]') : (n.tags || []),
    media: typeof n.media === 'string' ? JSON.parse(n.media || '[]') : (n.media || []),
  };
}

export async function fetchTasksFromDB() {
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data.map(normalizeTask);
    } catch (e) {
      console.warn('Supabase fetch failed:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/tasks', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.tasks && Array.isArray(data.tasks)) {
          return data.tasks.map(normalizeTask);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('NeonDB API tasks GET non-ok:', res.status, errData.error);
        return { error: errData.error || `HTTP ${res.status}` };
      }
    } catch (e) {
      console.warn('NeonDB API fetch failed:', e.message);
      return { error: e.message };
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

export async function deleteTaskFromDB(id) {
  return deleteTasksFromDB([id]);
}

export async function deleteTasksFromDB(ids) {
  if (!ids || ids.length === 0) return;
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      await supabase.from('tasks').delete().in('id', ids);
    } catch (e) {
      console.error('Supabase delete tasks error:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      await fetch('/api/db/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
    } catch (e) {
      console.error('NeonDB delete tasks error:', e.message);
    }
  }
}

export async function fetchNotesFromDB() {
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('notes').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data.map(normalizeNote);
    } catch (e) {
      console.warn('Supabase notes fetch failed:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/notes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.notes && Array.isArray(data.notes)) {
          return data.notes.map(normalizeNote);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('NeonDB API notes GET non-ok:', res.status, errData.error);
        return { error: errData.error || `HTTP ${res.status}` };
      }
    } catch (e) {
      console.warn('NeonDB notes fetch failed:', e.message);
      return { error: e.message };
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

export async function deleteNoteFromDB(id) {
  return deleteNotesFromDB([id]);
}

export async function deleteNotesFromDB(ids) {
  if (!ids || ids.length === 0) return;
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      await supabase.from('notes').delete().in('id', ids);
    } catch (e) {
      console.error('Supabase delete notes error:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      await fetch('/api/db/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
    } catch (e) {
      console.error('NeonDB delete notes error:', e.message);
    }
  }
}

// ─── Profile Database Synchronization Helpers ─────────────────────────────────

export async function fetchProfilesFromDB() {
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('name', { ascending: true });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase profiles fetch failed:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/profiles', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.profiles && Array.isArray(data.profiles)) {
          return data.profiles;
        }
      }
    } catch (e) {
      console.warn('NeonDB profiles fetch failed:', e.message);
    }
  }
  return null;
}

export async function saveProfilesToDB(profiles) {
  if (!profiles || profiles.length === 0) return { success: false };
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('profiles').upsert(profiles);
      if (!error) return { success: true, data };
    } catch (e) {
      console.error('Supabase save profiles error:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profiles)
      });
      return await res.json();
    } catch (e) {
      console.error('NeonDB save profiles error:', e.message);
    }
  }
  return { success: false, mode: 'local' };
}

export async function deleteProfileFromDB(id) {
  if (!id) return;
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      await supabase.from('profiles').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete profile error:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      await fetch(`/api/db/profiles?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('NeonDB delete profile error:', e.message);
    }
  }
}

// ─── Routine Database Synchronization Helpers ─────────────────────────────────

export function normalizeRoutine(r) {
  if (!r) return r;
  return {
    ...r,
    selectedDays: typeof r.selectedDays === 'string' ? JSON.parse(r.selectedDays || '[]') : (r.selectedDays || [0,1,2,3,4,5,6]),
    tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || []),
    logs: typeof r.logs === 'string' ? JSON.parse(r.logs || '[]') : (r.logs || []),
  };
}

export async function fetchRoutinesFromDB() {
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('routines').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data.map(normalizeRoutine);
    } catch (e) {
      console.warn('Supabase routines fetch failed:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/routines', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.routines && Array.isArray(data.routines)) {
          return data.routines.map(normalizeRoutine);
        }
      }
    } catch (e) {
      console.warn('NeonDB routines fetch failed:', e.message);
    }
  }
  return null;
}

export async function saveRoutinesToDB(routines) {
  if (!routines || routines.length === 0) return { success: false };
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('routines').upsert(routines);
      if (!error) return { success: true, data };
    } catch (e) {
      console.error('Supabase save routines error:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      const res = await fetch('/api/db/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routines)
      });
      return await res.json();
    } catch (e) {
      console.error('NeonDB save routines error:', e.message);
    }
  }
  return { success: false, mode: 'local' };
}

export async function deleteRoutineFromDB(id) {
  if (!id) return;
  const provider = getCurrentDBProvider();
  if (provider === 'supabase' && isSupabaseConfigured()) {
    try {
      await supabase.from('routines').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete routine error:', e.message);
    }
  } else if (provider === 'neondb' || provider === 'postgres') {
    try {
      await fetch(`/api/db/routines?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('NeonDB delete routine error:', e.message);
    }
  }
}
