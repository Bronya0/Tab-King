import React, { useState, useCallback } from 'react';
import { Key, Copy, Check, RefreshCw } from 'lucide-react';

const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  // 字符集
  const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  // 生成密码
  const generatePassword = useCallback(() => {
    let charset = '';
    if (includeUppercase) charset += CHAR_SETS.uppercase;
    if (includeLowercase) charset += CHAR_SETS.lowercase;
    if (includeNumbers) charset += CHAR_SETS.numbers;
    if (includeSymbols) charset += CHAR_SETS.symbols;

    if (charset === '') {
      setPassword('请至少选择一种字符类型');
      return;
    }

    let generatedPassword = '';
    
    // 确保每种选中的字符类型至少出现一次
    if (includeUppercase) {
      generatedPassword += CHAR_SETS.uppercase[Math.floor(Math.random() * CHAR_SETS.uppercase.length)];
    }
    if (includeLowercase) {
      generatedPassword += CHAR_SETS.lowercase[Math.floor(Math.random() * CHAR_SETS.lowercase.length)];
    }
    if (includeNumbers) {
      generatedPassword += CHAR_SETS.numbers[Math.floor(Math.random() * CHAR_SETS.numbers.length)];
    }
    if (includeSymbols) {
      generatedPassword += CHAR_SETS.symbols[Math.floor(Math.random() * CHAR_SETS.symbols.length)];
    }

    // 填充剩余长度
    for (let i = generatedPassword.length; i < length; i++) {
      generatedPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    // 打乱密码字符顺序
    const shuffledPassword = generatedPassword.split('').sort(() => Math.random() - 0.5).join('');
    setPassword(shuffledPassword);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (password && password !== '请至少选择一种字符类型') {
      try {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('复制失败:', e);
      }
    }
  };

  // 计算密码强度
  const getPasswordStrength = () => {
    let strength = 0;
    if (includeUppercase) strength++;
    if (includeLowercase) strength++;
    if (includeNumbers) strength++;
    if (includeSymbols) strength++;
    if (length >= 12) strength++;
    if (length >= 16) strength++;

    if (strength <= 2) return { level: '弱', color: 'text-red-400' };
    if (strength <= 4) return { level: '中等', color: 'text-yellow-400' };
    return { level: '强', color: 'text-green-400' };
  };

  // 生成熵值（随机性度量）
  const getEntropy = () => {
    let charsetSize = 0;
    if (includeUppercase) charsetSize += 26;
    if (includeLowercase) charsetSize += 26;
    if (includeNumbers) charsetSize += 10;
    if (includeSymbols) charsetSize += CHAR_SETS.symbols.length;

    if (charsetSize === 0) return 0;
    return Math.round(length * Math.log2(charsetSize));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Key size={20} />
        密码生成器
      </h3>
      
      <div className="space-y-4">
        {/* 密码显示 */}
        <div>
          <label className="block text-sm font-medium mb-2">生成的密码</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={password}
              readOnly
              className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white font-mono text-sm focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              disabled={!password || password === '请至少选择一种字符类型'}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors duration-200 flex items-center gap-1"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={generatePassword}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 flex items-center gap-1"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* 密码强度 */}
        {password && password !== '请至少选择一种字符类型' && (
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2">
              密码强度:
              <span className={getPasswordStrength().color}>
                {getPasswordStrength().level}
              </span>
            </span>
            <span className="text-white/70">
              熵值: {getEntropy()} bits
            </span>
          </div>
        )}

        {/* 密码长度 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            密码长度: {length}
          </label>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>4</span>
            <span>64</span>
          </div>
        </div>

        {/* 字符类型选项 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">包含字符类型</label>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/20 border border-white/30 rounded focus:ring-blue-500"
              />
              <span className="text-sm">大写字母 (A-Z)</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/20 border border-white/30 rounded focus:ring-blue-500"
              />
              <span className="text-sm">小写字母 (a-z)</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/20 border border-white/30 rounded focus:ring-blue-500"
              />
              <span className="text-sm">数字 (0-9)</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/20 border border-white/30 rounded focus:ring-blue-500"
              />
              <span className="text-sm">特殊字符 (!@#$%^&*...)</span>
            </label>
          </div>
        </div>

        {/* 生成按钮 */}
        <button
          onClick={generatePassword}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 font-medium flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          生成新密码
        </button>

        {/* 使用建议 */}
        <div className="text-xs text-white/70 space-y-1">
          <p>• 建议密码长度至少12位</p>
          <p>• 包含多种字符类型可提高安全性</p>
          <p>• 熵值越高，密码越难被破解</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;