import React, { useState, useRef } from 'react';
import { Palette, Copy, Check, Droplet } from 'lucide-react';

const ColorPicker: React.FC = () => {
  const [color, setColor] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HEX转RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // RGB转HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // HSL转RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // RGB转HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // 处理颜色变更
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    const rgbValues = hexToRgb(newColor);
    if (rgbValues) {
      setRgb(rgbValues);
      const hslValues = rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b);
      setHsl(hslValues);
    }
  };

  // 处理RGB变更
  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newRgb = { ...rgb, [channel]: numValue };
    setRgb(newRgb);
    setColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  // 处理HSL变更
  const handleHslChange = (channel: 'h' | 's' | 'l', value: string) => {
    const maxValue = channel === 'h' ? 360 : 100;
    const numValue = Math.max(0, Math.min(maxValue, parseInt(value) || 0));
    const newHsl = { ...hsl, [channel]: numValue };
    setHsl(newHsl);
    const rgbValues = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(rgbValues);
    setColor(rgbToHex(rgbValues.r, rgbValues.g, rgbValues.b));
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error('复制失败:', e);
    }
  };

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 创建canvas来获取像素颜色
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            // 获取中心点的颜色
            const imageData = ctx.getImageData(img.width / 2, img.height / 2, 1, 1);
            const [r, g, b] = imageData.data;
            handleColorChange(rgbToHex(r, g, b));
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Palette size={20} />
        取色器
      </h3>
      
      <div className="space-y-4">
        {/* 颜色预览 */}
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-lg border-2 border-white/30 cursor-pointer"
            style={{ backgroundColor: color }}
            onClick={() => fileInputRef.current?.click()}
          />
          <div className="flex-1">
            <div className="text-sm font-mono">{color}</div>
            <div className="text-xs text-white/70">点击颜色块上传图片取色</div>
          </div>
        </div>

        {/* 颜色选择器 */}
        <div>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-10 rounded-md cursor-pointer border-none"
          />
        </div>

        {/* RGB值 */}
        <div>
          <label className="block text-sm font-medium mb-2">RGB</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-white/70 mb-1">R</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-center text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1">G</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-center text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1">B</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-center text-sm"
              />
            </div>
          </div>
        </div>

        {/* HSL值 */}
        <div>
          <label className="block text-sm font-medium mb-2">HSL</label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-white/70 mb-1">H</label>
              <input
                type="number"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => handleHslChange('h', e.target.value)}
                className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-center text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1">S</label>
              <input
                type="number"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => handleHslChange('s', e.target.value)}
                className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-center text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-white/70 mb-1">L</label>
              <input
                type="number"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => handleHslChange('l', e.target.value)}
                className="w-full px-2 py-1 bg-white/20 border border-white/30 rounded text-center text-sm"
              />
            </div>
          </div>
        </div>

        {/* 快速复制 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => copyToClipboard(color)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 text-sm flex items-center justify-center gap-1"
          >
            {copied === color ? <Check size={14} /> : <Copy size={14} />}
            HEX
          </button>
          <button
            onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200 text-sm flex items-center justify-center gap-1"
          >
            {copied === `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` ? <Check size={14} /> : <Copy size={14} />}
            RGB
          </button>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ColorPicker;