import React, { useState } from 'react';
import { Wrench, Clock, Code, Palette, Hash, Key, X, FileText, Binary, Image as ImageIcon, FileCheck, Calculator, QrCode } from 'lucide-react';
import TimestampConverter from './TimestampConverter';
import JsonFormatter from './JsonFormatter';
import ColorPicker from './ColorPicker';
import Base64Encoder from './Base64Encoder';
import PasswordGenerator from './PasswordGenerator';
import UnicodeEncoder from './UnicodeEncoder';
import NumberBaseConverter from './NumberBaseConverter';
import ImageCompressor from './ImageCompressor';
import FileHasher from './FileHasher';
import UnitConverter from './UnitConverter';
import QRCodeTool from './QRCodeTool';

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  description: string;
}

const ToolsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools: Tool[] = [
    {
      id: 'timestamp',
      name: '时间戳转换',
      icon: <Clock size={20} />,
      component: <TimestampConverter />,
      description: '日期时间、秒时间戳、毫秒时间戳互相转换'
    },
    {
      id: 'json',
      name: 'JSON格式化',
      icon: <Code size={20} />,
      component: <JsonFormatter />,
      description: 'JSON数据的格式化和压缩'
    },
    {
      id: 'color',
      name: '取色器',
      icon: <Palette size={20} />,
      component: <ColorPicker />,
      description: '颜色选择、格式转换和图片取色'
    },
    {
      id: 'base64',
      name: 'Base64编解码',
      icon: <Hash size={20} />,
      component: <Base64Encoder />,
      description: '文本和文件的Base64编码解码'
    },
    {
      id: 'unicode',
      name: 'Unicode编解码',
      icon: <FileText size={20} />,
      component: <UnicodeEncoder />,
      description: 'Unicode转义序列和HTML实体编解码'
    },
    {
      id: 'numberbase',
      name: '进制转换器',
      icon: <Binary size={20} />,
      component: <NumberBaseConverter />,
      description: '二进制、十进制、十六进制互相转换'
    },
    {
      id: 'imagecompress',
      name: '图片压缩',
      icon: <ImageIcon size={20} />,
      component: <ImageCompressor />,
      description: '使用Canvas压缩图片，支持多种格式'
    },
    {
      id: 'filehasher',
      name: '文件哈希',
      icon: <FileCheck size={20} />,
      component: <FileHasher />,
      description: '计算文件的MD5和SHA256哈希值'
    },
    {
      id: 'unitconverter',
      name: '单位换算器',
      icon: <Calculator size={20} />,
      component: <UnitConverter />,
      description: '长度、重量、温度、面积、体积、速度等单位转换'
    },
    {
      id: 'qrcode',
      name: '二维码工具',
      icon: <QrCode size={20} />,
      component: <QRCodeTool />,
      description: '二维码生成和解码，支持拖拽图片'
    },
    {
      id: 'password',
      name: '密码生成器',
      icon: <Key size={20} />,
      component: <PasswordGenerator />,
      description: '生成强密码，支持自定义规则'
    }
  ];

  const activeToolData = tools.find(tool => tool.id === activeTool);

  return (
    <>
      {/* 工具按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white/60 hover:text-white transition-all duration-300 group shadow-lg border border-white/5"
        title="工具箱"
      >
        <Wrench size={20} className="group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {/* 工具面板 - 新布局 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* 背景遮罩 */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* 工具面板容器 */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl m-4 rounded-2xl flex w-full max-w-6xl mx-auto">
            {/* 左侧菜单 */}
            <div className="w-80 flex flex-col border-r border-white/10">
              {/* 头部 */}
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">实用工具箱</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* 工具列表 - 可滚动 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center gap-3 text-left ${
                        activeTool === tool.id
                          ? 'bg-blue-600/20 text-white border border-blue-500/30'
                          : 'bg-white/5 text-white/80 hover:bg-white/10 border border-transparent hover:border-white/10'
                      }`}
                    >
                      <div className="flex-shrink-0">{tool.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tool.name}</div>
                        <div className="text-xs text-white/60 mt-1 line-clamp-2">{tool.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧内容区域 */}
            <div className="flex-1 flex flex-col">
              {/* 内容头部 */}
              {activeToolData && (
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-400">{activeToolData.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{activeToolData.name}</h3>
                      <p className="text-sm text-white/60">{activeToolData.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 工具内容 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {activeToolData ? (
                    <div className="animate-fade-in">
                      {activeToolData.component}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                      <div className="text-center">
                        <Wrench size={48} className="text-white/30 mx-auto mb-4" />
                        <p className="text-white/60">请从左侧选择一个工具开始使用</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ToolsPanel;