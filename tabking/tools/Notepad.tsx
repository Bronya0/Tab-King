import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Save, X, Download } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = 'tabking_notes';

const Notepad: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const selectedNote = notes.find(n => n.id === selectedId);

  const getTitleFromContent = (content: string): string => {
    const firstLine = content.split('\n')[0].trim();
    return firstLine || '无标题笔记';
  };

  const createNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      updatedAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setEditContent('');
    setEditTitle('');
  };

  const updateNote = () => {
    if (!selectedId) return;
    setNotes(prev => prev.map(n => {
      if (n.id === selectedId) {
        const title = editTitle || getTitleFromContent(editContent);
        return {
          ...n,
          title,
          content: editContent,
          updatedAt: Date.now()
        };
      }
      return n;
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setEditContent('');
      setEditTitle('');
    }
  };

  const selectNote = (note: Note) => {
    selectNoteWithContent(note.id, note.content, note.title);
  };

  const selectNoteWithContent = (id: string, content: string, title: string) => {
    setSelectedId(id);
    setEditContent(content);
    setEditTitle(title);
  };

  const exportToTxt = () => {
    if (!selectedNote) return;
    const blob = new Blob([selectedNote.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllToTxt = () => {
    if (notes.length === 0) return;
    const allContent = notes.map(n => `=== ${n.title} ===\n${n.content}\n\n`).join('');
    const blob = new Blob([allContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-notes-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg p-4 text-gray-300 flex flex-col" style={{ height: '85vh', backgroundColor: '#232524' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
          <FileText size={18} />
          记事本
        </h3>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-teal-400 font-medium animate-in fade-in slide-in-from-left-2 duration-300">
              已保存
            </span>
          )}
          <button
            onClick={exportAllToTxt}
            disabled={notes.length === 0}
            className="flex items-center gap-1 px-2 py-1 bg-gray-700/80 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors duration-200 text-xs text-gray-300"
          >
            <Download size={12} />
            导出全部
          </button>
          <button
            onClick={createNote}
            className="flex items-center gap-1 px-3 py-1.5 rounded transition-colors duration-200 text-sm text-gray-200"
            style={{ backgroundColor: '#2D3839' }}
          >
            <Plus size={14} />
            新建
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-56 flex flex-col border-r border-gray-700/80 pr-3">
          <div className="flex-1 overflow-y-auto space-y-1">
            {notes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">暂无笔记</p>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`p-2 rounded cursor-pointer transition-colors duration-200 group ${
                    selectedId === note.id
                      ? 'border'
                      : 'hover:bg-gray-700/60'
                  }`}
                  style={selectedId === note.id ? { backgroundColor: '#2D3839', borderColor: '#3D4849' } : { backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium truncate flex-1">
                      {note.title}
                    </span>
                    <button
                      onClick={(e) => deleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/50 rounded transition-all duration-200"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedId ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={updateNote}
                  spellCheck={false}
                  className="flex-1 px-3 py-1.5 bg-[#232524] border border-[#3a3d3e] rounded text-gray-200 text-sm focus:outline-none focus:border-[#4a4d4e] placeholder:text-gray-600"
                  placeholder="标题会自动提取内容首行"
                />
                <button
                  onClick={updateNote}
                  className="p-1.5 bg-[#2D3839] hover:bg-[#3D4849] rounded transition-colors duration-200"
                  title="保存"
                >
                  <Save size={14} />
                </button>
                <button
                  onClick={exportToTxt}
                  className="p-1.5 bg-[#2D3839] hover:bg-[#3D4849] rounded transition-colors duration-200"
                  title="导出为TXT"
                >
                  <Download size={14} />
                </button>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  const title = getTitleFromContent(e.target.value);
                  if (title !== editTitle) {
                    setEditTitle(title);
                  }
                }}
                onBlur={updateNote}
                spellCheck={false}
                placeholder="在此输入笔记内容..."
                className="flex-1 w-full px-3 py-2 bg-[#232524] border border-[#3a3d3e] rounded text-gray-200 text-sm focus:outline-none focus:border-[#4a4d4e] resize-none placeholder:text-gray-600"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-2 opacity-30" />
                <p>选择或创建一个笔记开始编辑</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notepad;
