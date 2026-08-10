'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, Music, Video, FileText, X, Link as LinkIcon, Plus } from 'lucide-react';

export default function MediaUploader({ media = [], onMediaChange }) {
  const [activeTab, setActiveTab] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');
  const [mediaType, setMediaType] = useState('image');

  const addMediaByUrl = () => {
    if (!urlInput.trim()) return;
    const newMedia = [
      ...media,
      {
        id: 'm-' + Date.now(),
        type: mediaType,
        url: urlInput.trim(),
        name: fileNameInput.trim() || urlInput.split('/').pop().substring(0, 20) || 'Attachment'
      }
    ];
    onMediaChange(newMedia);
    setUrlInput('');
    setFileNameInput('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type.startsWith('video/')) type = 'video';

    // Convert local file to Object URL preview
    const objectUrl = URL.createObjectURL(file);
    const newMedia = [
      ...media,
      {
        id: 'm-' + Date.now(),
        type,
        url: objectUrl,
        name: file.name
      }
    ];
    onMediaChange(newMedia);
  };

  const removeMedia = (id) => {
    onMediaChange(media.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-300">Media Attachments</span>
        <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${activeTab === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            URL Link
          </button>
          <label className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 cursor-pointer">
            Upload File
            <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,audio/*,video/*,application/pdf" />
          </label>
        </div>
      </div>

      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs p-2 outline-none focus:border-indigo-500"
            >
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="file">Document</option>
            </select>
            <input
              type="text"
              placeholder="Paste media link / image URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={addMediaByUrl}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      )}

      {/* Render Current Attachments List */}
      {media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {media.map((item) => (
            <div key={item.id} className="relative group bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-6">
                {item.type === 'image' && <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
                {item.type === 'audio' && <Music className="w-4 h-4 text-amber-400 shrink-0" />}
                {item.type === 'video' && <Video className="w-4 h-4 text-purple-400 shrink-0" />}
                {item.type === 'file' && <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
                <span className="text-slate-200 truncate font-mono text-[11px]">{item.name || item.url}</span>
              </div>
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="text-slate-500 hover:text-rose-400 transition p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
