import React, { useState } from 'react';
import { Hash, Copy, Check, FileText } from 'lucide-react';

const Base64Encoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Base64编码
  const encodeBase64 = () => {
    if (!input.trim()) {
      setError('请输入要编码的文本');
      return;
    }
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
      setError('');
    } catch (e) {
      setError('编码失败: ' + (e as Error).message);
      setOutput('');
    }
  };

  // Base64解码
  const decodeBase64 = () => {
    if (!input.trim()) {
      setError('请输入要解码的Base64文本');
      return;
    }
    try {
      const decoded = decodeURIComponent(escape(atob(input.trim())));
      setOutput(decoded);
      setError('');
    } catch (e) {
      setError('解码失败: 无效的Base64字符串');
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
    setInput('Hello, 世界!');
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // 提取Base64数据部分
        const base64Data = base64.split(',')[1] || base64;
        setOutput(base64Data);
        setInput(`文件名: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB\n文件类型: ${file.type}`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Hash size={20} />
        Base64编解码
      </h3>
      
      <div className="space-y-4">
        {/* 输入区域 */}
        <div>
          <label className="block text-sm font-medium mb-2">输入</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入文本或Base64编码..."
            className="w-full h-32 px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 resize-none font-mono text-sm"
          />
        </div>

        {/* 按钮区域 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={encodeBase64}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            编码
          </button>
          <button
            onClick={decodeBase64}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            解码
          </button>
          <button
            onClick={swapInputOutput}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            交换
          </button>
          <button
            onClick={loadExample}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            示例
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition-colors duration-200 font-medium text-sm"
          >
            清空
          </button>
          <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200 font-medium text-sm cursor-pointer flex items-center gap-1">
            <FileText size={14} />
            文件
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </label>
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
          <p>• 编码：将文本转换为Base64格式</p>
          <p>• 解码：将Base64格式的文本转换回原始文本</p>
          <p>• 文件：上传文件获取其Base64编码</p>
        </div>
      </div>
    </div>
  );
};

export default Base64Encoder;