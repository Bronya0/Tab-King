
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Github } from 'lucide-react';
import SearchBar from './components/SearchBar';
import ShortcutGrid from './components/ShortcutGrid';
import SettingsModal from './components/SettingsModal';
import { AppSettings, SearchEngineType, Shortcut, DEFAULT_SHORTCUTS } from './types';
import { preloadSearchEngineFavicons } from './constants';
import { ToolsPanel } from './tools';

const STORAGE_KEY = 'aerotab_settings';
const SHORTCUTS_KEY = 'aerotab_shortcuts';

const DEFAULT_SETTINGS: AppSettings = {
  backgroundImage: null,
  blurLevel: 1, 
  gridConfig: { rows: 4, cols: 8, iconSize: 84, gapX: 0, gapY: 0 },
  defaultEngine: SearchEngineType.GOOGLE,
  openInNewTab: true,
  suggestServer: 'auto',
  customSuggestUrl: null,
};

function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    const saved = localStorage.getItem(SHORTCUTS_KEY);
    const loadedShortcuts = saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
    
    // 调试：检查加载的快捷方式数据
    console.log('Loaded shortcuts:', loadedShortcuts);
    
    return loadedShortcuts;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  // Preload search engine favicons on app load (now using local icons, no network requests)
  useEffect(() => {
    preloadSearchEngineFavicons().catch(console.error);
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 禁用F12和右键菜单（仅在生产环境）
  useEffect(() => {
    // 检查是否为生产环境（打包后的版本）
    const isProduction = !window.location.href.includes('localhost') && !window.location.href.includes('127.0.0.1');
    
    if (isProduction) {
      // 禁用F12键和开发者工具快捷键
      const handleKeyDown = (e: KeyboardEvent) => {
        // 禁用F12
        if (e.key === 'F12') {
          e.preventDefault();
          console.log('F12 is disabled in production mode');
          return;
        }
        
        // 禁用Ctrl+Shift+I (开发者工具)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
          e.preventDefault();
          console.log('Ctrl+Shift+I is disabled in production mode');
          return;
        }
        
        // 禁用Ctrl+Shift+J (控制台)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.keyCode === 74)) {
          e.preventDefault();
          console.log('Ctrl+Shift+J is disabled in production mode');
          return;
        }
        
        // 禁用Ctrl+U (查看源代码)
        if (e.ctrlKey && (e.key === 'U' || e.keyCode === 85)) {
          e.preventDefault();
          console.log('Ctrl+U is disabled in production mode');
          return;
        }
      };

      // 禁用右键菜单
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        console.log('Right-click menu is disabled in production mode');
      };

      // 添加事件监听器
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);

      // 清理函数
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
  }, [shortcuts]);

  const updateSettings = (newPartial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newPartial }));
  };

  const addShortcut = (shortcut: Shortcut) => {
    setShortcuts(prev => [...prev, shortcut]);
  };

  const removeShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  };

  const editShortcut = (id: string, title: string, url: string) => {
    setShortcuts(prev => prev.map(s => 
      s.id === id ? { ...s, title, url } : s
    ));
  };

  // Reorder logic
  const handleReorder = (dragId: string, targetId: string) => {
    setShortcuts(prev => {
        const dragIndex = prev.findIndex(s => s.id === dragId);
        const targetIndex = prev.findIndex(s => s.id === targetId);
        
        if (dragIndex === -1 || targetIndex === -1 || dragIndex === targetIndex) return prev;

        const newShortcuts = [...prev];
        const [removed] = newShortcuts.splice(dragIndex, 1);
        newShortcuts.splice(targetIndex, 0, removed);
        
        return newShortcuts;
    });
  };

  // Merge logic for Drag and Drop
  const handleMerge = (dragId: string, dropId: string) => {
    setShortcuts(prev => {
      const draggedItem = prev.find(s => s.id === dragId);
      const dropTarget = prev.find(s => s.id === dropId);
      
      // If items not found or dragging folder onto folder (optional restriction), return
      if (!draggedItem || !dropTarget || draggedItem.id === dropTarget.id) return prev;
      
      // 调试：检查拖拽的数据
      console.log('handleMerge - draggedItem:', draggedItem);
      console.log('handleMerge - dropTarget:', dropTarget);
      
      // Prevent nesting folders inside folders for simplicity in this version
      if (draggedItem.type === 'folder' && dropTarget.type === 'folder') {
          return prev;
      }

      // Remove dragged item from root list
      const newShortcuts = prev.filter(s => s.id !== dragId);
      const targetIndex = newShortcuts.findIndex(s => s.id === dropId);

      if (targetIndex === -1) return prev;

      if (dropTarget.type === 'folder') {
         // Add to existing folder
         const updatedFolder = {
             ...dropTarget,
             children: [...(dropTarget.children || []), draggedItem]
         };
         newShortcuts[targetIndex] = updatedFolder;
      } else {
         // Create new folder containing both
         const newFolder: Shortcut = {
             id: `folder-${Date.now()}`,
             title: 'Folder',
             url: '',
             type: 'folder',
             children: [dropTarget, draggedItem]
         };
         newShortcuts[targetIndex] = newFolder;
      }
      return newShortcuts;
    });
  };

  // Handle removing an item from inside a folder
  const handleRemoveFromFolder = (folderId: string, itemId: string) => {
      setShortcuts(prev => {
          return prev.map(s => {
              if (s.id === folderId && s.children) {
                  const newChildren = s.children.filter(c => c.id !== itemId);
                  // If folder empty, we keep it empty or remove it. Let's keep it.
                  return { ...s, children: newChildren };
              }
              return s;
          }).filter(s => s.type !== 'folder' || (s.children && s.children.length > 0)); 
      })
  }

  // Handle moving item out of folder back to root
  const handleMoveToRoot = (folderId: string, itemId: string) => {
      setShortcuts(prev => {
          const folder = prev.find(s => s.id === folderId);
          if (!folder || !folder.children) return prev;

          const itemToMove = folder.children.find(c => c.id === itemId);
          if (!itemToMove) return prev;

          // Remove from folder
          const updatedShortcuts = prev.map(s => {
              if (s.id === folderId && s.children) {
                  return { ...s, children: s.children.filter(c => c.id !== itemId) };
              }
              return s;
          }).filter(s => s.type !== 'folder' || (s.children && s.children.length > 0)); // Clean up empty folders

          // Add to root
          return [...updatedShortcuts, itemToMove];
      });
  };

  const handleImport = (data: { settings: AppSettings; shortcuts: Shortcut[] }) => {
    if (data.settings) setSettings(data.settings);
    if (data.shortcuts) setShortcuts(data.shortcuts);
  };

  const handleEngineChange = (type: SearchEngineType) => {
    updateSettings({ defaultEngine: type });
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-start overflow-hidden">
      
      {/* Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: settings.backgroundImage 
            ? `url(${settings.backgroundImage})` 
            : 'url(/bg.jpg)',
          filter: `blur(${settings.blurLevel}px) brightness(0.8)`,
          transform: 'scale(1.05)' 
        }}
      />
      
      {/* Overlay for contrast */}
      <div className="fixed inset-0 z-0 bg-black/20" />

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center max-w-5xl px-4 gap-8 pt-[10vh]">
        
        {/* Clock */}
        <div className="text-center">
          <h1 className="text-6xl font-light text-white tracking-tight drop-shadow-lg select-none">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <p className="text-base text-white/70 font-light tracking-widest uppercase mt-1 select-none">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Search */}
        <SearchBar 
          currentEngine={settings.defaultEngine} 
          onEngineChange={handleEngineChange}
          suggestServer={settings.suggestServer}
          customSuggestUrl={settings.customSuggestUrl}
        />

        {/* Shortcuts */}
        <ShortcutGrid 
          shortcuts={shortcuts} 
          gridConfig={settings.gridConfig}
          openInNewTab={settings.openInNewTab}
          onAddShortcut={addShortcut}
          onRemoveShortcut={removeShortcut}
          onEditShortcut={editShortcut}
          onReorderShortcuts={handleReorder}
          onMergeShortcuts={handleMerge}
          onRemoveFromFolder={handleRemoveFromFolder}
          onMoveToRoot={handleMoveToRoot}
        />
      </div>

      {/* Top Right Controls */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        {/* Settings Toggle */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/60 hover:text-white transition-all duration-300 group shadow-lg border border-white/5"
          title="设置"
        >
          <SettingsIcon size={20} className="group-hover:rotate-45 transition-transform duration-500" />
        </button>

        {/* Tools Toggle */}
        <ToolsPanel />

        {/* Copyright Info - GitHub */}
        <a 
          href="https://github.com/Bronya0/Tab-King" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/60 hover:text-white transition-all duration-300 group shadow-lg border border-white/5"
          title="GitHub项目"
        >
          <Github size={20} className="group-hover:rotate-12 transition-transform duration-300" />
        </a>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        shortcuts={shortcuts}
        onUpdateSettings={updateSettings}
        onImport={handleImport}
      />


    </div>
  );
}

export default App;