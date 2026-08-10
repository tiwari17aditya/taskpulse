'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Copy, Check, ShieldCheck, Share2, FileCode, Music, Image as ImageIcon, Video, FileText } from 'lucide-react';
import Link from 'next/link';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code ? params.code.toString().toUpperCase() : '';

  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;

    fetch(`/api/share?code=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.item) {
          setShareData(data.item);
          // If it's a direct URL redirection item (Toffeeshare redirect mode), auto redirect!
          if (data.item.type === 'redirect' && data.item.redirectUrl) {
            setTimeout(() => {
              window.location.href = data.item.redirectUrl;
            }, 2500);
          }
        } else {
          setError(data.error || 'Share link expired or invalid code.');
        }
      })
      .catch(err => {
        setError('Network error fetching shared content.');
      })
      .finally(() => setLoading(false));
  }, [code]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Top Banner */}
      <div className="fixed top-6 left-6 flex items-center gap-3">
        <Link href="/" className="px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 flex items-center gap-2 transition">
          <ArrowLeft className="w-4 h-4" /> Back to TaskPulse Workspace
        </Link>
      </div>

      <div className="w-full max-w-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                Instant Share Vault <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">#{code}</span>
              </h1>
              <p className="text-xs text-slate-400">Powered by Codeshare & Toffeeshare Direct Link Protocol</p>
            </div>
          </div>
          <button
            onClick={copyShareLink}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Link' : 'Copy Link'}
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Fetching shared content for #{code}...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
              !
            </div>
            <h2 className="text-base font-semibold text-slate-200">{error}</h2>
            <p className="text-xs text-slate-400">The share link may have expired or the 6-character code is incorrect.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{shareData?.title}</h2>

            {/* Direct URL Redirection Banner */}
            {shareData?.type === 'redirect' && shareData?.redirectUrl && (
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Toffeeshare Direct Link Redirection</p>
                  <p className="text-sm text-slate-300 font-mono truncate max-w-md">{shareData.redirectUrl}</p>
                  <p className="text-[11px] text-slate-400">Redirecting automatically in a moment...</p>
                </div>
                <a
                  href={shareData.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
                >
                  Go Now <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Shared Content / Code Snippet */}
            {shareData?.content && (
              <div className="relative group">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-sm text-slate-200 whitespace-pre-wrap overflow-x-auto max-h-96">
                  {shareData.content}
                </div>
              </div>
            )}

            {/* Shared Media Attachment Preview */}
            {shareData?.mediaUrl && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <p className="text-xs text-slate-400 font-medium">Shared Attachment Preview</p>
                {shareData.type === 'media' && shareData.mediaUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                  <img src={shareData.mediaUrl} alt="Shared attachment" className="max-h-80 rounded-lg object-contain mx-auto" />
                ) : (
                  <a
                    href={shareData.mediaUrl}
                    target="_blank"
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
                  >
                    Download Attachment <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Link Verification</span>
              <span>Expires: {new Date(shareData.expiresAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
