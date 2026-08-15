'use client';

import { useState, useEffect } from 'react';
import { Share2, ExternalLink, X, Clock, Trash2, ArrowRight, Globe, Code2, Star } from 'lucide-react';

const STORAGE_KEY = 'taskpulse_codeshare_visited_urls';

function loadVisitedUrls() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveVisitedUrls(urls) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

export default function ShareRedirectModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('codeshare'); // 'codeshare' | 'toffeeshare'
  const [passcode, setPasscode] = useState('');
  const [visitedUrls, setVisitedUrls] = useState([]);

  useEffect(() => {
    setVisitedUrls(loadVisitedUrls());
  }, []);

  const getCodeshareUrl = (code) => `https://codeshare.io/${code.toLowerCase().trim()}`;

  const openCodeshare = (code) => {
    if (!code.trim()) return;
    const url = getCodeshareUrl(code);
    window.open(url, '_blank', 'noopener,noreferrer');

    // Store in visited history
    const existing = loadVisitedUrls();
    const filtered = existing.filter(u => u.url !== url);
    const updated = [
      { url, label: `codeshare.io/${code.toLowerCase().trim()}`, visitedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 20); // keep max 20 urls
    saveVisitedUrls(updated);
    setVisitedUrls(updated);
    setPasscode('');
  };

  const removeVisited = (url) => {
    const updated = visitedUrls.filter(u => u.url !== url);
    saveVisitedUrls(updated);
    setVisitedUrls(updated);
  };

  const clearAllVisited = () => {
    saveVisitedUrls([]);
    setVisitedUrls([]);
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now - d) / 60000);
      if (diff < 1) return 'just now';
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl animate-slide-up relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Open-Source Sharing Utilities</h3>
              <p className="text-[11px] text-slate-400">Codeshare.io rooms & Toffeeshare file sharing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-4 shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('codeshare')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'codeshare' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Codeshare.io
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('toffeeshare')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'toffeeshare' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Toffeeshare
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* ---- CODESHARE TAB ---- */}
          {activeTab === 'codeshare' && (
            <div className="space-y-5">
              {/* Passcode Input & Open */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Enter Room Passcode
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition gap-2">
                  <span className="text-xs text-slate-500 font-mono shrink-0">codeshare.io/</span>
                  <input
                    id="codeshare-passcode-input"
                    type="text"
                    placeholder="your-room-name"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && openCodeshare(passcode)}
                    autoFocus
                    className="w-full bg-transparent font-mono text-xs text-indigo-300 outline-none placeholder-slate-600"
                  />
                </div>
                {passcode.trim() && (
                  <p className="text-[11px] text-slate-500 font-mono pl-1">
                    → <span className="text-indigo-400">{getCodeshareUrl(passcode)}</span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => openCodeshare(passcode)}
                  disabled={!passcode.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                >
                  Open Codeshare.io Room <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Visited URLs History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" /> URLs Visited
                    {visitedUrls.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 rounded-full text-slate-400 ml-1">{visitedUrls.length}</span>
                    )}
                  </span>
                  {visitedUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllVisited}
                      className="text-[10px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  )}
                </div>

                {visitedUrls.length === 0 ? (
                  <div className="py-6 text-center bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <Clock className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">No rooms visited yet</p>
                    <p className="text-[11px] text-slate-600">Your recently opened rooms will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                    {visitedUrls.map((entry, i) => (
                      <div
                        key={entry.url + i}
                        className="group flex items-center justify-between gap-2 px-3 py-2 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer"
                        onClick={() => {
                          window.open(entry.url, '_blank', 'noopener,noreferrer');
                          // Bump to top of list
                          const filtered = visitedUrls.filter(u => u.url !== entry.url);
                          const updated = [{ ...entry, visitedAt: new Date().toISOString() }, ...filtered];
                          saveVisitedUrls(updated);
                          setVisitedUrls(updated);
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <Code2 className="w-3 h-3 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-indigo-300 font-mono truncate">{entry.label}</p>
                            <p className="text-[10px] text-slate-500">{formatTime(entry.visitedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeVisited(entry.url); }}
                            className="p-0.5 text-slate-600 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---- TOFFEESHARE TAB ---- */}
          {activeTab === 'toffeeshare' && (
            <div className="space-y-5">
              <div className="p-4 bg-purple-950/30 border border-purple-500/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">Toffeeshare</h4>
                    <p className="text-[11px] text-slate-400">Free, peer-to-peer file sharing — no account needed</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Toffeeshare lets you share files directly from browser to browser without uploading to any server. Files are transferred over a secure P2P WebRTC connection.
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2"><Star className="w-3 h-3 text-purple-400 shrink-0" /> No file size limits</div>
                  <div className="flex items-center gap-2"><Star className="w-3 h-3 text-purple-400 shrink-0" /> End-to-end encrypted transfer</div>
                  <div className="flex items-center gap-2"><Star className="w-3 h-3 text-purple-400 shrink-0" /> No registration or account required</div>
                  <div className="flex items-center gap-2"><Star className="w-3 h-3 text-purple-400 shrink-0" /> 100% open source</div>
                </div>
              </div>

              <a
                href="https://toffeeshare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
              >
                Go to Toffeeshare.com <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
