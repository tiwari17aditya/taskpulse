'use client';

import { useState } from 'react';
import { Sparkles, Plus, ShieldCheck, Lock, BookOpen, ChevronRight, ChevronLeft, CheckCircle2, X } from 'lucide-react';

export default function FirstTimeTutorialModal({ isOpen, onClose, onOpenUserGuide }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to TaskPulse Workspace! 🚀",
      subtitle: "Your unified productivity engine for Tasks, Keep Notes, and Routines.",
      badge: "STEP 1 OF 4",
      icon: Sparkles,
      iconBg: "from-indigo-600 to-purple-600",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            TaskPulse combines Microsoft To-Do task management, Google Keep visual notes, Apple Reminders, and Daily Recurring Routines into one sleek, high-performance workspace.
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-400" /> Exclusive Floating + Task Button
            </span>
            <p className="text-[11px] text-slate-400">
              Tasks are created exclusively via the prominent <strong>+ Floating Button</strong> at the bottom-right corner of your screen. Click it anytime to add tasks with due dates, tags, and notes.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Workspace Views & Calendar Mode 📅",
      subtitle: "Switch between Tasks, Keep Notes, and Daily Routines seamlessly.",
      badge: "STEP 2 OF 4",
      icon: Plus,
      iconBg: "from-purple-600 to-pink-600",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="font-bold text-indigo-400 block">Tasks</span>
              <span className="text-[10px] text-slate-400">My Day & History</span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="font-bold text-indigo-400 block">Notes</span>
              <span className="text-[10px] text-slate-400">Google Keep Grid</span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="font-bold text-indigo-400 block">Routine</span>
              <span className="text-[10px] text-slate-400">Daily Auto Population</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Click <strong>Calendar View</strong> under Tasks filter to expand an interactive full-month calendar grid for date planning!
          </p>
        </div>
      )
    },
    {
      title: "Profile Privacy & Shared LDAP Security 🔒",
      subtitle: "Isolate your data, lock profiles with PIN, and grant Admin privileges.",
      badge: "STEP 3 OF 4",
      icon: Lock,
      iconBg: "from-amber-600 to-orange-600",
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> LDAP-Style Master Admin Security
            </span>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Profiles with <strong>Admin</strong> privileges share a global Master Admin Password across all Admin members. Standard profiles can set individual PINs to lock their workspace for privacy.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Admins can add new members and promote users inside the <strong>Admin Control Panel</strong> (accessible via the top header Admin button for Admins).
          </p>
        </div>
      )
    },
    {
      title: "Where to Find the User Manual 📖",
      subtitle: "Access complete documentation, guides, and database settings anytime.",
      badge: "STEP 4 OF 4",
      icon: BookOpen,
      iconBg: "from-emerald-600 to-teal-600",
      content: (
        <div className="space-y-3">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-emerald-300">Looking for the User Guide?</h4>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              Click the <strong>User Guide</strong> button (<BookOpen className="w-3.5 h-3.5 inline text-emerald-400" /> icon) located in the <strong>top header bar</strong> or sidebar at any time to open full documentation!
            </p>
            <button
              type="button"
              onClick={() => { onClose(); onOpenUserGuide(); }}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
            >
              Open Full User Guide Now
            </button>
          </div>
        </div>
      )
    }
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden space-y-4 p-6 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${current.iconBg} text-white shadow-lg`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 uppercase">
                {current.badge}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">{current.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-2 space-y-3 min-h-[140px]">
          <p className="text-xs font-medium text-slate-400">{current.subtitle}</p>
          {current.content}
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-5 bg-indigo-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-lg transition cursor-pointer"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Got It, Start Working!
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
