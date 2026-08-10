'use client';

import { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, X, Shield, ArrowRight, Code, Key, ExternalLink as ExternalIcon } from 'lucide-react';

export default function ShareRedirectModal({ initialItem, onClose }) {
  const [shareType, setShareType] = useState('code'); // 'code', 'redirect'
  const [title, setTitle] = useState(initialItem?.title || 'Shared Note Snippet');
  const [content, setContent] = useState(initialItem?.content || '');
  const [customPasscode, setCustomPasscode] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('https://toffeeshare.com');
  const [generatedShare, setGeneratedShare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          type: shareType === 'redirect' ? 'redirect' : 'code',
          customCode: customPasscode,
          redirectUrl: shareType === 'redirect' ? (redirectUrl || 'https://toffeeshare.com') : null,
          mediaUrl: initialItem?.media?.[0]?.url || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedShare(data.share);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInternalLink = () => {
    if (!generatedShare) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/share/${generatedShare.code}`;
  };

  const getCodeshareUrl = () => {
    if (!generatedShare) return '';
    return `https://codeshare.io/${generatedShare.code.toLowerCase()}`;
  };

  const getToffeeshareUrl = () => {
    if (!generatedShare) return '';
    return generatedShare.redirectUrl || 'https://toffeeshare.com';
  };

  const copyLink = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy || getInternalLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-slide-up relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Codeshare.io & Toffeeshare Hub</h3>
              <p className="text-[11px] text-slate-400">Custom room passcodes & direct website redirection</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!generatedShare ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setShareType('code')}
                className={`py-2 text-xs font-medium rounded-lg transition ${shareType === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Codeshare.io Room
              </button>
              <button
                type="button"
                onClick={() => setShareType('redirect')}
                className={`py-2 text-xs font-medium rounded-lg transition ${shareType === 'redirect' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Toffeeshare Redirect
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            {shareType === 'code' ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium flex items-center justify-between">
                    <span>Custom Codeshare Passcode / Room Name</span>
                    <span className="text-[10px] text-indigo-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-indigo-500">
                    <span className="text-xs text-slate-500 font-mono mr-1">codeshare.io/</span>
                    <input
                      type="text"
                      placeholder="e.g. aditya-room-123"
                      value={customPasscode}
                      onChange={(e) => setCustomPasscode(e.target.value)}
                      className="w-full bg-transparent font-mono text-xs text-indigo-300 outline-none placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Code / Text Content</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 p-3 rounded-xl outline-none focus:border-indigo-500 resize-none"
                    placeholder="Paste code snippet or text here..."
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Toffeeshare Redirection Link</label>
                <input
                  type="url"
                  placeholder="https://toffeeshare.com"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 px-3 py-2 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              {loading ? 'Creating Link...' : shareType === 'code' ? 'Create Codeshare.io Room' : 'Create Toffeeshare Redirect Link'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-2">
              <span className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">
                {generatedShare.type === 'code' ? 'Codeshare.io Room Passcode' : 'Toffeeshare Access Code'}
              </span>
              <div className="text-3xl font-mono font-bold text-white tracking-widest">{generatedShare.code}</div>
            </div>

            {generatedShare.type === 'code' ? (
              <div className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Customized Codeshare.io URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={getCodeshareUrl()}
                      className="w-full bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 px-3 py-2 rounded-xl outline-none"
                    />
                    <button
                      onClick={() => copyLink(getCodeshareUrl())}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1 shrink-0 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <a
                  href={getCodeshareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  Open Codeshare.io Room <ExternalIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Toffeeshare Official Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={getToffeeshareUrl()}
                      className="w-full bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 px-3 py-2 rounded-xl outline-none"
                    />
                    <button
                      onClick={() => copyLink(getToffeeshareUrl())}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1 shrink-0 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <a
                  href={getToffeeshareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                >
                  Open Toffeeshare Website <ExternalIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-xs">
              <a
                href={getInternalLink()}
                target="_blank"
                className="text-slate-400 hover:underline flex items-center gap-1"
              >
                Local Link Preview <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setGeneratedShare(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
