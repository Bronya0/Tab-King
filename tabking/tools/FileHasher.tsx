import React, { useState, DragEvent, useRef } from 'react';
import { Hash, Upload, File, Copy, Check, RefreshCw } from 'lucide-react';
import CryptoJS from 'crypto-js';

interface HashResult {
  file: File;
  md5: string;
  sha256: string;
  size: number;
  name: string;
}

const FileHasher: React.FC = () => {
  const [hashResults, setHashResults] = useState<HashResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 计算文件的MD5哈希值
  const calculateMD5 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          // 使用crypto-js计算MD5
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
          const hash = CryptoJS.MD5(wordArray);
          resolve(hash.toString());
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 计算文件的SHA256哈希值
  const calculateSHA256 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          // 使用crypto-js计算SHA256
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
          const hash = CryptoJS.SHA256(wordArray);
          resolve(hash.toString());
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 处理文件
  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    
    try {
      const results: HashResult[] = [];
      
      for (const file of Array.from(files)) {
        try {
          const [md5, sha256] = await Promise.all([
            calculateMD5(file),
            calculateSHA256(file)
          ]);
          
          results.push({
            file,
            md5,
            sha256,
            size: file.size,
            name: file.name
          });
        } catch (error) {
          console.error(`处理文件 ${file.name} 失败:`, error);
        }
      }
      
      setHashResults(prev => [...prev, ...results]);
    } catch (error) {
      alert('处理文件失败：' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  // 拖拽处理
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      alert('复制失败');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 清空所有结果
  const clearAll = () => {
    setHashResults([]);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Hash size={20} />
          文件哈希值计算器
        </h3>
        {hashResults.length > 0 && (
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 font-medium text-sm"
          >
            清空
          </button>
        )}
      </div>

      {/* 文件上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/30 hover:border-white/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <Upload size={48} className="text-white/60" />
          <div>
            <p className="text-lg font-medium mb-1">拖拽文件到此处</p>
            <p className="text-sm text-white/60 mb-4">或点击选择文件</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 font-medium"
            >
              选择文件
            </button>
          </div>
          <p className="text-xs text-white/40">
            支持任意文件格式，计算 MD5 和 SHA256 哈希值
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 处理状态 */}
      {isProcessing && (
        <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center">
          <p className="text-blue-200">正在计算哈希值...</p>
        </div>
      )}

      {/* 哈希值结果 */}
      {hashResults.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-4">计算结果</h4>
          <div className="space-y-4">
            {hashResults.map((result, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <File size={16} className="text-white/60" />
                    <span className="font-medium truncate">{result.name}</span>
                  </div>
                  <span className="text-sm text-white/60">{formatFileSize(result.size)}</span>
                </div>
                
                {/* MD5 */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white/80">MD5</span>
                    <button
                      onClick={() => copyToClipboard(result.md5, `md5-${index}`)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200"
                    >
                      {copied === `md5-${index}` ? <Check size={12} /> : <Copy size={12} />}
                      {copied === `md5-${index}` ? '已复制' : '复制'}
                    </button>
                  </div>
                  <div className="bg-white/10 rounded-md p-2 font-mono text-xs break-all">
                    {result.md5}
                  </div>
                </div>

                {/* SHA256 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white/80">SHA256</span>
                    <button
                      onClick={() => copyToClipboard(result.sha256, `sha256-${index}`)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors duration-200"
                    >
                      {copied === `sha256-${index}` ? <Check size={12} /> : <Copy size={12} />}
                      {copied === `sha256-${index}` ? '已复制' : '复制'}
                    </button>
                  </div>
                  <div className="bg-white/10 rounded-md p-2 font-mono text-xs break-all">
                    {result.sha256}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-6 text-xs text-white/70 space-y-1">
        <p>• 支持拖拽或选择多个文件同时计算哈希值</p>
        <p>• MD5：32位十六进制字符串，常用于文件完整性校验</p>
        <p>• SHA256：64位十六进制字符串，安全性更高</p>
        <p>• 点击复制按钮可将哈希值复制到剪贴板</p>
        <p>• 计算过程在浏览器本地完成，文件不会上传到服务器</p>
      </div>
    </div>
  );
};

export default FileHasher;