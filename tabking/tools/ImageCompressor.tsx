import React, { useState, useRef, DragEvent } from 'react';
import { Image, Download, Trash2, Settings, Upload } from 'lucide-react';

interface CompressionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface CompressedImage {
  originalFile: File;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  preview: string;
}

const ImageCompressor: React.FC = () => {
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<CompressionOptions>({
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'image/jpeg'
  });
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 支持的图片格式
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

  // 压缩图片
  const compressImage = async (file: File): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const img = document.createElement('img');
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('无法创建canvas上下文'));
              return;
            }

            // 计算压缩后的尺寸
            let { width, height } = img;
            const maxWidth = options.maxWidth;
            const maxHeight = options.maxHeight;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;

            // 绘制图片
            ctx.drawImage(img, 0, 0, width, height);

            // 转换为blob
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('压缩失败'));
                  return;
                }

                const preview = canvas.toDataURL(options.format, options.quality);
                const compressionRatio = ((file.size - blob.size) / file.size) * 100;

                resolve({
                  originalFile: file,
                  compressedBlob: blob,
                  originalSize: file.size,
                  compressedSize: blob.size,
                  compressionRatio,
                  preview
                });
              },
              options.format,
              options.quality
            );
          };
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = e.target?.result as string;
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsDataURL(file);
    });
  };

  // 处理文件选择
  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      supportedTypes.includes(file.type)
    );

    if (validFiles.length === 0) {
      alert('请选择支持的图片格式：JPEG, PNG, WebP, GIF, BMP');
      return;
    }

    setIsProcessing(true);
    
    try {
      const results = await Promise.all(
        validFiles.map(file => compressImage(file))
      );
      
      setCompressedImages(prev => [...prev, ...results]);
    } catch (error) {
      alert('压缩失败：' + (error as Error).message);
    } finally {
      setIsProcessing(false);
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
      handleFileSelect(files);
    }
  };

  // 下载压缩后的图片
  const downloadImage = (image: CompressedImage) => {
    const url = URL.createObjectURL(image.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    
    // 生成文件名
    const originalName = image.originalFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const ext = options.format.split('/')[1];
    a.download = `${nameWithoutExt}_compressed.${ext}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 删除图片
  const removeImage = (index: number) => {
    setCompressedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Image size={20} />
          图片压缩工具
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
          title="压缩设置"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="font-medium mb-3">压缩设置</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">输出格式</label>
              <select
                value={options.format}
                onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">压缩质量 ({Math.round(options.quality * 100)}%)</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={options.quality}
                onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">最大宽度 (px)</label>
              <input
                type="number"
                value={options.maxWidth}
                onChange={(e) => setOptions(prev => ({ ...prev, maxWidth: parseInt(e.target.value) || 1920 }))}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">最大高度 (px)</label>
              <input
                type="number"
                value={options.maxHeight}
                onChange={(e) => setOptions(prev => ({ ...prev, maxHeight: parseInt(e.target.value) || 1080 }))}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
          </div>
        </div>
      )}

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
            <p className="text-lg font-medium mb-1">拖拽图片到此处</p>
            <p className="text-sm text-white/60 mb-4">或点击选择文件</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 font-medium"
            >
              选择图片
            </button>
          </div>
          <p className="text-xs text-white/40">
            支持格式：JPEG, PNG, WebP, GIF, BMP
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
      />

      {/* 处理状态 */}
      {isProcessing && (
        <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-center">
          <p className="text-blue-200">正在压缩图片...</p>
        </div>
      )}

      {/* 压缩结果 */}
      {compressedImages.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-4">压缩结果</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compressedImages.map((image, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="mb-3">
                  <img
                    src={image.preview}
                    alt="预览"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">文件名:</span>
                    <span className="truncate ml-2">{image.originalFile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">原始大小:</span>
                    <span>{formatFileSize(image.originalSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">压缩后:</span>
                    <span>{formatFileSize(image.compressedSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">压缩率:</span>
                    <span className="text-green-400">{image.compressionRatio.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => downloadImage(image)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 font-medium text-sm flex items-center justify-center gap-1"
                  >
                    <Download size={14} />
                    下载
                  </button>
                  <button
                    onClick={() => removeImage(index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 font-medium text-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompressor;