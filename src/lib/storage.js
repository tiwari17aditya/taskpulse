import { supabase, isSupabaseConfigured } from './supabaseClient';

const TASKS_KEY = 'pulse_tasks_v1';
const NOTES_KEY = 'pulse_notes_v1';
const TAGS_KEY = 'pulse_tags_v1';
const SETTINGS_KEY = 'pulse_settings_v1';

// Default starter tags with colors
export const DEFAULT_TAGS = [
  { id: '1', name: 'Work', color: '#6366f1' },
  { id: '2', name: 'Personal', color: '#ec4899' },
  { id: '3', name: 'Urgent', color: '#ef4444' },
  { id: '4', name: 'Project', color: '#3b82f6' },
  { id: '5', name: 'Ideas', color: '#10b981' },
  { id: '6', name: 'Study', color: '#f59e0b' },
];

export const DEFAULT_TASKS = [
  {
    id: 't-1',
    title: 'Review weekly planning goals & sprint breakdown',
    completed: false,
    myDay: true,
    starred: true,
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'st-1', title: 'Prioritize top 3 high-impact tasks', completed: true },
      { id: 'st-2', title: 'Check project sync logs', completed: false }
    ],
    tags: ['Work', 'Urgent'],
    notes: 'Focus on core deployment readiness.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Explore Toffeeshare P2P feature specs for v2 roadmap',
    completed: false,
    myDay: true,
    starred: false,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    subtasks: [],
    tags: ['Ideas', 'Project'],
    notes: 'Check WebRTC DataChannel browser compatibility.',
    createdAt: new Date().toISOString(),
  }
];

export const DEFAULT_NOTES = [
  {
    id: 'n-1',
    title: '🚀 Deployment Quick Reference (Vercel & Supabase)',
    content: '1. Connect GitHub Repository to Vercel.\n2. Add environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.\n3. Run initial git commit & push.',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    pinned: true,
    tags: ['Work', 'Project'],
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80', name: 'Architecture Overview' }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-2',
    title: '💡 Useful Snippet: Dynamic Redirection Logic',
    content: '// Toffeeshare / Codeshare dynamic redirect handler\nconst redirectUrl = `/share/${code}`;\nwindow.location.href = redirectUrl;',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    pinned: false,
    tags: ['Ideas', 'Study'],
    media: [],
    createdAt: new Date().toISOString(),
  }
];

// Helper functions for Local Storage + Supabase fallback
export const storage = {
  getTasks: () => {
    if (typeof window === 'undefined') return DEFAULT_TASKS;
    try {
      const data = localStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : DEFAULT_TASKS;
    } catch (e) {
      return DEFAULT_TASKS;
    }
  },
  saveTasks: (tasks) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },
  getNotes: () => {
    if (typeof window === 'undefined') return DEFAULT_NOTES;
    try {
      const data = localStorage.getItem(NOTES_KEY);
      return data ? JSON.parse(data) : DEFAULT_NOTES;
    } catch (e) {
      return DEFAULT_NOTES;
    }
  },
  saveNotes: (notes) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  },
  getTags: () => {
    if (typeof window === 'undefined') return DEFAULT_TAGS;
    try {
      const data = localStorage.getItem(TAGS_KEY);
      return data ? JSON.parse(data) : DEFAULT_TAGS;
    } catch (e) {
      return DEFAULT_TAGS;
    }
  },
  saveTags: (tags) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  }
};
