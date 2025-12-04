
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Shortcut, GridConfig } from '../types';
import { getFaviconUrl } from '../constants';

// Global cache for failed favicons to prevent flicker/re-fetching
const FAILED_FAVICONS = new Set<string>();

interface ShortcutGridProps {
  shortcuts: Shortcut[];
  gridConfig: GridConfig;
  onAddShortcut: (shortcut: Shortcut) => void;
  onRemoveShortcut: (id: string) => void;
  onReorderShortcuts: (dragId: string, targetId: string) => void;
  onMergeShortcuts: (dragId: string, dropId: string) => void;
  onRemoveFromFolder: (folderId: string, itemId: string) => void;
  onMoveToRoot: (folderId: string, itemId: string) => void;
}

const ShortcutIcon = ({ url, title, size = 'default' }: { url: string, title: string, size?: 'default' | 'small' }) => {
  const faviconUrl = getFaviconUrl(url);
  const [imgError, setImgError] = useState(FAILED_FAVICONS.has(faviconUrl));
  
  // Reset error state if url changes
  useEffect(() => {
    if (FAILED_FAVICONS.has(faviconUrl)) {
        setImgError(true);
    } else {
        setImgError(false);
    }
  }, [faviconUrl]);

  const iconSizeClass = size === 'default' ? 'w-[60%] h-[60%]' : 'w-full h-full'; // Inner icon relative size
  const textSizeClass = size === 'default' ? 'text-2xl' : 'text-[10px] leading-none';

  if (!imgError) {
    return (
      <img
        src={faviconUrl}
        alt={title}
        className={`${iconSizeClass} object-cover rounded-full transition-transform duration-300`}
        onError={() => {
            FAILED_FAVICONS.add(faviconUrl);
            setImgError(true);
        }}
        draggable={false}
      />
    );
  }

  return (
    <div className={`${iconSizeClass} flex items-center justify-center bg-white/10 rounded-full`}>
      <span className={`${textSizeClass} font-bold text-white/90 uppercase tracking-wider select-none`}>
        {title.slice(0, 2)}
      </span>
    </div>
  );
};

const FolderPreview = ({ children }: { children: Shortcut[] }) => {
    const previewItems = children.slice(0, 4);
    
    return (
        <div className="w-[60%] h-[60%] grid grid-cols-2 grid-rows-2 gap-1 p-2 bg-white/10 rounded-3xl backdrop-blur-sm">
            {previewItems.map((item) => (
                <div key={item.id} className="relative w-full h-full rounded-full overflow-hidden">
                    <ShortcutIcon url={item.url} title={item.title} size="small" />
                </div>
            ))}
        </div>
    )
}

