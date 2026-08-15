'use client';

import { useState } from 'react';
import { Lock, Unlock, Key, ShieldCheck, AlertCircle, Check, X, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { storage } from '@/lib/storage';

export default function ProfileLockModal({
  isOpen,
  onClose,
  targetProfile,
  onUnlockSuccess,
  profiles,
  onSaveProfiles,
  isAdminOverride = false
}) {
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [viewMode, setViewMode] = useState('unlock'); // 'unlock' | 'change' | 'reset'

  if (!isOpen || !targetProfile) return null;

  const isAdmin = targetProfile.role === 'Admin';
  const expectedPin = isAdmin
    ? storage.getAdminMasterPin()
    : (targetProfile.pin || '1234');

  // Verify PIN Unlock
  const handleVerifyUnlock = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (pinInput.trim() === expectedPin) {
      onUnlockSuccess(targetProfile);
      setPinInput('');
      onClose();
    } else {
      setErrorMsg(
        isAdmin
          ? 'Incorrect Admin Master Password. (Shared by all Admin role profiles).'
          : 'Incorrect Profile PIN/Password. Default is 1234.'
      );
    }
  };

  // Change PIN (If Admin, updates shared Master Admin PIN for test1, test2, etc.)
  const handleChangePin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isAdminOverride && pinInput.trim() !== expectedPin) {
      return setErrorMsg('Current PIN/Password does not match.');
    }
    if (!newPin.trim()) {
      return setErrorMsg('Please enter a valid new PIN or Password.');
    }
    if (newPin.trim() !== confirmPin.trim()) {
      return setErrorMsg('New PIN and Confirm PIN do not match.');
    }

    if (isAdmin) {
      // LDAP-style: Changing Admin PIN updates master PIN shared by ALL Admin profiles!
      storage.saveAdminMasterPin(newPin.trim());
      setSuccessMsg('Master Admin Password updated successfully! This new password applies to ALL Admin accounts.');
    } else {
      // Individual profile PIN change
      const updatedProfiles = profiles.map(p =>
        p.id === targetProfile.id ? { ...p, pin: newPin.trim(), isLocked: true } : p
      );
      onSaveProfiles(updatedProfiles);
      setSuccessMsg(`Profile Lock PIN updated successfully for ${targetProfile.name}.`);
    }

    setPinInput('');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Reset PIN to Default 1234
  const handleResetPin = () => {
    setErrorMsg('');
    if (isAdmin) {
      storage.saveAdminMasterPin('1234');
      setSuccessMsg('Master Admin Password reset to default (1234).');
    } else {
      const updatedProfiles = profiles.map(p =>
        p.id === targetProfile.id ? { ...p, pin: '1234', isLocked: false } : p
      );
      onSaveProfiles(updatedProfiles);
      setSuccessMsg(`Profile Lock PIN reset to default (1234) for ${targetProfile.name}.`);
    }
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden space-y-4 p-6 animate-scale-up">
        {/* Header Avatar & Name */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
              style={{ backgroundColor: `${targetProfile.color || '#6366f1'}20`, border: `1px solid ${targetProfile.color || '#6366f1'}40` }}
            >
              {targetProfile.avatar || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-100">{targetProfile.name}</h3>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                  isAdmin ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                }`}>
                  {isAdmin ? 'Admin (Shared LDAP PIN)' : 'Member Profile'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                {viewMode === 'unlock' ? 'Profile Privacy Lock Active' : viewMode === 'change' ? 'Update Profile PIN' : 'Reset Lock PIN'}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW MODE 1: UNLOCK */}
        {viewMode === 'unlock' && (
          <form onSubmit={handleVerifyUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Enter PIN or Password</span>
                <span className="text-[10px] text-slate-500 font-mono">Default: 1234</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter 4-digit PIN..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-100 px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 font-mono tracking-widest"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isAdmin && (
              <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl leading-relaxed">
                🛡️ <strong>Master Admin Security</strong>: Password for Admin is shared across all Admin members (e.g. test1, test2). Updating it from any Admin account applies globally.
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setViewMode('change'); }}
                className="text-xs font-medium text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" /> Change PIN / Password
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setErrorMsg(''); handleResetPin(); }}
                  className="text-xs font-medium text-slate-400 hover:text-rose-400 transition"
                  title="Reset PIN to default 1234"
                >
                  Forgot PIN?
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" /> Unlock Profile
                </button>
              </div>
            </div>
          </form>
        )}

        {/* VIEW MODE 2: CHANGE PIN */}
        {viewMode === 'change' && (
          <form onSubmit={handleChangePin} className="space-y-3.5">
            {!isAdminOverride && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Current PIN / Password</label>
                <input
                  type="password"
                  placeholder="Current PIN..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded-xl outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">New PIN / Password</label>
              <input
                type="password"
                placeholder="New 4-digit PIN..."
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded-xl outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Confirm New PIN / Password</label>
              <input
                type="password"
                placeholder="Confirm new PIN..."
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded-xl outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            {isAdmin && (
              <p className="text-[10px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                ⚠️ Updating this Master Admin PIN will update the lock password for ALL Admin accounts.
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setViewMode('unlock'); }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ← Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition cursor-pointer"
              >
                Update PIN Now
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
