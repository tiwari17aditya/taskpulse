'use client';

import { useEffect, useState } from 'react';
import { Table, Plus, X, RefreshCw, FileText } from 'lucide-react';

export default function TokenUsageModal({ onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [inputTokens, setInputTokens] = useState('');
  const [outputTokens, setOutputTokens] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTokens = () => {
    setLoading(true);
    fetch('/api/tokens')
      .then(res => res.json())
      .then(data => setContent(data.content || ''))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleAddRow = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const inT = parseInt(inputTokens) || 0;
      const outT = parseInt(outputTokens) || 0;
      const total = inT + outT;
      const cost = (inT * 0.0000005 + outT * 0.0000015).toFixed(4);

      await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputTokens: inT,
          outputTokens: outT,
          totalTokens: total,
          estimatedCost: cost,
          notes: notes || 'Chat session tokens'
        })
      });

      setInputTokens('');
      setOutputTokens('');
      setNotes('');
      fetchTokens();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 shadow-2xl space-y-4 animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Daily Token Usage File (token_usage.md)</h3>
              <p className="text-[11px] text-slate-400">Tabular token tracking per chat session</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchTokens} className="p-1.5 text-slate-400 hover:text-slate-200">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Add Log Entry */}
        <form onSubmit={handleAddRow} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="number"
            placeholder="Input Tokens (e.g. 1500)"
            value={inputTokens}
            onChange={(e) => setInputTokens(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            placeholder="Output Tokens (e.g. 800)"
            value={outputTokens}
            onChange={(e) => setOutputTokens(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Notes (e.g. 'Task Manager Refactor')"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Append Row
          </button>
        </form>

        {/* Display File Markdown Content */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 max-h-80 overflow-y-auto whitespace-pre-wrap">
          {loading ? 'Loading token_usage.md...' : content || 'No token logs recorded yet.'}
        </div>
      </div>
    </div>
  );
}
