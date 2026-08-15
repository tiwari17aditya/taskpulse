'use client';

import { useEffect, useState } from 'react';
import { Terminal, RefreshCw, X, Calendar } from 'lucide-react';

export default function LogViewerModal({ onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [logContent, setLogContent] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLog = (date) => {
    setLoading(true);
    fetch(`/api/logs?date=${date || selectedDate}`)
      .then(res => res.json())
      .then(data => setLogContent(data.content || ''))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLog(selectedDate);
  }, [selectedDate]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl space-y-4 animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Daily Log Manager (logs/log_{selectedDate}.log)</h3>
              <p className="text-[11px] text-slate-400">Automated system runtime logging per day</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-slate-200 outline-none"
              />
            </div>
            <button onClick={() => fetchLog(selectedDate)} className="p-1.5 text-slate-400 hover:text-slate-200">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Console Log Output Display */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {loading ? 'Reading log file...' : logContent}
        </div>
      </div>
    </div>
  );
}
