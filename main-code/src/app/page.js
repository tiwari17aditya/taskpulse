'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TaskManager from '@/components/TaskManager';
import NoteCanvas from '@/components/NoteCanvas';
import RoutineManager from '@/components/RoutineManager';
import ShareRedirectModal from '@/components/ShareRedirectModal';
import TokenUsageModal from '@/components/TokenUsageModal';
import LogViewerModal from '@/components/LogViewerModal';
import ProfileManagerModal from '@/components/ProfileManagerModal';
import NotificationManagerModal from '@/components/NotificationManagerModal';
import AdminPanelModal from '@/components/AdminPanelModal';
import { storage } from '@/lib/storage';
import { getCurrentDBProvider, fetchTasksFromDB, saveTaskToDB, fetchNotesFromDB, saveNoteToDB, fetchProfilesFromDB, saveProfilesToDB, deleteProfileFromDB, fetchRoutinesFromDB, saveRoutinesToDB, deleteRoutineFromDB } from '@/lib/dbAdapter';
import UserGuideModal from '@/components/UserGuideModal';
import ProfileLockModal from '@/components/ProfileLockModal';
import FirstTimeTutorialModal from '@/components/FirstTimeTutorialModal';
import { Sun, Calendar, Star, CheckCircle2, ListTodo, StickyNote, Tag, Cloud, ShieldCheck, Database, BookOpen, Menu, RefreshCw, Bell, UserCheck, Repeat, Lock, Unlock, HelpCircle } from 'lucide-react';



