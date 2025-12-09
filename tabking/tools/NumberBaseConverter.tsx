import React, { useState } from 'react';
import { Hash, Copy, Check, RefreshCw } from 'lucide-react';

const NumberBaseConverter: React.FC = () => {
  const [binary, setBinary] = useState('');
  const [decimal, setDecimal] = useState('');
  const [hexadecimal, setHexadecimal] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');

  // 验证二进制输入
  const validateBinary = (value: string): boolean => {
    return /^[01]*$/.test(value);
  };

  // 验证十进制输入
  const validateDecimal = (value: string): boolean => {
    return /^\d*$/.test(value);
  };

  // 验证十六进制输入
  const validateHexadecimal = (value: string): boolean => {
    return /^[0-9a-fA-F]*$/.test(value);
  };

  // 二进制转十进制
  const binaryToDecimal = (binary: string): string => {
    if (!binary) return '';
    return parseInt(binary, 2).toString();
  };

  // 十进制转二进制
  const decimalToBinary = (decimal: string): string => {
    if (!decimal) return '';
    const num = parseInt(decimal, 10);
    if (isNaN(num)) return '';
    return num.toString(2);
  };

  // 十进制转十六进制
  const decimalToHexadecimal = (decimal: string): string => {
    if (!decimal) return '';
    const num = parseInt(decimal, 10);
    if (isNaN(num)) return '';
    return num.toString(16).toUpperCase();
  };

  // 十六进制转十进制
  const hexadecimalToDecimal = (hex: string): string => {
    if (!hex) return '';
    return parseInt(hex, 16).toString();
  };

  // 二进制转十六进制
  const binaryToHexadecimal = (binary: string): string => {
    if (!binary) return '';
    const decimal = parseInt(binary, 2);
    return decimal.toString(16).toUpperCase();
  };

  // 十六进制转二进制
  const hexadecimalToBinary = (hex: string): string => {
    if (!hex) return '';
    const decimal = parseInt(hex, 16);
    return decimal.toString(2);
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      setError('复制失败');
    }
  };

  // 清空所有输入
  const clearAll = () => {
    setBinary('');
    setDecimal('');
    setHexadecimal('');
    setError('');
  };

  // 加载示例
  const loadExample = () => {
    setDecimal('255');
    setBinary('11111111');
    setHexadecimal('FF');
    setError('');
  };

  // 处理二进制输入变化
  const handleBinaryChange = (value: string) => {
    setError('');
    if (!validateBinary(value)) {
      setError('二进制只能包含 0 和 1');
      return;
    }
    setBinary(value);
    if (value) {
      const dec = binaryToDecimal(value);
      const hex = binaryToHexadecimal(value);
      setDecimal(dec);
      setHexadecimal(hex);
    } else {
      setDecimal('');
      setHexadecimal('');
    }
  };

  // 处理十进制输入变化
  const handleDecimalChange = (value: string) => {
    setError('');
    if (!validateDecimal(value)) {
      setError('十进制只能包含数字 0-9');
      return;
    }
    setDecimal(value);
    if (value) {
      const bin = decimalToBinary(value);
      const hex = decimalToHexadecimal(value);
      setBinary(bin);
      setHexadecimal(hex);
    } else {
      setBinary('');
      setHexadecimal('');
    }
  };

  // 处理十六进制输入变化
  const handleHexadecimalChange = (value: string) => {
    setError('');
    if (!validateHexadecimal(value)) {
      setError('十六进制只能包含 0-9 和 A-F');
      return;
    }
    setHexadecimal(value.toUpperCase());
    if (value) {
      const dec = hexadecimalToDecimal(value);
      const bin = hexadecimalToBinary(value);
      setDecimal(dec);
      setBinary(bin);
    } else {
      setDecimal('');
      setBinary('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Hash size={20} />
        进制转换器
      </h3>
      
      <div className="space-y-4">
        {/* 二进制输入 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">二进制 (Binary)</label>
            {binary && (
              <button
                onClick={() => copyToClipboard(binary, 'binary')}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200"
              >
                {copied === 'binary' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'binary' ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <input
            type="text"
            value={binary}
            onChange={(e) => handleBinaryChange(e.target.value)}
            placeholder="输入二进制数 (例如: 101010)"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 font-mono text-sm"
          />
        </div>

        {/* 十进制输入 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">十进制 (Decimal)</label>
            {decimal && (
              <button
                onClick={() => copyToClipboard(decimal, 'decimal')}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200"
              >
                {copied === 'decimal' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'decimal' ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <input
            type="text"
            value={decimal}
            onChange={(e) => handleDecimalChange(e.target.value)}
            placeholder="输入十进制数 (例如: 42)"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 font-mono text-sm"
          />
        </div>

        {/* 十六进制输入 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">十六进制 (Hexadecimal)</label>
            {hexadecimal && (
              <button
                onClick={() => copyToClipboard(hexadecimal, 'hexadecimal')}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200"
              >
                {copied === 'hexadecimal' ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'hexadecimal' ? '已复制' : '复制'}
              </button>
            )}
          </div>
          <input
            type="text"
            value={hexadecimal}
            onChange={(e) => handleHexadecimalChange(e.target.value)}
            placeholder="输入十六进制数 (例如: 2A)"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50 font-mono text-sm"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={loadExample}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 font-medium text-sm"
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

        {/* 使用说明 */}
        <div className="text-xs text-white/70 space-y-1">
          <p>• 在任意输入框中输入数字，其他进制会自动转换</p>
          <p>• 二进制：只能包含 0 和 1</p>
          <p>• 十进制：只能包含数字 0-9</p>
          <p>• 十六进制：只能包含 0-9 和 A-F</p>
          <p>• 支持大数转换，但请注意JavaScript的数值范围限制</p>
        </div>
      </div>
    </div>
  );
};

export default NumberBaseConverter;