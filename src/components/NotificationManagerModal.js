'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Volume2, Shield, Calendar, Clock, Plus, Trash2, CheckCircle2, AlertCircle, X, Send, Sparkles, Smartphone } from 'lucide-react';

export default function NotificationManagerModal({
  isOpen,
  onClose,
  tasks,
  tags,
  activeProfile,
  reminders,
  onSaveReminders,
  notificationSettings,
  onSaveSettings
}) {
  const [activeTab, setActiveTab] = useState('reminders'); // 'reminders' | 'settings' | 'dispatch'
  const [permissionStatus, setPermissionStatus] = useState('default');

  // New Reminder Form State
  const [isCreating, setIsCreating] = useState(false);
  const [reminderType, setReminderType] = useState('task'); // 'task' | 'group'
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [reminderDate, setReminderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderMessage, setReminderMessage] = useState('');

  // Notification Settings Form State
  const [webPushEnabled, setWebPushEnabled] = useState(notificationSettings?.webPushEnabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState(notificationSettings?.emailEnabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState(notificationSettings?.soundEnabled ?? true);
  const [webhookUrl, setWebhookUrl] = useState(notificationSettings?.webhookUrl || '');
  const [emailRecipient, setEmailRecipient] = useState(notificationSettings?.emailRecipient || activeProfile?.email || '');

  // SMTP Dispatcher State
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [sendingSmtp, setSendingSmtp] = useState(false);

  const handleTestSmtpEmail = async () => {
    setSendingSmtp(true);
    setSmtpStatus(null);
    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailRecipient || activeProfile?.email || '',
          subject: 'TaskPulse SMTP Connection Test ⏰',
          htmlText: `Hello ${activeProfile?.name || 'User'}, your TaskPulse SMTP email server integration is active and operating properly.`,
          tasksSummary: tasks.filter(t => !t.completed).slice(0, 3)
        })
      });
      const data = await res.json();
      if (data.success) {
        setSmtpStatus({ type: 'success', text: `✅ SMTP Email Sent Successfully! Message ID: ${data.messageId || 'OK'}` });
      } else {
        setSmtpStatus({ type: 'error', text: `⚠️ ${data.error || 'SMTP Dispatch failed'}` });
      }
    } catch (e) {
      setSmtpStatus({ type: 'error', text: `⚠️ Dispatch Error: ${e.message}` });
    } finally {
      setSendingSmtp(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeProfile?.email && !notificationSettings?.emailRecipient) {
      setEmailRecipient(activeProfile.email);
    }
  }, [activeProfile, notificationSettings]);

  if (!isOpen) return null;

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setPermissionStatus(res);
      if (res === 'granted') {
        new Notification("TaskPulse Notifications Activated! 🚀", {
          body: "Automated task & group reminders are now enabled for this browser.",
          icon: "/favicon.ico"
        });
      }
    } else {
      alert("Browser Web Notifications are not supported in this environment.");
    }
  };

  const handleTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`TaskPulse Alert for ${activeProfile?.name || 'User'} ⏰`, {
        body: "Test notification trigger executed successfully!",
        icon: "/favicon.ico"
      });
    } else {
      alert(`[TaskPulse Alert] Demo Notification for ${activeProfile?.name || 'User'}: Scheduled reminders are active!`);
    }

    if (soundEnabled) {
      playChime();
    }
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio playback fallback:', e);
    }
  };

  const handleCreateReminder = (e) => {
    e.preventDefault();

    let targetTitle = '';
    let targetTasksCount = 1;

    if (reminderType === 'task') {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (!task) {
        alert("Please select a task to remind.");
        return;
      }
      targetTitle = task.title;
    } else {
      if (!selectedTag) {
        alert("Please select a group/tag for bulk reminder.");
        return;
      }
      const taggedTasks = tasks.filter(t => t.tags && t.tags.includes(selectedTag));
      targetTasksCount = taggedTasks.length;
      targetTitle = `Group Reminder: ${selectedTag} (${targetTasksCount} tasks)`;
    }

    const newReminder = {
      id: `rem-${Date.now()}`,
      profileId: activeProfile?.id || 'p-1',
      type: reminderType,
      targetId: reminderType === 'task' ? selectedTaskId : selectedTag,
      title: targetTitle,
      date: reminderDate,
      time: reminderTime,
      message: reminderMessage.trim() || `Scheduled reminder for ${targetTitle}`,
      status: 'active', // 'active' | 'sent' | 'dismissed'
      createdAt: new Date().toISOString()
    };

    onSaveReminders([newReminder, ...reminders]);
    setIsCreating(false);
    setReminderMessage('');
  };

  const handleDeleteReminder = (id) => {
    onSaveReminders(reminders.filter(r => r.id !== id));
  };

  const handleToggleReminderStatus = (id) => {
    onSaveReminders(
      reminders.map(r =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'dismissed' : 'active' } : r
      )
    );
  };

  const handleSaveSettings = () => {
    onSaveSettings({
      webPushEnabled,
      emailEnabled,
      soundEnabled,
      webhookUrl: webhookUrl.trim(),
      emailRecipient: emailRecipient.trim()
    });
    alert("Notification preferences saved!");
  };

  const activeReminders = reminders.filter(r => r.profileId === activeProfile?.id || !r.profileId);

  // Email & Mobile Dispatch Helpers
  const generateEmailBody = () => {
    const activeTasks = tasks.filter(t => !t.completed);
    const text = activeTasks.map((t, idx) => `${idx + 1}. ${t.title} ${t.dueDate ? `(Due: ${t.dueDate})` : ''}`).join('\n');
    return encodeURIComponent(`TaskPulse Automated Reminder Summary:\n\nHello ${activeProfile?.name || 'User'},\n\nHere are your active task reminders:\n\n${text}\n\nGenerated via TaskPulse.`);
  };

  const openMailto = () => {
    const body = generateEmailBody();
    const subject = encodeURIComponent(`TaskPulse Reminder Digest - ${new Date().toLocaleDateString()}`);
    window.open(`mailto:${emailRecipient}?subject=${subject}&body=${body}`, '_blank');
  };

  const openSMS = () => {
    const activeTasks = tasks.filter(t => !t.completed).slice(0, 5);
    const body = encodeURIComponent(`TaskPulse Reminders for ${activeProfile?.name}:\n` + activeTasks.map(t => `• ${t.title}`).join('\n'));
    window.open(`sms:?body=${body}`, '_blank');
  };

  const openWhatsApp = () => {
    const activeTasks = tasks.filter(t => !t.completed).slice(0, 5);
    const body = encodeURIComponent(`*TaskPulse Reminders for ${activeProfile?.name}:*\n` + activeTasks.map(t => `• ${t.title}`).join('\n'));
    window.open(`https://wa.me/?text=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Automated Notification & Reminder Center</h2>
              <p className="text-xs text-slate-400">Manage date reminders, push web alerts, and mobile email notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'reminders'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Scheduled Reminders ({activeReminders.length})
          </button>
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'dispatch'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Email & Mobile Dispatch
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Push & Alerts Config
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: SCHEDULED REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {isCreating ? (
                <form onSubmit={handleCreateReminder} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Set New Date Reminder</h3>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Reminder Type Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReminderType('task')}
                      className={`p-2 rounded-lg text-xs font-semibold border transition ${
                        reminderType === 'task'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Single Task Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => setReminderType('group')}
                      className={`p-2 rounded-lg text-xs font-semibold border transition ${
                        reminderType === 'group'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Group / Tag Reminder
                    </button>
                  </div>

                  {/* Target Selector */}
                  {reminderType === 'task' ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Select Task</label>
                      <select
                        value={selectedTaskId}
                        onChange={e => setSelectedTaskId(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Choose a task --</option>
                        {tasks.filter(t => !t.completed).map(t => (
                          <option key={t.id} value={t.id}>
                            {t.title} {t.dueDate ? `(Due: ${t.dueDate})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Select Group / Tag</label>
                      <select
                        value={selectedTag}
                        onChange={e => setSelectedTag(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Choose a tag group --</option>
                        {tags.map(tag => (
                          <option key={tag.id} value={tag.name}>
                            Tag: {tag.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Reminder Date</label>
                      <input
                        type="date"
                        required
                        value={reminderDate}
                        onChange={e => setReminderDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Reminder Time</label>
                      <input
                        type="time"
                        required
                        value={reminderTime}
                        onChange={e => setReminderTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Message Notes */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Custom Note / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Remember to complete high priority sprint tasks!"
                      value={reminderMessage}
                      onChange={e => setReminderMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                    >
                      Schedule Reminder
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Active Profile: <strong className="text-indigo-400">{activeProfile?.name}</strong>
                  </span>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Set Date Reminder
                  </button>
                </div>
              )}

              {/* Reminders List */}
              {activeReminders.length === 0 ? (
                <div className="py-10 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-400">No scheduled reminders set for this profile.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Click "Set Date Reminder" above to configure automated alerts.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeReminders.map(rem => (
                    <div
                      key={rem.id}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                        rem.status === 'dismissed'
                          ? 'bg-slate-950/40 border-slate-800 opacity-60'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{rem.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            rem.status === 'active'
                              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {rem.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{rem.message}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-400" /> {rem.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400" /> {rem.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleReminderStatus(rem.id)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
                        >
                          {rem.status === 'active' ? 'Dismiss' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL & MOBILE DISPATCH */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              {/* Direct SMTP Dispatcher */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100">SMTP Email Notification Server (Nodemailer)</h3>
                      <span className="text-[10px] text-indigo-400 font-mono">Backend Server Transport</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    SMTP Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dispatches automated email notifications directly to <strong className="text-slate-100">{emailRecipient || activeProfile?.email || 'your email'}</strong> via your configured SMTP host credentials in <code className="text-indigo-300 font-mono text-[11px]">.env</code>.
                </p>

                {smtpStatus && (
                  <div className={`p-2.5 rounded-xl text-xs font-mono border ${
                    smtpStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    {smtpStatus.text}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestSmtpEmail}
                    disabled={sendingSmtp}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingSmtp ? 'animate-spin' : ''}`} />
                    {sendingSmtp ? 'Dispatching SMTP Email...' : 'Send Test SMTP Email Notification'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-200">Client Email Mailto Fallback</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Instantly open an automated email digest containing all current active tasks and scheduled reminders sent to <strong className="text-slate-200">{emailRecipient || activeProfile?.email || 'your email'}</strong>.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={openMailto}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-400" /> Open Mailto Client Digest
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200">Automated Mobile Messaging Shortcuts (SMS & WhatsApp)</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Send task reminders directly to mobile phone numbers or WhatsApp groups using free native deep-links.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={openSMS}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Dispatch SMS Mobile Alert
                  </button>
                  <button
                    onClick={openWhatsApp}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch WhatsApp Message
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUSH & ALERTS CONFIG */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Permission Banner */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">Web Push Permission Status</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Browser Status: <strong className="text-indigo-300 uppercase">{permissionStatus}</strong>
                  </p>
                </div>
                {permissionStatus !== 'granted' ? (
                  <button
                    onClick={requestPushPermission}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    Enable Browser Push
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                  </span>
                )}
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Alert Preferences</h3>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Web & Mobile Browser Push</span>
                    <p className="text-[11px] text-slate-400">Receive desktop/mobile push popups for scheduled reminders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={webPushEnabled}
                    onChange={e => setWebPushEnabled(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Audio Chime Effects</span>
                    <p className="text-[11px] text-slate-400">Play pleasant sound alert when notification triggers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={e => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>

                <div className="border-t border-slate-800/80 pt-3 space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">Email Recipient Address</label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={e => setEmailRecipient(e.target.value)}
                    placeholder="user@taskpulse.app"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="border-t border-slate-800/80 pt-3 space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">Open-Source Webhook URL (Optional)</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://your-webhook-endpoint.com/api/notify"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">Free endpoint integrations for Slack, Discord, or custom server alerts.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Test Sound & Push Trigger
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
