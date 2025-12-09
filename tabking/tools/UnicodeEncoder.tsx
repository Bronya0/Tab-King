import React, { useState } from 'react';
import { Hash, Copy, Check } from 'lucide-react';

const UnicodeEncoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Unicode编码（转换为\uXXXX格式）
  const encodeUnicode = () => {
    if (!input.trim()) {
      setError('请输入要编码的文本');
      return;
    }
    try {
      const encoded = input.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code > 127) {
          return '\\u' + ('0000' + code.toString(16)).slice(-4);
        }
        return char;
      }).join('');
      setOutput(encoded);
      setError('');
    } catch (e) {
      setError('编码失败: ' + (e as Error).message);
      setOutput('');
    }
  };

  // Unicode解码（从\uXXXX格式转换回来）
  const decodeUnicode = () => {
    if (!input.trim()) {
      setError('请输入要解码的Unicode文本');
      return;
    }
    try {
      const decoded = input.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      setOutput(decoded);
      setError('');
    } catch (e) {
      setError('解码失败: 无效的Unicode字符串');
      setOutput('');
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      setError('复制失败');
    }
  };

  // 清空输入输出
  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  // 交换输入输出
  const swapInputOutput = () => {
    setInput(output);
    setOutput(input);
    setError('');
  };

  // 加载示例
  const loadExample = () => {
    setInput('Hello, 世界! 🌍');
  };

  // 转换为HTML实体
  const toHtmlEntities = () => {
    if (!input.trim()) {
      setError('请输入要转换的文本');
      return;
    }
    try {
      const entities = input.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code > 127) {
          return '&#' + code + ';';
        }
        return char;
      }).join('');
      setOutput(entities);
      setError('');
    } catch (e) {
      setError('转换失败: ' + (e as Error).message);
      setOutput('');
    }
  };

  // 从HTML实体转换
  const fromHtmlEntities = () => {
    if (!input.trim()) {
      setError('请输入要转换的HTML实体');
      return;
    }
    try {
      const temp = document.createElement('div');
      temp.innerHTML = input;
      setOutput(temp.textContent || temp.innerText || '');
      setError('');
    } catch (e) {
      setError('转换失败: 无效的HTML实体');
      setOutput('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Hash size={20} />
        Unicode编解码
      </h3>
      
      <div className="space-y-4">
        {/* 输入区域 */}
        <div>
          <label className="block text-sm font-medium mb-2">输入</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入文本或Unicode编码..."
            className="w-full h-32 px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 resize-none font-mono text-sm"
          />
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={encodeUnicode}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            编码\uXXXX
          </button>
          <button
            onClick={decodeUnicode}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            解码\uXXXX
          </button>
          <button
            onClick={toHtmlEntities}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            HTML实体
          </button>
          <button
            onClick={fromHtmlEntities}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            解析HTML实体
          </button>
          <button
            onClick={swapInputOutput}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            交换
          </button>
          <button
            onClick={loadExample}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors duration-200 font-medium text-sm"
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
                onClick={() => copyToClipboard(output)}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200"
              >
                {copied === output ? <Check size={12} /> : <Copy size={12} />}
                {copied === output ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="编码/解码结果将显示在这里..."
            className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 resize-none font-mono text-sm"
          />
        </div>

        {/* 说明 */}
        <div className="text-xs text-white/70 space-y-1">
          <p>• 编码\uXXXX：将非ASCII字符转换为Unicode转义序列</p>
          <p>• 解码\uXXXX：将Unicode转义序列转换回原始字符</p>
          <p>• HTML实体：将字符转换为HTML实体格式（&amp;#XXXX;）</p>
          <p>• 解析HTML实体：将HTML实体转换回原始字符</p>
        </div>
      </div>
    </div>
  );
};

export default UnicodeEncoder;