export default function Home() {
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' or 'notes'
  const [currentFilter, setCurrentFilter] = useState('my-day'); // 'my-day', 'important', 'planned', 'all-tasks', 'completed'
  const [activeTag, setActiveTag] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const dbProvider = getCurrentDBProvider();
  const dbLabel = dbProvider === 'neondb' ? 'NeonDB PostgreSQL Active'
    : dbProvider === 'supabase' ? 'Supabase Storage Ready'
    : dbProvider === 'postgres' ? 'PostgreSQL Active'
    : 'Local Storage Ready';

  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [tags, setTags] = useState([]);

  // Multi-User Profiles state
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  // Reminders & Notification Settings state
  const [reminders, setReminders] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({});

  // Modals state
  const [shareItem, setShareItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTokensModal, setShowTokensModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockTargetProfile, setLockTargetProfile] = useState(null);
  const [isProfileUnlocked, setIsProfileUnlocked] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  // Routine Auto-Populate & Completion Log helper functions
  const updateRoutineCompletionLog = (routineId, taskCompleted, completionDate) => {
    const targetDate = completionDate || new Date().toISOString().split('T')[0];
    const updated = routines.map(r => {
      if (r.id === routineId) {
        let logs = r.logs || [];
        if (taskCompleted) {
          if (!logs.includes(targetDate)) {
            logs = [...logs, targetDate].sort();
          }
        } else {
          logs = logs.filter(d => d !== targetDate);
        }

        let streak = 0;
        const sortedLogs = [...new Set(logs)].sort().reverse();
        if (sortedLogs.length > 0) {
          const today = new Date();
          let checkDate = new Date(today);
          let todayStr = checkDate.toISOString().split('T')[0];

          if (!sortedLogs.includes(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
            todayStr = checkDate.toISOString().split('T')[0];
          }

          while (sortedLogs.includes(todayStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            todayStr = checkDate.toISOString().split('T')[0];
          }
        }

        return { ...r, logs, streak };
      }
      return r;
    });

    setRoutines(updated);
    storage.saveRoutines(updated);
  };

  const evaluateRoutineAutoPopulate = (currentTasks, currentRoutines) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    let hasChanges = false;
    let updatedTasks = currentTasks.map(task => {
      // Enhancement 6 — "my day" corresponds strictly to current day.
      // If task is incomplete and in My Day from a previous date, remove it from My Day.
      if (task.myDay && !task.completed) {
        const taskDate = task.myDayDate || task.routineDate || (task.createdAt ? task.createdAt.split('T')[0] : '');
        if (taskDate && taskDate < todayStr) {
          hasChanges = true;
          return { ...task, myDay: false };
        }
      }
      return task;
    });

    if (!currentRoutines || currentRoutines.length === 0) {
      if (hasChanges) storage.saveTasks(updatedTasks);
      return updatedTasks;
    }

    currentRoutines.forEach(routine => {
      if (routine.paused) return;
      if (routine.profileId && activeProfile?.id && routine.profileId !== activeProfile.id) return;
      if (routine.autoMyDay === false) return;

      let isDueToday = false;
      const freq = routine.frequency || 'daily';
      const days = routine.selectedDays || [0, 1, 2, 3, 4, 5, 6];

      if (freq === 'daily') {
        isDueToday = true;
      } else if (freq === 'weekdays') {
        isDueToday = dayOfWeek >= 1 && dayOfWeek <= 5;
      } else if (freq === 'weekly') {
        isDueToday = days.includes(dayOfWeek);
      } else if (freq === 'monthly') {
        isDueToday = dayOfMonth === 1;
      } else if (freq === 'custom') {
        isDueToday = days.includes(dayOfWeek);
      }

      if (isDueToday) {
        const existing = updatedTasks.find(t =>
          (t.routineId === routine.id && t.routineDate === todayStr) ||
          (t.routineId === routine.id && t.dueDate === todayStr)
        );

        if (!existing) {
          const newTask = {
            id: `t-routine-${routine.id}-${todayStr}`,
            profileId: routine.profileId || activeProfile?.id || 'p-1',
            title: routine.title,
            completed: false,
            myDay: true,
            myDayDate: todayStr,
            starred: false,
            dueDate: todayStr,
            subtasks: [],
            tags: routine.tags || [],
            notes: routine.notes || '',
            createdAt: new Date().toISOString(),
            routineId: routine.id,
            routineDate: todayStr,
            routineTime: routine.targetTime || '08:00'
          };
          updatedTasks.unshift(newTask);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      storage.saveTasks(updatedTasks);
    }
    return updatedTasks;
  };

  // Sync data from database (NeonDB / Supabase) to local state & localStorage
  const syncDataFromDB = async (isManual = false) => {
    if (isSyncing && !isManual) return;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const [dbTasks, dbNotes, dbProfiles, dbRoutines] = await Promise.all([
        fetchTasksFromDB(),
        fetchNotesFromDB(),
        fetchProfilesFromDB(),
        fetchRoutinesFromDB()
      ]);

      let errorMsg = null;

      let activeRoutinesList = routines;
      if (Array.isArray(dbRoutines)) {
        if (dbRoutines.length > 0) {
          activeRoutinesList = dbRoutines;
          setRoutines(dbRoutines);
          storage.saveRoutines(dbRoutines);
        } else if (routines.length > 0) {
          saveRoutinesToDB(routines);
        }
      }

      if (dbTasks && dbTasks.error) {
        errorMsg = dbTasks.error;
      } else if (Array.isArray(dbTasks)) {
        const populatedTasks = evaluateRoutineAutoPopulate(dbTasks, activeRoutinesList);
        setTasks(populatedTasks);
        storage.saveTasks(populatedTasks);
      }

      if (dbNotes && dbNotes.error) {
        if (!errorMsg) errorMsg = dbNotes.error;
      } else if (Array.isArray(dbNotes)) {
        setNotes(dbNotes);
        storage.saveNotes(dbNotes);
      }

      if (Array.isArray(dbProfiles)) {
        if (dbProfiles.length > 0) {
          // Ensure Aditya / primary profile retains Admin role
          let cleanDBProfiles = dbProfiles.map(p =>
            (p.id === 'p-aditya' || p.name.toLowerCase().includes('aditya')) ? { ...p, role: 'Admin' } : p
          );
          if (!cleanDBProfiles.some(p => p.role === 'Admin') && cleanDBProfiles[0]) {
            cleanDBProfiles[0].role = 'Admin';
          }
          setProfiles(cleanDBProfiles);
          storage.saveProfiles(cleanDBProfiles);

          const currentActive = storage.getActiveProfile();
          const match = cleanDBProfiles.find(p => p.id === currentActive?.id);
          if (match) {
            setActiveProfile(prev => (
              prev && prev.id === match.id ? { ...match, isLocked: prev.isLocked } : match
            ));
          } else if (cleanDBProfiles[0]) {
            setActiveProfile(cleanDBProfiles[0]);
            storage.setActiveProfile(cleanDBProfiles[0].id);
          }
        } else if (profiles.length > 0) {
          // Push initial profiles to database
          saveProfilesToDB(profiles);
        }
      }

      if (errorMsg) {
        setSyncError(errorMsg);
      } else {
        const now = new Date();
        setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        // Check first-time visitor onboarding tutorial
        const hasSeenTutorial = localStorage.getItem('taskpulse_has_seen_tutorial');
        if (!hasSeenTutorial) {
          setShowTutorialModal(true);
        }
      }
    } catch (e) {
      console.warn('DB Sync failed:', e.message);
      setSyncError(e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load initial local data & setup real-time background sync polling + tab focus listener
  useEffect(() => {
    const initialLocalTasks = storage.getTasks();
    const initialLocalNotes = storage.getNotes();
    const initialRoutines = storage.getRoutines();
    const initialProfiles = storage.getProfiles();
    const initialActiveProfile = storage.getActiveProfile();
    const initialReminders = storage.getReminders();
    const initialNotifSettings = storage.getNotificationSettings();

    // Enforce Admin role persistence for Aditya profile
    let sanitizedProfiles = initialProfiles.length > 0 ? initialProfiles : storage.getProfiles();
    sanitizedProfiles = sanitizedProfiles.map(p =>
      (p.id === 'p-aditya' || p.name.toLowerCase().includes('aditya')) ? { ...p, role: 'Admin' } : p
    );
    if (!sanitizedProfiles.some(p => p.role === 'Admin') && sanitizedProfiles[0]) {
      sanitizedProfiles[0].role = 'Admin';
    }

    setProfiles(sanitizedProfiles);
    storage.saveProfiles(sanitizedProfiles);

    const activeP = sanitizedProfiles.find(p => p.id === initialActiveProfile?.id) || sanitizedProfiles[0];
    setActiveProfile(activeP);
    storage.setActiveProfile(activeP.id);

    // Auto-lock workspace on initial application startup if active profile has privacy lock enabled
    if (activeP && (activeP.isLocked || activeP.pin)) {
      setLockTargetProfile(activeP);
      setShowLockModal(true);
      setIsProfileUnlocked(false);
    } else {
      setIsProfileUnlocked(true);
    }

    // Initial DB sync & push initial profiles if DB is empty
    if (initialProfiles.length > 0) {
      saveProfilesToDB(initialProfiles);
    }

    // 2. Immediate fetch from remote DB
    syncDataFromDB();

    // 3. Periodic background polling every 8 seconds for multi-device live sync
    const pollInterval = setInterval(() => {
      syncDataFromDB();
    }, 8000);

    // 4. Instant re-fetch when mobile browser tab becomes visible or focused
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncDataFromDB();
      }
    };
    const handleFocus = () => syncDataFromDB();
    const handleOnline = () => syncDataFromDB();

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Save tasks on change & update local storage & routine logs
  const handleSetTasks = (newTasks) => {
    // Check if any routine task changed completion status
    newTasks.forEach(task => {
      if (task.routineId) {
        const oldTask = tasks.find(t => t.id === task.id);
        if (oldTask && oldTask.completed !== task.completed) {
          updateRoutineCompletionLog(task.routineId, task.completed, task.routineDate || task.dueDate);
        }
      }
    });

    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  // Save notes on change & update local storage
  const handleSetNotes = (newNotes) => {
    setNotes(newNotes);
    storage.saveNotes(newNotes);
  };

  // Save routines on change & update local storage + database
  const handleSetRoutines = (newRoutines) => {
    setRoutines(newRoutines);
    storage.saveRoutines(newRoutines);
    saveRoutinesToDB(newRoutines);
  };


  // Profile management handlers
  const handleSelectProfile = (targetProfile) => {
    setShowProfileModal(false);
    if (targetProfile.isLocked) {
      setLockTargetProfile(targetProfile);
      setIsProfileUnlocked(false);
      setShowLockModal(true);
    } else {
      setActiveProfile(targetProfile);
      storage.setActiveProfile(targetProfile.id);
      setIsProfileUnlocked(true);
    }
  };

  const handleSaveProfiles = (updatedProfiles) => {
    setProfiles(updatedProfiles);
    storage.saveProfiles(updatedProfiles);
    saveProfilesToDB(updatedProfiles);
  };

  // Notification & Reminders handlers
  const handleSaveReminders = (updatedReminders) => {
    setReminders(updatedReminders);
    storage.saveReminders(updatedReminders);
  };

  const handleSaveSettings = (updatedSettings) => {
    setNotificationSettings(updatedSettings);
    storage.saveNotificationSettings(updatedSettings);
  };

  // Save tags on change
  useEffect(() => {
    if (tags.length > 0) storage.saveTags(tags);
  }, [tags]);

  // Filter tasks, notes, routines & reminders scoped by active profile (with fallback for legacy items to Aditya profile)
  const isPrimaryOrAditya = !activeProfile ||
    activeProfile?.name?.toLowerCase().includes('aditya') ||
    activeProfile?.id === 'p-aditya' ||
    activeProfile?.id === 'p-1' ||
    profiles[0]?.id === activeProfile?.id;

  const profileTasks = tasks.filter(t =>
    t.profileId === activeProfile?.id ||
    (isPrimaryOrAditya && (!t.profileId || t.profileId === 'p-1' || t.profileId === 'p-aditya'))
  );

  const profileNotes = notes.filter(n =>
    n.profileId === activeProfile?.id ||
    (isPrimaryOrAditya && (!n.profileId || n.profileId === 'p-1' || n.profileId === 'p-aditya'))
  );

  const profileRoutines = routines.filter(r =>
    r.profileId === activeProfile?.id ||
    (isPrimaryOrAditya && (!r.profileId || r.profileId === 'p-1' || r.profileId === 'p-aditya'))
  );

  const profileReminders = reminders.filter(r =>
    r.profileId === activeProfile?.id ||
    (isPrimaryOrAditya && (!r.profileId || r.profileId === 'p-1' || r.profileId === 'p-aditya'))
  );

  // Tasks counts for sidebar
  const tasksCount = {
    myDay: profileTasks.filter(t => t.myDay && !t.completed).length,
    important: profileTasks.filter(t => t.starred && !t.completed).length,
    planned: profileTasks.filter(t => t.dueDate && !t.completed).length,
    active: profileTasks.filter(t => !t.completed).length,
    completed: profileTasks.filter(t => t.completed).length,
  };

  const handleOpenShareModal = (itemToShare = null) => {
    setShareItem(itemToShare);
    setShowShareModal(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        tags={tags}
        setTags={setTags}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        tasksCount={tasksCount}
        notesCount={profileNotes.length}
        onOpenShareModal={() => handleOpenShareModal(null)}
        onOpenTokensModal={() => setShowTokensModal(true)}
        onOpenLogsModal={() => setShowLogsModal(true)}
        onOpenGuideModal={() => setShowGuideModal(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        activeProfile={activeProfile}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenNotificationModal={() => setShowNotificationModal(true)}
        remindersCount={profileReminders.filter(r => r.status === 'active').length}
        onOpenAdminModal={() => setShowAdminModal(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            {activeView === 'tasks' ? (
              <div className="flex items-center gap-2">
                {currentFilter === 'my-day' && <Sun className="w-5 h-5 text-amber-400" />}
                {currentFilter === 'important' && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                {currentFilter === 'planned' && <Calendar className="w-5 h-5 text-indigo-400" />}
                {currentFilter === 'all-tasks' && <ListTodo className="w-5 h-5 text-blue-400" />}
                {currentFilter === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                <h2 className="text-lg font-bold text-slate-100 capitalize">
                  {activeTag ? `Tag: #${activeTag}` : currentFilter.replace('-', ' ')}
                </h2>
              </div>
            ) : activeView === 'notes' ? (
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-100">
                  {activeTag ? `Notes Tagged #${activeTag}` : 'Keep Note Vault'}
                </h2>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-slate-100">
                  Daily & Recurring Routines
                </h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3 text-xs text-slate-400">
            {/* Quick Profile Switch Header Pill */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-full font-medium text-slate-200 transition cursor-pointer"
              title="Switch Profile"
            >
              <span className="text-xs">{activeProfile?.avatar || '👤'}</span>
              <span className="hidden sm:inline text-xs font-semibold">{activeProfile?.name || 'Personal'}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">({activeProfile?.role || 'Member'})</span>
            </button>

            {/* Interactive Profile Privacy Lock / Unlock Toggle Button */}
            <button
              onClick={() => {
                const newLockState = !activeProfile?.isLocked;
                const updatedProfiles = profiles.map(p =>
                  p.id === activeProfile?.id ? { ...p, isLocked: newLockState } : p
                );
                handleSaveProfiles(updatedProfiles);
                const updatedActive = { ...activeProfile, isLocked: newLockState };
                setActiveProfile(updatedActive);

                if (newLockState) {
                  setLockTargetProfile(updatedActive);
                  setIsProfileUnlocked(false);
                  setShowLockModal(true);
                } else {
                  setIsProfileUnlocked(true);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs border transition cursor-pointer ${
                activeProfile?.isLocked
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={activeProfile?.isLocked ? "Privacy Lock is ENABLED (PIN required to access). Click to unlock & disable lock." : "Privacy Lock is DISABLED (No PIN required). Click to enable lock."}
            >
              {activeProfile?.isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Locked 🔒</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Unlocked 🔓</span>
                </>
              )}
            </button>

            {/* Admin Trigger Button (Positioned immediately to the right of Profile, ONLY visible to RBAC Admin role) */}
            {activeProfile?.role === 'Admin' && (
              <button
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/10 border border-amber-500/40 hover:border-amber-400 rounded-full font-semibold text-amber-300 transition cursor-pointer shadow-md shadow-amber-500/10 animate-pulse"
                title="Open Admin Control Panel & System Metrics"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold">Admin</span>
              </button>
            )}

            <button
              onClick={() => syncDataFromDB(true)}
              disabled={isSyncing}
              title={syncError ? `Sync Error: ${syncError}. Click to retry.` : "Click to sync entries live with database"}
              className={`flex items-center gap-1.5 px-2.5 py-1 ${syncError ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-300'} border hover:border-slate-700 rounded-full font-medium transition cursor-pointer active:scale-95 disabled:opacity-50`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncError ? 'text-rose-400' : 'text-indigo-400'} ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : syncError ? `Error: ${syncError}` : lastSyncedTime ? `Synced ${lastSyncedTime}` : 'Sync DB'}
              </span>
            </button>
          </div>
        </header>

        {/* View Content Body */}
        <div className="p-6 flex-1 overflow-hidden overflow-y-auto flex flex-col">
          {!isProfileUnlocked && activeProfile?.isLocked ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-950/90 backdrop-blur-xl min-h-[60vh] animate-fade-in my-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-2xl animate-pulse mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">Profile Privacy Protected</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Workspace contents for <strong className="text-slate-200">{activeProfile?.name}</strong> are encrypted & locked. Enter Security PIN or Master Admin password to view.
                </p>
              </div>
              <button
                onClick={() => {
                  setLockTargetProfile(activeProfile);
                  setShowLockModal(true);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition cursor-pointer mx-auto"
              >
                <Unlock className="w-4 h-4" /> Enter Security PIN
              </button>
            </div>
          ) : activeView === 'tasks' ? (
            <TaskManager
              tasks={profileTasks}
              setTasks={handleSetTasks}
              tags={tags}
              currentFilter={currentFilter}
              activeTag={activeTag}
              reminders={profileReminders}
              routines={profileRoutines}
              onOpenNotificationModal={() => setShowNotificationModal(true)}
              activeProfile={activeProfile}
            />
          ) : activeView === 'notes' ? (
            <NoteCanvas
              notes={profileNotes}
              setNotes={(updatedProfileNotes) => {
                const currentId = activeProfile?.id || 'p-aditya';
                const otherNotes = notes.filter(n => n.profileId && n.profileId !== currentId);
                handleSetNotes([...updatedProfileNotes, ...otherNotes]);
              }}
              tags={tags}
              activeTag={activeTag}
              onShareNote={(note) => handleOpenShareModal({ title: note.title, content: note.content, media: note.media })}
              activeProfile={activeProfile}
            />
          ) : activeView === 'routine' ? (
            <RoutineManager
              routines={profileRoutines}
              setRoutines={(updatedProfileRoutines) => {
                const currentId = activeProfile?.id || 'p-aditya';
                const otherRoutines = routines.filter(r => r.profileId && r.profileId !== currentId);
                handleSetRoutines([...updatedProfileRoutines, ...otherRoutines]);
              }}
              tags={tags}
              activeProfile={activeProfile}
            />
          ) : (
            <AdminPanelModal
              isEmbedded={true}
              isOpen={true}
              onClose={() => setActiveView('tasks')}
              profiles={profiles}
              activeProfile={activeProfile}
              onSaveProfiles={handleSaveProfiles}
              tasks={tasks}
              notes={notes}
              routines={routines}
              reminders={reminders}
              onOpenLogsModal={() => setShowLogsModal(true)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {showShareModal && (
        <ShareRedirectModal
          initialItem={shareItem}
          onClose={() => { setShowShareModal(false); setShareItem(null); }}
        />
      )}

      {showTokensModal && (
        <TokenUsageModal onClose={() => setShowTokensModal(false)} />
      )}

      {showLogsModal && (
        <LogViewerModal onClose={() => setShowLogsModal(false)} />
      )}

      {showGuideModal && (
        <UserGuideModal onClose={() => setShowGuideModal(false)} />
      )}

      {showProfileModal && (
        <ProfileManagerModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profiles={profiles}
          activeProfile={activeProfile}
          onSelectProfile={handleSelectProfile}
          onSaveProfiles={handleSaveProfiles}
        />
      )}

      {showNotificationModal && (
        <NotificationManagerModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          tasks={profileTasks}
          tags={tags}
          activeProfile={activeProfile}
          reminders={reminders}
          onSaveReminders={handleSaveReminders}
          notificationSettings={notificationSettings}
          onSaveSettings={handleSaveSettings}
        />
      )}

      {showAdminModal && (
        <AdminPanelModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          profiles={profiles}
          activeProfile={activeProfile}
          onSaveProfiles={handleSaveProfiles}
          tasks={tasks}
          notes={notes}
          routines={routines}
          reminders={reminders}
          onOpenLogsModal={() => { setShowAdminModal(false); setShowLogsModal(true); }}
        />
      )}

      {showLockModal && (
        <ProfileLockModal
          isOpen={showLockModal}
          onClose={() => {
            setShowLockModal(false);
          }}
          targetProfile={lockTargetProfile || activeProfile}
          onUnlockSuccess={(unlockedProfile) => {
            setActiveProfile(unlockedProfile);
            storage.setActiveProfile(unlockedProfile.id);
            setIsProfileUnlocked(true);
            setShowLockModal(false);
          }}
          profiles={profiles}
          onSaveProfiles={handleSaveProfiles}
        />
      )}

      {showTutorialModal && (
        <FirstTimeTutorialModal
          isOpen={showTutorialModal}
          onClose={() => {
            setShowTutorialModal(false);
            if (typeof window !== 'undefined') {
              localStorage.setItem('taskpulse_has_seen_tutorial', 'true');
            }
          }}
          onOpenUserGuide={() => setShowGuideModal(true)}
        />
      )}
    </div>
  );
}

