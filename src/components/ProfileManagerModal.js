'use client';

import { useState } from 'react';
import { User, Plus, Check, Trash2, Edit2, Shield, Mail, Palette, X, UserCheck } from 'lucide-react';
import { deleteProfileFromDB } from '@/lib/dbAdapter';

const AVATAR_OPTIONS = ['👤', '💼', '🎓', '🚀', '⚡', '🎨', '🔥', '🛡️', '🌟', '💻'];
const COLOR_OPTIONS = [
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Sky', hex: '#0284c7' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Rose', hex: '#f43f5e' }
];

export default function ProfileManagerModal({
  isOpen,
  onClose,
  profiles,
  activeProfile,
  onSelectProfile,
  onSaveProfiles
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [color, setColor] = useState('#6366f1');
  const [role, setRole] = useState('Member');
  const [isLocked, setIsLocked] = useState(false);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setAvatar('👤');
    setColor('#6366f1');
    setRole('Member');
    setIsLocked(false);
    setEditingProfileId(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProfileId(p.id);
    setName(p.name);
    setEmail(p.email || '');
    setAvatar(p.avatar || '👤');
    setColor(p.color || '#6366f1');
    setRole(p.role || 'Member');
    setIsLocked(p.isLocked || false);
    setIsEditing(true);
  };

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updatedProfiles = [...profiles];
    if (editingProfileId) {
      updatedProfiles = updatedProfiles.map(p =>
        p.id === editingProfileId
          ? { ...p, name: name.trim(), email: email.trim(), avatar, color, role: p.role || role, isLocked }
          : p
      );
    } else {
      const newProfile = {
        id: `p-${Date.now()}`,
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@taskpulse.app`,
        avatar,
        color,
        role: role || 'Member',
        isLocked,
        pin: '1234'
      };
      updatedProfiles.push(newProfile);
      onSelectProfile(newProfile);
    }

    onSaveProfiles(updatedProfiles);
    setIsEditing(false);
  };

  const handleDeleteProfile = (profileId) => {
    if (profiles.length <= 1) {
      alert("At least one profile must remain in the account system.");
      return;
    }

    if (confirm("Are you sure you want to delete this profile? Associated tasks will remain accessible in general storage.")) {
      const updated = profiles.filter(p => p.id !== profileId);
      deleteProfileFromDB(profileId);
      onSaveProfiles(updated);
      if (activeProfile?.id === profileId) {
        onSelectProfile(updated[0]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Multi-User Profile Manager</h2>
              <p className="text-xs text-slate-400">Switch account profiles or create custom user workspaces</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isEditing ? (
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">
                  {editingProfileId ? 'Edit Profile Details' : 'Create New Account Profile'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ← Back to profiles
                </button>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Avatar Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition ${
                        avatar === emoji
                          ? 'bg-indigo-600 border-2 border-indigo-400 shadow-md scale-105'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Profile Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  New profiles are assigned standard <strong>Member</strong> access by default. Admin access can only be granted by an Admin inside the Admin Panel.
                </span>
              </div>



              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="user@taskpulse.app"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Profile Accent Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        color === c.hex ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {color === c.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Lock Toggle */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Profile Privacy Lock</span>
                    <span className="text-[10px] text-slate-400 block">Require PIN on startup to open profile</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocked(!isLocked)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    isLocked ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {isLocked ? 'Locked 🔒' : 'Unlocked 🔓'}
                </button>
              </div>

              {/* Save Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                >
                  {editingProfileId ? 'Save Profile Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Active Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md"
                    style={{ backgroundColor: `${activeProfile?.color || '#6366f1'}20`, border: `1px solid ${activeProfile?.color || '#6366f1'}40` }}
                  >
                    {activeProfile?.avatar || '👤'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{activeProfile?.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                        ACTIVE PROFILE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{activeProfile?.email || 'No email attached'}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(activeProfile)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Edit Active Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profiles List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    All User Profiles ({profiles.length})
                  </span>
                  <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Profile
                  </button>
                </div>

                <div className="space-y-2">
                  {profiles.map(p => {
                    const isActive = p.id === activeProfile?.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => { onSelectProfile(p); }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                            style={{ backgroundColor: `${p.color || '#6366f1'}20` }}
                          >
                            {p.avatar || '👤'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">{p.name}</span>
                              {p.role && (
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase"
                                  style={{ backgroundColor: `${p.color}15`, color: p.color }}
                                >
                                  {p.role}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{p.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          {isActive ? (
                            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                              <Check className="w-3.5 h-3.5" /> Selected
                            </span>
                          ) : (
                            <button
                              onClick={() => onSelectProfile(p)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold transition"
                            >
                              Switch Profile
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {profiles.length > 1 && (
                            <button
                              onClick={() => handleDeleteProfile(p.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
