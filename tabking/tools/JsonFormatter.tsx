import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // 格式化JSON
  const formatJSON = () => {
    if (!input.trim()) {
      setError('请输入JSON数据');
      return;
    }

    try {
      // 尝试解析JSON
      const parsed = JSON.parse(input.trim());
      // 重新格式化，使用2个空格缩进
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
    } catch (e) {
      setError('JSON格式错误: ' + (e as Error).message);
      setOutput('');
    }
  };

  // 压缩JSON
  const minifyJSON = () => {
    if (!input.trim()) {
      setError('请输入JSON数据');
      return;
    }

    try {
      const parsed = JSON.parse(input.trim());
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (e) {
      setError('JSON格式错误: ' + (e as Error).message);
      setOutput('');
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        setError('复制失败');
      }
    }
  };

  // 清空输入输出
  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  // 示例JSON
  const loadExample = () => {
    const example = {
      "name": "示例",
      "version": "1.0.0",
      "description": "这是一个JSON格式化示例",
      "features": ["格式化", "压缩", "验证"],
      "config": {
        "indent": 2,
        "sortKeys": false
      }
    };
    setInput(JSON.stringify(example));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Code size={20} />
        JSON格式化工具
      </h3>
      
      <div className="space-y-4">
        {/* 输入区域 */}
        <div>
          <label className="block text-sm font-medium mb-2">输入JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入JSON数据..."
            className="w-full h-32 px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 resize-none font-mono text-sm"
          />
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={formatJSON}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            格式化
          </button>
          <button
            onClick={minifyJSON}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            压缩
          </button>
          <button
            onClick={loadExample}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            示例
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            清空
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* 输出区域 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">输出结果</label>
            {output && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化结果将显示在这里..."
            className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 resize-none font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;