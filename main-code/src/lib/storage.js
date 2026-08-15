import { supabase, isSupabaseConfigured } from './supabaseClient';

const TASKS_KEY = 'pulse_tasks_v1';
const NOTES_KEY = 'pulse_notes_v1';
const TAGS_KEY = 'pulse_tags_v1';
const SETTINGS_KEY = 'pulse_settings_v1';
const PROFILES_KEY = 'pulse_profiles_v1';
const ACTIVE_PROFILE_KEY = 'pulse_active_profile_v1';
const REMINDERS_KEY = 'pulse_reminders_v1';
const NOTIFICATION_SETTINGS_KEY = 'pulse_notif_settings_v1';
const ROUTINES_KEY = 'pulse_routines_v1';

// Default starter profile (Aditya assigned Admin role)
export const DEFAULT_PROFILES = [
  { id: 'p-aditya', name: 'Aditya', email: 'tiwari17aditya@gmail.com', color: '#6366f1', avatar: '👤', role: 'Admin', pin: '1234', isLocked: true }
];



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
    profileId: 'p-1',
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
    profileId: 'p-1',
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
    profileId: 'p-1',
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
    profileId: 'p-1',
    title: '💡 Useful Snippet: Dynamic Redirection Logic',
    content: '// Toffeeshare / Codeshare dynamic redirect handler\nconst redirectUrl = `/share/${code}`;\nwindow.location.href = redirectUrl;',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    pinned: false,
    tags: ['Ideas', 'Study'],
    media: [],
    createdAt: new Date().toISOString(),
  }
];

export const DEFAULT_NOTIFICATION_SETTINGS = {
  webPushEnabled: true,
  emailEnabled: true,
  soundEnabled: true,
  reminderTime: '09:00', // Default morning reminder time
  webhookUrl: '',
  emailRecipient: 'user@taskpulse.app',
};

export const DEFAULT_ROUTINES = [
  {
    id: 'r-1',
    profileId: 'p-1',
    title: 'Morning Meditation & 20-Min Workout',
    notes: 'Start the morning with light stretching and mindfulness.',
    frequency: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    targetTime: '07:30',
    autoMyDay: true,
    tags: ['Personal'],
    createdAt: new Date().toISOString(),
    logs: [],
    streak: 0
  },
  {
    id: 'r-2',
    profileId: 'p-1',
    title: 'Review Sprint Progress & Commit Status',
    notes: 'Check deployment logs and prioritize open GitHub issues.',
    frequency: 'weekdays',
    selectedDays: [1, 2, 3, 4, 5],
    targetTime: '09:15',
    autoMyDay: true,
    tags: ['Work', 'Project'],
    createdAt: new Date().toISOString(),
    logs: [],
    streak: 0
  }
];

// Helper functions for Local Storage + Supabase fallback
export const storage = {
  getRoutines: () => {
    if (typeof window === 'undefined') return DEFAULT_ROUTINES;
    try {
      const data = localStorage.getItem(ROUTINES_KEY);
      return data ? JSON.parse(data) : DEFAULT_ROUTINES;
    } catch (e) {
      return DEFAULT_ROUTINES;
    }
  },
  saveRoutines: (routines) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  },
  getTasks: () => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveTasks: (tasks) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },
  getNotes: () => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(NOTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
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
  },
  // Multi-User Profile Storage
  getProfiles: () => {
    if (typeof window === 'undefined') return DEFAULT_PROFILES;
    try {
      const data = localStorage.getItem(PROFILES_KEY);
      return data ? JSON.parse(data) : DEFAULT_PROFILES;
    } catch (e) {
      return DEFAULT_PROFILES;
    }
  },
  saveProfiles: (profiles) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  },
  getActiveProfile: () => {
    if (typeof window === 'undefined') return DEFAULT_PROFILES[0];
    try {
      const id = localStorage.getItem(ACTIVE_PROFILE_KEY);
      const profiles = storage.getProfiles();
      const match = profiles.find(p => p.id === id);
      return match || profiles[0] || DEFAULT_PROFILES[0];
    } catch (e) {
      return DEFAULT_PROFILES[0];
    }
  },
  setActiveProfile: (profileId) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  },
  // Notification & Reminders Storage
  getReminders: () => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(REMINDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveReminders: (reminders) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  },
  getNotificationSettings: () => {
    if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
    try {
      const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return data ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(data) } : DEFAULT_NOTIFICATION_SETTINGS;
    } catch (e) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  },
  saveNotificationSettings: (settings) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  },
  // Master Admin PIN (Shared LDAP-style PIN across all Admin role profiles)
  getAdminMasterPin: () => {
    if (typeof window === 'undefined') return '1234';
    try {
      return localStorage.getItem('pulse_admin_master_pin_v1') || '1234';
    } catch (e) {
      return '1234';
    }
  },
  saveAdminMasterPin: (pin) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('pulse_admin_master_pin_v1', pin);
  }
};


