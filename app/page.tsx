"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Search, Loader2, X, Notebook, Save, Edit3, Pin, Copy, Check, Clock, Type,
  Moon, Sun, AlertTriangle
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000/api/notes";

interface Note {
  _id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setNotes(data);
    } catch (err) { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const stats = useMemo(() => ({
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    chars: notes.reduce((acc, curr) => acc + (curr.content?.length || 0), 0)
  }), [notes]);

  const openNote = (note: Note) => {
    setIsEditing(false);
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const closeNote = () => {
    setSelectedNote(null);
    setIsEditing(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      setTitle(""); setContent(""); await fetchNotes();
    } finally { setSubmitting(false); }
  };

  const togglePin = async (note: Note, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      const updated = await res.json();
      if (selectedNote?._id === note._id) setSelectedNote(updated);
      await fetchNotes();
    } catch (err) { }
  };

  const handleUpdate = async () => {
    if (!selectedNote || !editTitle.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/${selectedNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
      });
      setIsEditing(false); setSelectedNote(null); await fetchNotes();
    } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await fetch(`${API_URL}/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null); setSelectedNote(null); await fetchNotes();
    } catch (err) { }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-all duration-700 ${darkMode ? "bg-[#030303] text-white dark" : "bg-[#FAFAFA] text-[#0A0A0A]"} font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black`}>
      <div className={`mesh-bg fixed inset-0 z-[-1] transition-opacity duration-1000 ${darkMode ? "opacity-[0.03]" : "opacity-100"}`} />
      <div className="noise fixed inset-0 z-[-1]" />

      <header className="max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4 sm:gap-6">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all border ${darkMode ? "bg-white text-black border-transparent" : "bg-black text-white border-white/10"}`}>
            <Notebook size={24} />
          </div>
          <div>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-tighter leading-none mb-1 ${darkMode ? "text-white" : "text-black"}`}>Marshal Notes</h1>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">The Private Vault</p>
          </div>
        </motion.div>

        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="relative group flex-1 md:w-[350px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors" size={16} />
            <input 
              type="text" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-12 pr-6 py-3.5 rounded-2xl outline-none text-sm font-medium transition-all border ${darkMode ? "bg-zinc-900/50 border-zinc-800 text-white focus:bg-zinc-900 placeholder:text-zinc-600" : "bg-white border-zinc-200 focus:border-black"}`}
            />
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3.5 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200"}`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-32">
        <div className="lg:col-span-4 space-y-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`p-8 sm:p-10 rounded-[2.5rem] border shadow-2xl transition-all lg:sticky lg:top-10 ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100 shadow-zinc-200/50"}`}>
            <div className="flex items-center justify-between mb-8 text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              <span>Compose Entry</span>
              <span className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full"><Type size={10} /> {content.length}</span>
            </div>
            <form onSubmit={handleCreate} className="space-y-8">
              <input 
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className={`w-full bg-transparent border-b-2 py-3 text-2xl font-bold outline-none transition-all ${darkMode ? "border-zinc-800 text-white focus:border-white placeholder:text-zinc-800" : "border-zinc-100 text-black focus:border-black placeholder:text-zinc-200"}`} placeholder="Vault Title" 
              />
              <textarea 
                value={content} onChange={(e) => setContent(e.target.value)} rows={5}
                className={`w-full rounded-3xl p-6 text-base font-medium outline-none resize-none transition-all leading-relaxed ${darkMode ? "bg-black/50 border border-zinc-800 text-white focus:border-zinc-600 placeholder:text-zinc-700" : "bg-zinc-50 focus:bg-white border-transparent focus:border-zinc-200 text-black"}`}
                placeholder="What's on your mind?"
              />
              <button className={`w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] ${darkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-800"}`}>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Save Entry <Plus size={18} /></>}
              </button>
            </form>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 px-2 font-sans">
            <div className="text-center">
              <p className={`text-2xl font-black tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>{stats.total}</p>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Notes</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-black tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>{stats.pinned}</p>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Pins</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-black tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>{Math.round(stats.chars / 1000)}k</p>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Vol</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em]">Vault Explorer</h2>
            <div className="flex items-center gap-3">
              <div className="h-px w-12 sm:w-16 bg-zinc-100 dark:bg-zinc-800" />
              <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em]">{filteredNotes.length} Total</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredNotes.length > 0 ? filteredNotes.map((note) => (
                <motion.div
                  key={note._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => openNote(note)}
                  className={`group p-8 rounded-[2.5rem] border transition-all cursor-pointer relative ${darkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 shadow-2xl shadow-black" : "bg-white border-zinc-100 hover:shadow-2xl hover:shadow-zinc-200/40 hover:scale-[1.02]"} ${note.isPinned ? (darkMode ? "ring-2 ring-white/10" : "ring-2 ring-black/5") : ""}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-2 h-2 rounded-full transition-colors ${note.isPinned ? "bg-black dark:bg-white" : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-300"}`} />
                    <div className="flex gap-3">
                      <button onClick={(e) => togglePin(note, e)} className={`p-2 rounded-xl transition-all ${note.isPinned ? (darkMode ? "bg-white text-black shadow-lg" : "bg-black text-white shadow-xl") : "text-zinc-300 hover:text-black dark:hover:text-white"}`}>
                        <Pin size={18} className={note.isPinned ? "fill-current" : ""} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(note._id); }} className="p-2 rounded-xl text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-3 tracking-tight leading-snug ${darkMode ? "text-white" : "text-black"}`}>{note.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium line-clamp-4 leading-relaxed mb-8">{note.content}</p>
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-t border-zinc-50 dark:border-white/5 pt-6">
                    <span className="flex items-center gap-2"><Clock size={12} /> {getTimeAgo(note.createdAt)}</span>
                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(note.content); }} className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 font-sans ${darkMode ? "hover:text-white" : "hover:text-black"}`}><Copy size={12} /> Copy</button>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-24 text-center">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300 dark:text-zinc-700">
                    <Notebook size={32} />
                  </div>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No entries found in the vault</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeNote} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.98 }} className={`relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border transition-all ${darkMode ? "bg-zinc-900 text-white border-white/5" : "bg-white border-transparent"}`}>
              
              <div className="flex justify-between items-center px-8 py-6 border-b border-zinc-100/10 shrink-0">
                <div className="flex gap-3">
                  <button onClick={() => setIsEditing(!isEditing)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${darkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-zinc-100 text-black hover:bg-zinc-200"}`}>
                    {isEditing ? <X size={14} /> : <Edit3 size={14} />} {isEditing ? "Cancel" : "Edit"}
                  </button>
                  {!isEditing && (
                    <button onClick={() => togglePin(selectedNote)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${selectedNote.isPinned ? (darkMode ? "bg-white text-black shadow-xl" : "bg-black text-white shadow-xl") : (darkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-zinc-100 hover:bg-zinc-200")}`}>
                      <Pin size={14} className={selectedNote.isPinned ? "fill-current" : ""} /> Pin
                    </button>
                  )}
                </div>
                <button onClick={closeNote} className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-all"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll p-8 sm:p-12">
                {isEditing ? (
                  <div className="space-y-6">
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={`w-full bg-transparent border-b-2 py-3 text-3xl font-black outline-none transition-all ${darkMode ? "border-zinc-700 text-white focus:border-white placeholder:text-zinc-800" : "border-black text-black placeholder:text-zinc-200"}`} />
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} className={`w-full rounded-2xl p-6 text-lg font-medium outline-none resize-none transition-all leading-relaxed ${darkMode ? "bg-black/40 border border-zinc-800 text-white focus:border-zinc-600 placeholder:text-zinc-700" : "bg-zinc-50 text-black placeholder:text-zinc-200"}`} />
                  </div>
                ) : (
                  <div>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tighter ${darkMode ? "text-white" : "text-black"}`}>{selectedNote.title}</h2>
                    <p className={`text-base sm:text-lg md:text-xl font-medium leading-[1.6] whitespace-pre-wrap ${darkMode ? "text-zinc-300" : "text-zinc-600"}`}>{selectedNote.content}</p>
                  </div>
                )}
              </div>

              <div className={`px-8 py-6 border-t border-zinc-100/10 shrink-0 flex items-center justify-between ${darkMode ? "bg-black/40" : "bg-zinc-50/30"}`}>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{new Date(selectedNote.createdAt).toLocaleString()}</span>
                <div className="flex gap-3">
                  {isEditing ? (
                    <button onClick={handleUpdate} className={`px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.01] active:scale-95 ${darkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white"}`}>
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Update
                    </button>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(selectedNote._id)} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-red-700 transition-all shadow-xl shadow-red-600/40">
                      <Trash2 size={16} /> Destroy
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 font-sans">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`relative w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center border transition-all ${darkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-100"}`}>
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 shadow-inner">
                <AlertTriangle size={32} />
              </div>
              <h3 className={`text-xl font-black mb-3 tracking-tight ${darkMode ? "text-white" : "text-black"}`}>Destroy Entry?</h3>
              <p className="text-zinc-500 text-xs mb-8 leading-relaxed font-medium">This action will permanently erase the data. This cannot be undone.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setDeleteConfirmId(null)} className={`py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${darkMode ? "bg-white/10 text-white hover:bg-white/20" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-500"}`}>Cancel</button>
                <button onClick={confirmDelete} className="py-4 bg-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/40">Destroy</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
