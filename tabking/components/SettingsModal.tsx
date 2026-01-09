
import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon, Layout, Upload, Download, Save, Settings, ExternalLink, Search } from 'lucide-react';
import { AppSettings, Shortcut } from '../types';
import { SUGGEST_SERVERS } from '../constants';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  shortcuts: Shortcut[];
  notes?: Note[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onImport: (data: { settings: AppSettings; shortcuts: Shortcut[]; notes?: Note[] }) => void;
}

type TabType = 'general' | 'background' | 'layout' | 'backup';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  shortcuts,
  notes = [],
  onUpdateSettings,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateSettings({ backgroundImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const data = {
      settings,
      shortcuts,
      notes,
      exportedAt: new Date().toISOString(),
      version: 2,
      appInfo: {
        name: 'TabKing',
        exportVersion: '2.0',
        totalShortcuts: shortcuts.length,
        totalNotes: notes.length
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabking-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateSettings = (settings: any): settings is AppSettings => {
    if (!settings || typeof settings !== 'object') return false;
    
    // 检查必需的配置项
    const requiredKeys = ['backgroundImage', 'blurLevel', 'gridConfig', 'defaultEngine', 'openInNewTab', 'suggestServer', 'customSuggestUrl', 'snowflakesEnabled'];
    const hasAllKeys = requiredKeys.every(key => key in settings);
    if (!hasAllKeys) return false;
    
    // 验证gridConfig结构
    if (!settings.gridConfig || typeof settings.gridConfig !== 'object') return false;
    const gridKeys = ['rows', 'cols', 'iconSize', 'gapX', 'gapY'];
    const hasAllGridKeys = gridKeys.every(key => key in settings.gridConfig);
    if (!hasAllGridKeys) return false;
    
    // 验证数据类型
    return (
      (settings.backgroundImage === null || typeof settings.backgroundImage === 'string') &&
      typeof settings.blurLevel === 'number' &&
      typeof settings.gridConfig.rows === 'number' &&
      typeof settings.gridConfig.cols === 'number' &&
      typeof settings.gridConfig.iconSize === 'number' &&
      typeof settings.gridConfig.gapX === 'number' &&
      typeof settings.gridConfig.gapY === 'number' &&
      typeof settings.defaultEngine === 'string' &&
      typeof settings.openInNewTab === 'boolean' &&
      typeof settings.suggestServer === 'string' &&
      typeof settings.snowflakesEnabled === 'boolean' &&
      (settings.customSuggestUrl === null || typeof settings.customSuggestUrl === 'string')
    );
  };

  const validateShortcuts = (shortcuts: any): shortcuts is Shortcut[] => {
    if (!Array.isArray(shortcuts)) return false;
    
    return shortcuts.every(shortcut => {
      if (!shortcut || typeof shortcut !== 'object') return false;
      
      const requiredKeys = ['id', 'title', 'url'];
      const hasRequiredKeys = requiredKeys.every(key => key in shortcut);
      if (!hasRequiredKeys) return false;
      
      // 验证数据类型
      return (
        typeof shortcut.id === 'string' &&
        typeof shortcut.title === 'string' &&
        typeof shortcut.url === 'string' &&
        (shortcut.icon === undefined || typeof shortcut.icon === 'string') &&
        (shortcut.type === undefined || shortcut.type === 'link' || shortcut.type === 'folder') &&
        (shortcut.children === undefined || Array.isArray(shortcut.children))
      );
    });
  };

  const validateNotes = (notes: any): notes is Note[] => {
    if (!Array.isArray(notes)) return false;
    
    return notes.every(note => {
      if (!note || typeof note !== 'object') return false;
      
      const requiredKeys = ['id', 'title', 'content', 'updatedAt'];
      const hasRequiredKeys = requiredKeys.every(key => key in note);
      if (!hasRequiredKeys) return false;
      
      return (
        typeof note.id === 'string' &&
        typeof note.title === 'string' &&
        typeof note.content === 'string' &&
        typeof note.updatedAt === 'number'
      );
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // 验证文件格式
        if (!json || typeof json !== 'object') {
          alert('无效的配置文件格式');
          return;
        }
        
        // 验证应用信息（如果有）
        if (json.appInfo && json.appInfo.name !== 'TabKing') {
          if (!confirm('此配置文件可能来自其他应用，是否继续导入？')) {
            return;
          }
        }
        
        // 验证版本兼容性（如果有版本信息，v2支持记事本）
        if (json.version && json.version > 2) {
          alert('配置文件版本过高，请更新应用后再尝试导入');
          return;
        }
        
        // 验证配置数据
        if (!validateSettings(json.settings)) {
          alert('配置文件中的设置数据无效或缺失');
          return;
        }
        
        if (!validateShortcuts(json.shortcuts)) {
          alert('配置文件中的快捷方式数据无效');
          return;
        }
        
        // 验证记事本数据（可选，v2及以上版本）
        const notes = json.version >= 2 && json.notes ? json.notes : [];
        if (notes.length > 0 && !validateNotes(notes)) {
          alert('配置文件中的记事本数据无效');
          return;
        }
        
        // 确认导入
        const shortcutCount = json.shortcuts?.length || 0;
        const notesCount = notes.length || 0;
        const confirmMessage = notesCount > 0 
          ? `确定要导入配置文件吗？\n\n这将覆盖您当前的设置、${shortcutCount}个快捷方式和${notesCount}条记事本。`
          : `确定要导入配置文件吗？\n\n这将覆盖您当前的设置和 ${shortcutCount} 个快捷方式。`;
        
        if (confirm(confirmMessage)) {
          onImport({ settings: json.settings, shortcuts: json.shortcuts, notes });
          alert('配置导入成功！');
          onClose();
        }
        
      } catch (err) {
        console.error('导入配置失败:', err);
        alert('解析配置文件失败，请检查文件格式是否正确');
      }
      // Reset input
      if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.onerror = () => {
      alert('读取文件失败');
      if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#1e1e1e]/90 backdrop-blur-2xl border border-white/10 w-full max-w-2xl h-[500px] rounded-3xl shadow-2xl flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Sidebar */}
        <div className="w-1/3 bg-white/5 border-r border-white/5 p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-8">Settings</h2>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center p-3 rounded-xl font-medium transition-colors ${
                activeTab === 'general' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={18} className="mr-3" /> General
            </button>
            <button 
              onClick={() => setActiveTab('background')}
              className={`w-full flex items-center p-3 rounded-xl font-medium transition-colors ${
                activeTab === 'background' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <ImageIcon size={18} className="mr-3" /> Background
            </button>
            <button 
              onClick={() => setActiveTab('layout')}
              className={`w-full flex items-center p-3 rounded-xl font-medium transition-colors ${
                activeTab === 'layout' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layout size={18} className="mr-3" /> Layout
            </button>
            <button 
              onClick={() => setActiveTab('backup')}
              className={`w-full flex items-center p-3 rounded-xl font-medium transition-colors ${
                activeTab === 'backup' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Save size={18} className="mr-3" /> Data & Backup
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
                {activeTab === 'general' && 'General Settings'}
                {activeTab === 'background' && 'Background & Appearance'}
                {activeTab === 'layout' && 'Grid Layout'}
                {activeTab === 'backup' && 'Import & Export'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8">
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Open in New Tab Toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Link Behavior</label>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center">
                      <ExternalLink size={18} className="text-blue-400 mr-3" />
                      <div>
                        <span className="text-white font-medium block">Open links in new tab</span>
                        <span className="text-xs text-gray-400">When enabled, bookmark links will open in a new browser tab</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onUpdateSettings({ openInNewTab: !settings.openInNewTab })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.openInNewTab ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.openInNewTab ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Search Suggestions Server */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Search Suggestions</label>
                  <div className="space-y-4">
                    {/* Server Selection */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center">
                        <Search size={18} className="text-blue-400 mr-3" />
                        <div>
                          <span className="text-white font-medium block">Suggestion Server</span>
                          <span className="text-xs text-gray-400">Choose which service to use for search suggestions</span>
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          value={settings.suggestServer}
                          onChange={(e) => onUpdateSettings({ suggestServer: e.target.value as any })}
                          className="appearance-none bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-8 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer hover:bg-white/15"
                        >
                          {Object.values(SUGGEST_SERVERS).map((server) => (
                            <option key={server.value} value={server.value} className="bg-gray-800">
                              {server.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Custom URL Input */}
                    {settings.suggestServer === 'custom' && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <label className="text-white font-medium block mb-2">Custom Suggestion URL</label>
                        <input
                          type="text"
                          value={settings.customSuggestUrl || ''}
                          onChange={(e) => onUpdateSettings({ customSuggestUrl: e.target.value || null })}
                          placeholder="https://example.com/suggest?q={query}"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Use {'{query}'} as placeholder for search query. Leave empty to disable suggestions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Snowflakes Toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Visual Effects</label>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center">
                      <div className="text-blue-400 mr-3 text-lg">❄️</div>
                      <div>
                        <span className="text-white font-medium block">Snowflakes</span>
                        <span className="text-xs text-gray-400">Show winter snowflake animation on background</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onUpdateSettings({ snowflakesEnabled: !settings.snowflakesEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.snowflakesEnabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.snowflakesEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'background' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Background Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Custom Wallpaper</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group"
                  >
                    <Upload size={32} className="text-gray-500 group-hover:text-blue-400 mb-2 transition-colors" />
                    <span className="text-sm text-gray-400 group-hover:text-gray-200">Click to upload image</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                    />
                  </div>
                  {settings.backgroundImage && (
                    <button 
                      onClick={() => onUpdateSettings({ backgroundImage: null })}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Reset to default
                    </button>
                  )}
                </div>

                {/* Blur Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                     <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Background Blur</label>
                     <span className="text-sm text-blue-400">{settings.blurLevel}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.blurLevel}
                    onChange={(e) => onUpdateSettings({ blurLevel: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                 
                 {/* Icon Size */}
                 <div className="space-y-3">
                   <div className="flex justify-between">
                     <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Icon Size</label>
                     <span className="text-sm text-blue-400">{settings.gridConfig.iconSize || 84}px</span>
                   </div>
                   <input
                    type="range"
                    min="40"
                    max="120"
                    step="4"
                    value={settings.gridConfig.iconSize || 84}
                    onChange={(e) => onUpdateSettings({ 
                        gridConfig: { ...settings.gridConfig, iconSize: parseInt(e.target.value) } 
                    })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                   />
                 </div>

                 {/* Spacing Controls */}
                 <div className="space-y-3">
                   <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Spacing</label>
                   
                   <div className="space-y-4">
                       <div>
                           <div className="flex justify-between mb-1">
                               <span className="text-xs text-gray-500">Horizontal Gap</span>
                               <span className="text-xs text-blue-400">{settings.gridConfig.gapX || 0}px</span>
                           </div>
                           <input
                            type="range"
                            min="0"
                            max="64"
                            step="4"
                            value={settings.gridConfig.gapX !== undefined ? settings.gridConfig.gapX : 0}
                            onChange={(e) => onUpdateSettings({ 
                                gridConfig: { ...settings.gridConfig, gapX: parseInt(e.target.value) } 
                            })}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                           />
                       </div>
                       
                       <div>
                           <div className="flex justify-between mb-1">
                               <span className="text-xs text-gray-500">Vertical Gap</span>
                               <span className="text-xs text-blue-400">{settings.gridConfig.gapY || 0}px</span>
                           </div>
                           <input
                            type="range"
                            min="0"
                            max="64"
                            step="4"
                            value={settings.gridConfig.gapY !== undefined ? settings.gridConfig.gapY : 0}
                            onChange={(e) => onUpdateSettings({ 
                                gridConfig: { ...settings.gridConfig, gapY: parseInt(e.target.value) } 
                            })}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                           />
                       </div>
                   </div>
                 </div>

                 {/* Columns / Rows */}
                 <div className="pt-4 border-t border-white/10">
                     <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block mb-3">Grid Dimensions</label>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs text-gray-500 mb-1 block">Columns</label>
                          <input 
                            type="number" 
                            min="3" max="10" 
                            value={settings.gridConfig.cols}
                            onChange={(e) => onUpdateSettings({ 
                              gridConfig: { ...settings.gridConfig, cols: parseInt(e.target.value) || 6 } 
                            })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                          />
                       </div>
                       <div>
                          <label className="text-xs text-gray-500 mb-1 block">Rows</label>
                          <input 
                            type="number" 
                            min="2" max="8"
                            value={settings.gridConfig.rows}
                            onChange={(e) => onUpdateSettings({ 
                              gridConfig: { ...settings.gridConfig, rows: parseInt(e.target.value) || 4 } 
                            })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                          />
                       </div>
                     </div>
                 </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Current Configuration Summary */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center mb-3">
                        <Save className="text-purple-400 mr-3" size={24} />
                        <div>
                            <h4 className="text-white font-medium">Current Configuration</h4>
                            <p className="text-xs text-gray-400">Overview of your current settings</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Shortcuts:</span>
                            <span className="text-white ml-2">{shortcuts.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Background:</span>
                            <span className="text-white ml-2">{settings.backgroundImage ? 'Custom' : 'Default'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Blur Level:</span>
                            <span className="text-white ml-2">{settings.blurLevel}px</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Grid Size:</span>
                            <span className="text-white ml-2">{settings.gridConfig.cols}×{settings.gridConfig.rows}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Icon Size:</span>
                            <span className="text-white ml-2">{settings.gridConfig.iconSize}px</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Search Engine:</span>
                            <span className="text-white ml-2">{settings.defaultEngine}</span>
                        </div>
                    </div>
                </div>

                {/* Export */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center mb-3">
                        <Download className="text-blue-400 mr-3" size={24} />
                        <div>
                            <h4 className="text-white font-medium">Export Configuration</h4>
                            <p className="text-xs text-gray-400">Save your layout, background, and shortcuts to a JSON file.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors text-sm font-medium"
                    >
                        Download Backup
                    </button>
                </div>

                {/* Import */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center mb-3">
                        <Upload className="text-green-400 mr-3" size={24} />
                        <div>
                            <h4 className="text-white font-medium">Import Configuration</h4>
                            <p className="text-xs text-gray-400">Restore settings from a previously saved JSON file.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => importInputRef.current?.click()}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium"
                    >
                        Select File...
                    </button>
                    <input 
                        type="file" 
                        ref={importInputRef}
                        accept=".json"
                        className="hidden"
                        onChange={handleImportFile}
                    />
                </div>
                
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-xs text-yellow-200">
                        <strong>⚠️ 注意:</strong> 导入将覆盖您当前的设置和快捷方式。建议在导入前导出当前配置作为备份。
                    </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;