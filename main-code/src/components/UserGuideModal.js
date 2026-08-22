'use client';

import { useState } from 'react';
import { BookOpen, X, ListTodo, StickyNote, Tag, Share2, Database, Sun, Calendar, Star, CheckCircle2, ShieldCheck, ExternalLink, Code, Layers, FileText } from 'lucide-react';

export default function UserGuideModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const guideTabs = [
    { id: 'overview', label: 'Overview & Nav', icon: BookOpen },
    { id: 'todo', label: 'Microsoft To-Do', icon: ListTodo },
    { id: 'keep', label: 'Google Keep Vault', icon: StickyNote },
    { id: 'reminders', label: 'Apple Reminders & Tags', icon: Tag },
    { id: 'share', label: 'Codeshare & Toffeeshare', icon: Share2 },
    { id: 'neondb', label: 'NeonDB & Supabase Sync', icon: Database },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-5 animate-slide-up max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                TaskPulse User Guide & Documentation
              </h3>
              <p className="text-xs text-slate-400">Complete walkthrough of features, workflows, and database integration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2 shrink-0">
          {guideTabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  🚀 Welcome to TaskPulse Workspace
                </h4>
                <p>
                  TaskPulse is an industry-grade personal daily planning & productivity engine that synthesizes the best capabilities of 4 major applications into one unified platform.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4" /> Microsoft To-Do Module
                  </span>
                  <p className="text-[11px] text-slate-400">
                    My Day focus list, subtasks checklists, priority stars, quick due date presets (Today, Tomorrow, Next Week), and completed items history with cut lines.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                    <StickyNote className="w-4 h-4" /> Google Keep Vault
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Visual masonry cards, pin notes to top, custom color palettes, and rich media attachment previews (Images, Audio, Video, Files).
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> Apple Reminders & Tags
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Smart views (My Day, Planned, Important, History/Completed) and custom color-coded multi-tag filtering.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" /> Codeshare & Toffeeshare Hub
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Custom Codeshare.io room passcodes (codeshare.io/your-custom-code) and direct Toffeeshare file redirection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MICROSOFT TO-DO */}
          {activeTab === 'todo' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-400" /> Microsoft To-Do Module Specification
              </h4>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="space-y-1">
                  <span className="font-semibold text-amber-400">1. Adding & Managing Tasks:</span>
                  <p className="text-[11px] text-slate-400">
                    Type your task title in the top quick-add bar. Use the date presets bar below to set quick due dates (**Today**, **Tomorrow**, **Next Week**, or custom calendar date).
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-emerald-400">2. Checked Items & Strikethrough Cut Lines:</span>
                  <p className="text-[11px] text-slate-400">
                    Clicking the completion circle checks off the task, fires an interactive confetti celebration, and moves the item to the collapsible **Completed Items** section with a checked icon ($\checkmark$) and a strikethrough cut line (<span className="line-through text-slate-400">sample completed task</span>).
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-indigo-400">3. Task Detail Drawer:</span>
                  <p className="text-[11px] text-slate-400">
                    Clicking any task opens a right slide-over panel to manage subtasks/steps, add to My Day, toggle star priority, assign tags, or write notes.
                  </p>
                </div>
              </div>

              {/* Visual Mockup Box */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-[11px]">
                <span className="text-xs font-sans font-bold text-slate-300">Live Task Card Visual Demo:</span>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="line-through text-slate-400">Review weekly sprint goals and database sync</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Completed</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE KEEP VAULT */}
          {activeTab === 'keep' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-indigo-400" /> Google Keep Note Vault Specification
              </h4>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <p>
                  Switch to **Keep Vault** using the sidebar view toggle. Create rich text notes with masonry card layout, pin notes to top, and color-code cards.
                </p>

                <div className="space-y-1">
                  <span className="font-semibold text-indigo-300">Media Attachment Capabilities:</span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-2">
                    <td>🖼️ <b>Images</b>: Live image card preview</td>
                    <td>🎵 <b>Audio Clips</b>: Embedded HTML5 audio player</td>
                    <td>🎥 <b>Video Clips</b>: Embedded video playback player</td>
                    <td>📄 <b>Documents</b>: File download link preview</td>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPLE REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" /> Apple Reminders & Tagging System
              </h4>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="space-y-1">
                  <span className="font-semibold text-indigo-300">Smart Filter Navigation:</span>
                  <p className="text-[11px] text-slate-400">
                    Use **My Day** for today's focus, **Important** for starred items, **Planned** for scheduled tasks, and **History / Completed** for all past finished work.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-emerald-400">Custom Tag Colors:</span>
                  <p className="text-[11px] text-slate-400">
                    Add new tags in the sidebar with custom hex colors. Click any tag to instantly filter tasks and notes tagged with `#tag-name`.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OPEN SOURCE UTILITIES & SHARE */}
          {activeTab === 'share' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" /> Open-Source Sharing & Productivity Utilities
              </h4>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="space-y-1">
                  <span className="font-semibold text-emerald-400">1. Codeshare.io Collaborative Editor:</span>
                  <p className="text-[11px] text-slate-400">
                    Enter a room passcode or load recent room history to open real-time shared code editor rooms.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-purple-400">2. Toffeeshare Direct P2P Transfer:</span>
                  <p className="text-[11px] text-slate-400">
                    Unlimited peer-to-peer, zero-cloud encrypted file sharing directly across browser endpoints.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-indigo-400">3. Curated OSS Productivity Suite:</span>
                  <p className="text-[11px] text-slate-400">
                    One-click launchpads for <b>Excalidraw</b> (whiteboards), <b>CryptPad</b> (zero-knowledge docs/sheets), <b>CyberChef</b> (data transformation), and <b>Draw.io</b> (architecture diagrams).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NEONDB & SUPABASE SYNC */}
          {activeTab === 'neondb' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" /> NeonDB & Supabase Sync Specification
              </h4>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="space-y-1">
                  <span className="font-semibold text-emerald-400">Automatic Table Creation (Auto-Migrations):</span>
                  <p className="text-[11px] text-slate-400">
                    Server API routes (`/api/db/tasks`, `/api/db/notes`, `/api/db/profiles`, `/api/db/routines`) auto-execute `CREATE TABLE IF NOT EXISTS` with full schema constraints and JSONB column types.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-indigo-400">Profile & Email Synchronization:</span>
                  <p className="text-[11px] text-slate-400">
                    Recipient notification emails are saved directly to the <code className="text-slate-200 font-mono">profiles</code> table, ensuring multi-device persistence across sessions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between shrink-0 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> TaskPulse Documentation Suite v1.3.4-beta
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
