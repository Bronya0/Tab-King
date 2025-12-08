import React, { useState } from 'react';
import { Wrench, Clock, Code, Palette, Hash, Key, X } from 'lucide-react';
import TimestampConverter from './TimestampConverter';
import JsonFormatter from './JsonFormatter';
import ColorPicker from './ColorPicker';
import Base64Encoder from './Base64Encoder';
import PasswordGenerator from './PasswordGenerator';

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
      id: 'password',
      name: '密码生成器',
      icon: <Key size={20} />,
      component: <PasswordGenerator />,
      description: '生成强密码，支持自定义规则'
    }
  ];

  const activeToolData = tools.find(tool => tool.id === activeTool);

  const renderActiveTool = () => {
    if (!activeTool) {
      return (
        <div className="text-center py-8">
          <p className="text-white/60">请选择一个工具开始使用</p>
        </div>
      );
    }
    
    return activeToolData?.component;
  };

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

      {/* 工具面板 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-4xl w-full mx-4 border border-white/10 shadow-2xl">
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-300"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">实用工具箱</h2>

            {/* 工具选择标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    activeTool === tool.id
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {tool.icon}
                  <span className="text-sm font-medium">{tool.name}</span>
                </button>
              ))}
            </div>

            {/* 工具内容 */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              {renderActiveTool()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ToolsPanel;