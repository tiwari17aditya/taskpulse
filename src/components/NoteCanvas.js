import { useState } from 'react';
import { Pin, Plus, Share2, Trash2, Tag, Palette, Image as ImageIcon, Music, Video, FileText, Check, ExternalLink, CheckCircle2 } from 'lucide-react';
import MediaUploader from './MediaUploader';
import { saveNoteToDB, deleteNoteFromDB, deleteNotesFromDB } from '@/lib/dbAdapter';

const COLOR_PALETTE = [
  { name: 'Default', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' },
  { name: 'Indigo', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)' },
  { name: 'Rose', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' },
  { name: 'Amber', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  { name: 'Emerald', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  { name: 'Cyan', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)' },
  { name: 'Purple', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)' },
];

export default function NoteCanvas({ notes, setNotes, tags, activeTag, onShareNote }) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].bg);
  const [selectedTags, setSelectedTags] = useState(['Ideas']);
  const [mediaList, setMediaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk selection state
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Filter notes by tag & search
  const filteredNotes = notes.filter(note => {
    const matchesTag = activeTag ? note.tags?.includes(activeTag) : true;
    const matchesSearch = searchQuery
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesTag && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const otherNotes = filteredNotes.filter(n => !n.pinned);

  const toggleSelectNote = (noteId) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  const selectAllNotes = () => {
    setSelectedNoteIds(filteredNotes.map(n => n.id));
  };

  const deselectAllNotes = () => {
    setSelectedNoteIds([]);
  };

  const deleteSelectedNotes = () => {
    if (selectedNoteIds.length === 0) return;
    const remaining = notes.filter(n => !selectedNoteIds.includes(n.id));
    setNotes(remaining);
    deleteNotesFromDB(selectedNoteIds);
    setSelectedNoteIds([]);
  };

  const deleteAllFilteredNotes = () => {
    const targetIds = filteredNotes.map(n => n.id);
    if (targetIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${targetIds.length} notes in this view?`)) return;
    const remaining = notes.filter(n => !targetIds.includes(n.id));
    setNotes(remaining);
    deleteNotesFromDB(targetIds);
    setSelectedNoteIds([]);
  };

  const createNote = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const newNote = {
      id: 'n-' + Date.now(),
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      bgColor: selectedColor,
      pinned: false,
      tags: selectedTags,
      media: mediaList,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    saveNoteToDB(newNote); // Direct sync to NeonDB / active database
    setTitle('');
    setContent('');
    setMediaList([]);
    setIsCreating(false);
  };

  const togglePin = (noteId) => {
    let targetNote = null;
    const updated = notes.map(n => {
      if (n.id === noteId) {
        targetNote = { ...n, pinned: !n.pinned };
        return targetNote;
      }
      return n;
    });
    setNotes(updated);
    if (targetNote) saveNoteToDB(targetNote);
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(n => n.id !== noteId));
    deleteNoteFromDB(noteId); // Direct sync delete to NeonDB
  };

  const toggleTagInCreation = (tagName) => {
    setSelectedTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]);
  };

  return (
    <div className="space-y-6">
      {/* Search & Quick Create Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search notes, tags, or media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 bg-slate-900 border border-slate-800 text-xs text-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-indigo-500"
        />

        {!isCreating && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedNoteIds([]);
              }}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                isSelectMode ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSelectMode ? 'Exit Selection' : 'Multi-Select Notes'}
            </button>

            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" /> Take a Note
            </button>
          </div>
        )}
      </div>

      {/* Bulk Notes Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          {isSelectMode && (
            <>
              <button
                type="button"
                onClick={selectedNoteIds.length === filteredNotes.length ? deselectAllNotes : selectAllNotes}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                {selectedNoteIds.length === filteredNotes.length ? 'Deselect All' : 'Select All Notes'}
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {selectedNoteIds.length} of {filteredNotes.length} notes selected
              </span>
            </>
          )}
          {!isSelectMode && (
            <span className="text-xs text-slate-400 font-mono">
              Total {filteredNotes.length} notes stored
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSelectMode && selectedNoteIds.length > 0 && (
            <button
              type="button"
              onClick={deleteSelectedNotes}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedNoteIds.length})
            </button>
          )}
          {filteredNotes.length > 0 && (
            <button
              type="button"
              onClick={deleteAllFilteredNotes}
              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-medium flex items-center gap-1 transition"
            >
              <Trash2 className="w-3 h-3" /> Clear All Notes ({filteredNotes.length})
            </button>
          )}
        </div>
      </div>

      {/* Note Creation Card (Keep Style Expandable Input) */}
      {isCreating && (
        <form onSubmit={createNote} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-4 animate-slide-up max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-base font-semibold text-slate-100 placeholder-slate-500 outline-none"
          />

          <textarea
            rows={3}
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-500 outline-none resize-none"
          />

          {/* Media Attachments Section */}
          <MediaUploader media={mediaList} onMediaChange={setMediaList} />

          {/* Color & Tag Picker */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-1.5">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.bg)}
                  className={`w-5 h-5 rounded-full border transition ${selectedColor === c.bg ? 'ring-2 ring-indigo-400 scale-110' : ''}`}
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {tags.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTagInCreation(t.name)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                    selectedTags.includes(t.name) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Pinned Notes Grid */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" /> Pinned Notes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPin={togglePin}
                onDelete={deleteNote}
                onShare={onShareNote}
                tags={tags}
                isSelectMode={isSelectMode}
                isSelectedForBulk={selectedNoteIds.includes(note.id)}
                toggleSelectNote={toggleSelectNote}
              />
            ))}
          </div>
        </div>
      )}

      {/* Others Notes Grid */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Others</p>}
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center bg-slate-900/30 border border-slate-800/40 rounded-xl">
            <p className="text-xs text-slate-500">No notes found. Create one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPin={togglePin}
                onDelete={deleteNote}
                onShare={onShareNote}
                tags={tags}
                isSelectMode={isSelectMode}
                isSelectedForBulk={selectedNoteIds.includes(note.id)}
                toggleSelectNote={toggleSelectNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, onPin, onDelete, onShare, tags, isSelectMode, isSelectedForBulk, toggleSelectNote }) {
  return (
    <div
      onClick={() => {
        if (isSelectMode) toggleSelectNote(note.id);
      }}
      className={`group relative rounded-2xl p-4 border transition-all duration-200 hover:shadow-xl flex flex-col justify-between space-y-3 ${
        isSelectedForBulk ? 'ring-2 ring-indigo-500' : ''
      }`}
      style={{
        backgroundColor: isSelectedForBulk ? 'rgba(99, 102, 241, 0.2)' : (note.bgColor || 'rgba(255, 255, 255, 0.04)'),
        borderColor: isSelectedForBulk ? '#6366f1' : 'rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 pr-6">
            {isSelectMode && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleSelectNote(note.id); }}
                className="shrink-0 text-slate-400 hover:text-indigo-400"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                  isSelectedForBulk ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-950'
                }`}>
                  {isSelectedForBulk && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            )}
            <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">{note.title}</h4>
          </div>
          <button
            onClick={() => onPin(note.id)}
            className={`p-1 rounded-lg transition ${note.pinned ? 'text-indigo-400' : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300'}`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-indigo-400' : ''}`} />
          </button>
        </div>

        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-6">{note.content}</p>

        {/* Media Attachments Preview inside Note Card */}
        {note.media && note.media.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            {note.media.map(m => (
              <div key={m.id || m.url} className="rounded-lg overflow-hidden border border-white/10 bg-black/20">
                {m.type === 'image' && (
                  <img src={m.url} alt={m.name} className="w-full max-h-40 object-cover" />
                )}
                {m.type === 'audio' && (
                  <div className="p-2 flex items-center gap-2 text-[11px] text-amber-300">
                    <Music className="w-3.5 h-3.5" />
                    <audio controls src={m.url} className="w-full h-6" />
                  </div>
                )}
                {m.type === 'video' && (
                  <video controls src={m.url} className="w-full max-h-36 object-cover" />
                )}
                {m.type === 'file' && (
                  <a href={m.url} target="_blank" download className="p-2 flex items-center justify-between text-[11px] text-blue-300 hover:underline">
                    <span className="truncate">{m.name || 'Attachment'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
        <div className="flex flex-wrap gap-1">
          {note.tags?.map(t => {
            const tagObj = tags.find(tg => tg.name === t);
            return (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: `${tagObj?.color || '#6366f1'}20`, color: tagObj?.color || '#818cf8' }}>
                #{t}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onShare(note)}
            title="Instant Codeshare / Toffeeshare Redirect"
            className="p-1 text-slate-400 hover:text-indigo-400 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            title="Delete Note"
            className="p-1 text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
