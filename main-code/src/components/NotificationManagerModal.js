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

  // Dispatch Center Navigation (Email vs SMS)
  const [dispatchSubTab, setDispatchSubTab] = useState('email'); // 'email' | 'sms'

  // SMS Gateway State (Scaffold)
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('+1 (555) 019-2834');
  const [smsGatewayProvider, setSmsGatewayProvider] = useState('twilio');
  const [smsStatus, setSmsStatus] = useState(null);
  const [sendingSms, setSendingSms] = useState(false);

  // SMTP Dispatcher State
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [sendingSmtp, setSendingSmtp] = useState(false);
  const [digestStatus, setDigestStatus] = useState(null);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [dueDateStatus, setDueDateStatus] = useState(null);
  const [sendingDueDate, setSendingDueDate] = useState(false);
  const [showMailPreview, setShowMailPreview] = useState(false);
  const [smtpConfigInfo, setSmtpConfigInfo] = useState(null);

  // Check SMTP configuration status from backend on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/notifications/email')
        .then(res => res.json())
        .then(data => {
          setSmtpConfigInfo(data);
        })
        .catch(err => {
          console.error('Failed to fetch SMTP status:', err);
        });
    }
  }, [isOpen]);

  const handleTestSmtpEmail = async () => {
    if (!emailRecipient || !emailRecipient.trim() || !emailRecipient.includes('@')) {
      alert("Please provide a valid recipient address to continue");
      return;
    }

    setSendingSmtp(true);
    setSmtpStatus(null);
    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailRecipient.trim(),
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

  const handleSend7AmDigest = async () => {
    if (!emailRecipient || !emailRecipient.trim() || !emailRecipient.includes('@')) {
      alert("Please provide a valid recipient address to continue");
      return;
    }

    setSendingDigest(true);
    setDigestStatus(null);
    try {
      const recipient = emailRecipient.trim();
      const myDayTasks = tasks.filter(t => t.myDay && !t.completed);
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject: '☀️ TaskPulse 7:00 AM Morning Digest & Daily Focus',
          htmlText: `Good morning ${activeProfile?.name || 'Aditya'}! Here is your scheduled 7:00 AM Daily Morning Digest for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.`,
          tasksSummary: myDayTasks.length > 0 ? myDayTasks : [{ title: 'No pending My Day tasks scheduled for today. Create new focus tasks in TaskPulse!' }]
        })
      });
      const data = await res.json();
      if (data.success) {
        setDigestStatus({ type: 'success', text: `✅ 7:00 AM Morning Digest Mailed to ${recipient}!` });
      } else {
        setDigestStatus({ type: 'error', text: `⚠️ Digest dispatch failed: ${data.error}` });
      }
    } catch (e) {
      setDigestStatus({ type: 'error', text: `⚠️ Error sending digest: ${e.message}` });
    } finally {
      setSendingDigest(false);
    }
  };

  const handleSendDueDateReminders = async () => {
    if (!emailRecipient || !emailRecipient.trim() || !emailRecipient.includes('@')) {
      alert("Please provide a valid recipient address to continue");
      return;
    }

    setSendingDueDate(true);
    setDueDateStatus(null);
    try {
      const recipient = emailRecipient.trim();
      const todayStr = new Date().toISOString().split('T')[0];
      const dueTasks = tasks.filter(t => !t.completed && (t.dueDate === todayStr || t.dueDate === 'Today' || t.starred));
      
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject: `🎯 TaskPulse Priority & Due-Date Reminder (${dueTasks.length} Action Items)`,
          htmlText: `Hello ${activeProfile?.name || 'Aditya'}, here is your automated reminder for all priority and scheduled tasks due on ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.`,
          tasksSummary: dueTasks.length > 0 ? dueTasks : [{ title: 'No tasks currently marked as due today or starred as high priority.' }]
        })
      });
      const data = await res.json();
      if (data.success) {
        setDueDateStatus({ type: 'success', text: `✅ Due-Date & Priority Reminders (${dueTasks.length} tasks) dispatched to ${recipient}!` });
      } else {
        setDueDateStatus({ type: 'error', text: `⚠️ Reminder dispatch failed: ${data.error}` });
      }
    } catch (e) {
      setDueDateStatus({ type: 'error', text: `⚠️ Error sending reminders: ${e.message}` });
    } finally {
      setSendingDueDate(false);
    }
  };

  const handleSendTestSms = () => {
    if (!smsPhoneNumber || !smsPhoneNumber.trim()) {
      alert("Please enter a valid phone number with country code");
      return;
    }
    setSendingSms(true);
    setSmsStatus(null);
    setTimeout(() => {
      setSendingSms(false);
      setSmsStatus({
        type: 'success',
        text: `📱 SMS Gateway Ready: Simulated dispatch to ${smsPhoneNumber} via ${smsGatewayProvider.toUpperCase()}. (Twilio/Provider credentials will connect in v1.4 Roadmap).`
      });
    }, 600);
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

  const handleSaveSettings = () => {
    const updatedSettings = {
      webPushEnabled,
      emailEnabled,
      soundEnabled,
      webhookUrl: webhookUrl.trim(),
      emailRecipient: emailRecipient.trim()
    };

    if (onSaveSettings) {
      onSaveSettings(updatedSettings);
    }
    alert('✅ Notification settings & recipient email saved to database and active profile!');
  };

  const handleUpdateRecipient = (newEmail) => {
    setEmailRecipient(newEmail);
    if (onSaveSettings) {
      onSaveSettings({
        webPushEnabled,
        emailEnabled,
        soundEnabled,
        webhookUrl,
        emailRecipient: newEmail
      });
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
            <Send className="w-3.5 h-3.5" /> Automated Dispatches
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
                <form onSubmit={handleCreateReminder} className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> New Date Reminder Trigger
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Target Scope */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Associate Target</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="remType"
                          checked={reminderType === 'task'}
                          onChange={() => setReminderType('task')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        Single Task
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="remType"
                          checked={reminderType === 'group'}
                          onChange={() => setReminderType('group')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        Tag Group
                      </label>
                    </div>
                  </div>

                  {reminderType === 'task' ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Select Task</label>
                      <select
                        value={selectedTaskId}
                        onChange={e => setSelectedTaskId(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Choose active task --</option>
                        {tasks.filter(t => !t.completed).map(t => (
                          <option key={t.id} value={t.id}>{t.title} {t.dueDate ? `(Due: ${t.dueDate})` : ''}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Select Tag Group</label>
                      <select
                        value={selectedTag}
                        onChange={e => setSelectedTag(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Choose tag --</option>
                        {tags.map(t => (
                          <option key={t.id} value={t.name}>#{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date & Time Picker */}
                  <div className="grid grid-cols-2 gap-2">
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
                      <label className="block text-xs font-medium text-slate-400 mb-1">Trigger Time</label>
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
                <div className="py-12 text-center bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No scheduled reminders active. Click "Set Date Reminder" above to configure a timeline trigger.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeReminders.map(rem => (
                    <div
                      key={rem.id}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                        rem.status === 'active'
                          ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/40 border-slate-800/50 opacity-60'
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

          {/* TAB 2: AUTOMATED DISPATCHES (EMAIL & SMS SUBTABS) */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              {/* Sub-Tab Navigation Bar */}
              <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDispatchSubTab('email')}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                    dispatchSubTab === 'email'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email Notifications
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchSubTab('sms')}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                    dispatchSubTab === 'sms'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> SMS & Mobile Notifications
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">Preview</span>
                </button>
              </div>

              {/* SUBTAB A: EMAIL NOTIFICATIONS */}
              {dispatchSubTab === 'email' && (
                <div className="space-y-4">
                  {/* Recipient Target Email Configuration Bar */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        Recipient Email Address:
                      </label>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        smtpConfigInfo?.configured
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {smtpConfigInfo?.configured ? `SMTP Active (${smtpConfigInfo.host || 'smtp.gmail.com'})` : 'SMTP Ready'}
                      </span>
                    </div>
                    <input
                      type="email"
                      value={emailRecipient}
                      onChange={e => handleUpdateRecipient(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* 1. Due-Date & Priority Task Reminders Engine */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-950/40 to-slate-900 border border-amber-500/40 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-100">Due-Date & Priority Tasks Reminder</h3>
                          <span className="text-[10px] text-amber-400 font-mono">Automated Target Date Emailing</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Today's Action Items ({tasks.filter(t => !t.completed && (t.dueDate === (new Date().toISOString().split('T')[0]) || t.dueDate === 'Today' || t.starred)).length})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Scans your workspace for tasks scheduled for today or flagged as Priority ⭐, compiling an action checklist and emailing it directly to <strong className="text-slate-100">{emailRecipient || activeProfile?.email || 'your email'}</strong>.
                    </p>

                    {dueDateStatus && (
                      <div className={`p-2.5 rounded-xl text-xs font-mono border ${
                        dueDateStatus.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        {dueDateStatus.text}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSendDueDateReminders}
                        disabled={sendingDueDate}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-indigo-600 to-violet-600 hover:from-amber-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                      >
                        <Send className={`w-3.5 h-3.5 ${sendingDueDate ? 'animate-spin' : ''}`} />
                        {sendingDueDate ? 'Dispatching Due-Date Reminders...' : 'Send Due-Date & Priority Reminders Now'}
                      </button>
                    </div>
                  </div>

                  {/* 2. 7:00 AM Daily Morning Task Digest */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-100">7:00 AM Daily Morning Task Digest</h3>
                          <span className="text-[10px] text-indigo-400 font-mono">Daily Schedule Overview</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        Daily 07:00 AM
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sends your daily "My Day" focus tasks and active routines every morning at 7:00 AM to keep your day structured.
                    </p>

                    {digestStatus && (
                      <div className={`p-2.5 rounded-xl text-xs font-mono border ${
                        digestStatus.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        {digestStatus.text}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSend7AmDigest}
                        disabled={sendingDigest}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                      >
                        <Send className={`w-3.5 h-3.5 ${sendingDigest ? 'animate-spin' : ''}`} />
                        {sendingDigest ? 'Sending 7:00 AM Digest Email...' : 'Send 7:00 AM Morning Digest Email Now'}
                      </button>
                    </div>
                  </div>

                  {/* 3. Test SMTP Dispatch & Template Preview */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Send className="w-3.5 h-3.5 text-indigo-400" /> Test Dispatch & Template Preview
                      </h3>
                    </div>

                    {smtpStatus && (
                      <div className={`p-2.5 rounded-xl text-xs font-mono border ${
                        smtpStatus.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        {smtpStatus.text}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleTestSmtpEmail}
                        disabled={sendingSmtp}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                      >
                        <Send className={`w-3.5 h-3.5 ${sendingSmtp ? 'animate-spin' : ''}`} />
                        {sendingSmtp ? 'Dispatching...' : 'Send Test SMTP Mail'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowMailPreview(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Preview Mail Template
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB B: SMS & MOBILE NOTIFICATIONS (SCAFFOLD) */}
              {dispatchSubTab === 'sms' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-indigo-400" />
                        <div>
                          <h3 className="text-xs font-bold text-slate-100">SMS Gateway Configuration</h3>
                          <span className="text-[10px] text-slate-400">Mobile carrier dispatch routing</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        SMS Scaffold Ready
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone Number (with Country Code):</label>
                        <input
                          type="tel"
                          value={smsPhoneNumber}
                          onChange={e => setSmsPhoneNumber(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">SMS Gateway Provider:</label>
                        <select
                          value={smsGatewayProvider}
                          onChange={e => setSmsGatewayProvider(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                        >
                          <option value="twilio">Twilio Programmable SMS API</option>
                          <option value="textlocal">Textlocal SMS Gateway</option>
                          <option value="fast2sms">Fast2SMS Gateway</option>
                          <option value="generic_webhook">Custom Webhook / Zapier / Make</option>
                        </select>
                      </div>
                    </div>

                    {smsStatus && (
                      <div className="p-2.5 rounded-xl text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {smsStatus.text}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendTestSms}
                        disabled={sendingSms}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        {sendingSms ? 'Testing SMS Gateway...' : 'Send Test SMS Notification'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                    onChange={e => handleUpdateRecipient(e.target.value)}
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

      {/* Requirement 8: Beautiful Mail Template Preview Modal */}
      {showMailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Default Email Template Preview</h3>
                  <span className="text-[10px] text-indigo-400 font-mono">HTML Email Render Output</span>
                </div>
              </div>
              <button
                onClick={() => setShowMailPreview(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-slate-950/90">
              {/* Preview Container */}
              <div className="border border-slate-800 rounded-2xl bg-slate-900 overflow-hidden shadow-xl">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-center text-white">
                  <h1 className="text-xl font-extrabold tracking-wide">⚡ TaskPulse Notification</h1>
                  <p className="text-xs text-indigo-200 mt-1">Automated Workspace Summary & Task Reminders</p>
                </div>

                <div className="p-5 space-y-4 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    Hello <strong className="text-slate-100">{activeProfile?.name || 'User'}</strong>,<br />
                    Here is your scheduled TaskPulse automated digest and task summary for <strong className="text-indigo-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>:
                  </p>

                  {/* Tabular Data Representation */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">📌 Task Details Table</h4>
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                            <th className="p-2.5">Task Title</th>
                            <th className="p-2.5">Due Date</th>
                            <th className="p-2.5">Priority / Tags</th>
                            <th className="p-2.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {tasks.slice(0, 5).map((t, idx) => (
                            <tr key={t.id || idx} className="hover:bg-slate-900/50">
                              <td className="p-2.5 font-semibold text-slate-200">{t.title}</td>
                              <td className="p-2.5 text-indigo-400 font-mono">{t.dueDate || 'Today'}</td>
                              <td className="p-2.5 text-amber-400">
                                {t.tags && t.tags.length > 0 ? t.tags.join(', ') : (t.starred ? 'Starred' : 'Normal')}
                              </td>
                              <td className="p-2.5 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  t.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                                }`}>
                                  {t.completed ? 'COMPLETED' : 'PENDING'}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {tasks.length === 0 && (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-slate-500">No active tasks in workspace.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Proverb & Quote Footer Banner (Requirement 8) */}
                  <div className="p-4 bg-indigo-950/40 border-l-4 border-indigo-500 rounded-r-xl space-y-1 mt-4">
                    <p className="italic text-indigo-200 leading-relaxed text-xs">
                      "The secret of getting ahead is getting started. Focus on being productive instead of busy."
                    </p>
                    <span className="text-[11px] font-bold text-indigo-400 block">— Mark Twain & Tim Ferriss</span>
                  </div>

                  <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
                    Sent to: <strong className="text-slate-300">{emailRecipient || activeProfile?.email || 'user@taskpulse.app'}</strong> • TaskPulse SMTP Service
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end">
              <button
                onClick={() => setShowMailPreview(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