const ShortcutItem = ({ 
    shortcut, 
    onRemove, 
    onClickFolder,
    isMergeTarget,
    isReorderTarget,
    onItemDragStart,
    onItemDragOver,
    onItemDragLeave,
    onItemDrop,
    size
}: { 
    shortcut: Shortcut, 
    onRemove: (id: string) => void,
    onClickFolder: (s: Shortcut) => void,
    isMergeTarget: boolean,
    isReorderTarget: boolean,
    onItemDragStart: (e: React.DragEvent, id: string) => void,
    onItemDragOver: (e: React.DragEvent, id: string) => void,
    onItemDragLeave: (e: React.DragEvent) => void,
    onItemDrop: (e: React.DragEvent, id: string) => void,
    size: number
}) => {
  const isFolder = shortcut.type === 'folder';

  return (
    <div 
        className={`relative group flex flex-col items-center transition-all duration-200 
            ${isReorderTarget ? 'translate-x-2 opacity-80' : ''}
        `}
        style={{ width: `${size + 20}px` }} // slightly larger than icon for label space
        draggable={true}
        onDragStart={(e) => onItemDragStart(e, shortcut.id)}
        onDragOver={(e) => onItemDragOver(e, shortcut.id)}
        onDragLeave={onItemDragLeave}
        onDrop={(e) => onItemDrop(e, shortcut.id)}
    >
        {/* Reorder Indicator Bar */}
        {isReorderTarget && !isMergeTarget && (
             <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] z-0 animate-pulse" />
        )}

      <button
        onClick={() => isFolder ? onClickFolder(shortcut) : window.location.href = shortcut.url}
        className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-110 active:scale-95 group-hover:z-10
            ${isMergeTarget ? 'scale-125 z-20 ring-4 ring-blue-500/30 bg-white/10' : ''}
        `}
      >
        <div 
            className="rounded-full flex items-center justify-center mb-2 overflow-hidden transition-all duration-300 relative bg-black/5 hover:bg-white/10 ring-1 ring-white/5 hover:ring-white/20"
            style={{ width: `${size}px`, height: `${size}px` }}
        >
          {isFolder && shortcut.children ? (
             <FolderPreview children={shortcut.children} />
          ) : (
             <ShortcutIcon url={shortcut.url} title={shortcut.title} />
          )}
        </div>
        <span className="text-sm text-white/90 truncate text-center drop-shadow-md font-medium px-1 select-none" style={{ maxWidth: `${size + 20}px`}}>
          {shortcut.title}
        </span>
      </button>
      
      <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(shortcut.id);
        }}
        className="absolute top-1 right-3 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-lg z-20 hover:bg-red-600"
        title="Remove"
      >
        <X size={12} strokeWidth={3} />
      </button>
    </div>
  );
};

const ShortcutGrid: React.FC<ShortcutGridProps> = ({ 
    shortcuts, 
    gridConfig, 
    onAddShortcut, 
    onRemoveShortcut, 
    onReorderShortcuts,
    onMergeShortcuts,
    onRemoveFromFolder,
    onMoveToRoot
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  
  // DnD State
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);
  const mergeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Folder Modal State
  const [openFolder, setOpenFolder] = useState<Shortcut | null>(null);
  
  // Defaults in case they are missing from config
  const iconSize = gridConfig.iconSize || 84;
  const gapX = gridConfig.gapX !== undefined ? gridConfig.gapX : 24;
  const gapY = gridConfig.gapY !== undefined ? gridConfig.gapY : 24;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    let formattedUrl = newUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    let title = newName;
    if (!title) {
        try {
            title = new URL(formattedUrl).hostname.split('.')[0];
            title = title.charAt(0).toUpperCase() + title.slice(1);
        } catch {
            title = 'Site';
        }
    }

    const newShortcut: Shortcut = {
      id: Date.now().toString(),
      title: title,
      url: formattedUrl,
      type: 'link'
    };

    onAddShortcut(newShortcut);
    closeAddModal();
  };

  const closeAddModal = () => {
      setIsAdding(false);
      setNewUrl('');
      setNewName('');
  }

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData('shortcut-id', id);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
      e.preventDefault();
      
      if (dragOverId !== id) {
          setDragOverId(id);
          
          if (mergeTimerRef.current) clearTimeout(mergeTimerRef.current);
          setMergeTargetId(null);

          mergeTimerRef.current = setTimeout(() => {
              setMergeTargetId(id);
          }, 600);
      }
  };

  const handleDragLeave = (e: React.DragEvent) => {
      // Logic handled by container
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      
      const draggedId = e.dataTransfer.getData('shortcut-id');
      
      if (mergeTimerRef.current) clearTimeout(mergeTimerRef.current);
      
      if (draggedId && draggedId !== targetId) {
          if (mergeTargetId === targetId) {
              onMergeShortcuts(draggedId, targetId);
          } else {
              onReorderShortcuts(draggedId, targetId);
          }
      }

      setDragOverId(null);
      setMergeTargetId(null);
  };

  const handleFolderItemDragStart = (e: React.DragEvent, itemId: string) => {
      e.dataTransfer.setData('folder-item', JSON.stringify({ folderId: openFolder?.id, itemId }));
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleBackdropDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const folderData = e.dataTransfer.getData('folder-item');
      if (folderData) {
          const { folderId, itemId } = JSON.parse(folderData);
          if (folderId && itemId) {
              onMoveToRoot(folderId, itemId);
          }
      }
      setDragOverId(null);
      setMergeTargetId(null);
  };

  return (
    <div className="w-full max-w-[54rem] mx-auto px-0 z-10">
      <div
        className="grid w-full justify-items-center transition-all duration-300"
        style={{
          gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`,
          gap: `${gapY}px ${gapX}px`
        }}
        onDragLeave={() => {
            setDragOverId(null);
            setMergeTargetId(null);
            if (mergeTimerRef.current) clearTimeout(mergeTimerRef.current);
        }}
      >
        {shortcuts.map((shortcut) => (
          <ShortcutItem 
            key={shortcut.id} 
            shortcut={shortcut} 
            onRemove={onRemoveShortcut}
            onClickFolder={setOpenFolder}
            onItemDragStart={handleDragStart}
            onItemDragOver={handleDragOver}
            onItemDragLeave={handleDragLeave}
            onItemDrop={handleDrop}
            isMergeTarget={mergeTargetId === shortcut.id}
            isReorderTarget={dragOverId === shortcut.id && mergeTargetId !== shortcut.id}
            size={iconSize}
          />
        ))}

        {/* Add Button */}
        <div className="relative flex flex-col items-center" style={{ width: `${iconSize + 20}px` }}>
          <button
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center p-2 rounded-xl transition-all duration-300 opacity-50 hover:opacity-100 group hover:scale-110"
          >
            <div 
                className="rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
            >
              <Plus size={iconSize * 0.35} className="text-white/60" />
            </div>
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
            <button 
                onClick={closeAddModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
            <h3 className="text-xl font-semibold text-white mb-6">Add Shortcut</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. YouTube"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">URL</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://example.com"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newUrl}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  Add Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Folder Open Modal */}
      {openFolder && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setOpenFolder(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleBackdropDrop}
          >
              <div 
                className="bg-[#1e1e1e]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-2xl font-semibold text-white/90">{openFolder.title}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest">Drag items out to separate</p>
                 </div>
                 
                 <div className="grid grid-cols-4 gap-4 justify-items-center">
                    {openFolder.children?.map(item => (
                        <div 
                            key={item.id} 
                            className="relative group flex flex-col items-center cursor-grab active:cursor-grabbing"
                            draggable={true}
                            onDragStart={(e) => handleFolderItemDragStart(e, item.id)}
                        >
                             <a
                                href={item.url}
                                className="flex flex-col items-center p-2 rounded-xl transition-transform hover:scale-105 pointer-events-none" 
                                onClick={(e) => e.preventDefault()} 
                             >
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2 overflow-hidden bg-white/5 ring-1 ring-white/10">
                                     <ShortcutIcon url={item.url} title={item.title} />
                                </div>
                                <span className="text-xs text-white/80 truncate max-w-[80px]">{item.title}</span>
                             </a>
                             <button
                                onClick={() => onRemoveFromFolder(openFolder.id, item.id)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <X size={10} />
                             </button>
                        </div>
                    ))}
                 </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ShortcutGrid;
