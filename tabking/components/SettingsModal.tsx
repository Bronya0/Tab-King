
import React, { useRef, useState } from 'react';
import { X, Image as ImageIcon, Layout, Upload, Download, Save } from 'lucide-react';
import { AppSettings, Shortcut } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  shortcuts: Shortcut[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onImport: (data: { settings: AppSettings; shortcuts: Shortcut[] }) => void;
}

type TabType = 'background' | 'layout' | 'backup';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  shortcuts,
  onUpdateSettings,
  onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('background');

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
      exportedAt: new Date().toISOString(),
      version: 1
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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.settings && Array.isArray(json.shortcuts)) {
            // Basic validation
            onImport({ settings: json.settings, shortcuts: json.shortcuts });
            alert('Configuration loaded successfully!');
            onClose();
        } else {
            alert('Invalid configuration file format.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse the configuration file.');
      }
      // Reset input
      if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e]/90 backdrop-blur-2xl border border-white/10 w-full max-w-2xl h-[500px] rounded-3xl shadow-2xl flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-1/3 bg-white/5 border-r border-white/5 p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-8">Settings</h2>
          <div className="space-y-2">
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
                {activeTab === 'background' && 'Background & Appearance'}
                {activeTab === 'layout' && 'Grid Layout'}
                {activeTab === 'backup' && 'Import & Export'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8">
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
                
                <p className="text-xs text-gray-500 text-center">
                    Note: Importing will overwrite your current settings and shortcuts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
