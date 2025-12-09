import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Hash, Globe } from 'lucide-react';

const TimestampConverter: React.FC = () => {
  const [dateTime, setDateTime] = useState('');
  const [secondTimestamp, setSecondTimestamp] = useState('');
  const [millisecondTimestamp, setMillisecondTimestamp] = useState('');
  const [timezone, setTimezone] = useState('');
  const [offset, setOffset] = useState('');

  // 获取用户时区信息
  const getTimezoneInfo = () => {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -now.getTimezoneOffset();
    const offsetHours = Math.floor(offset / 60);
    const offsetMinutes = Math.abs(offset % 60);
    const offsetString = `UTC${offset >= 0 ? '+' : ''}${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;
    
    return { timezone, offset: offsetString, offsetMinutes: offset };
  };

  // 格式化本地时间（考虑时区）
  const formatLocalDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 初始化当前时间
  useEffect(() => {
    const now = new Date();
    const { timezone, offset } = getTimezoneInfo();
    setTimezone(timezone);
    setOffset(offset);
    
    const localDateTime = formatLocalDateTime(now);
    setDateTime(localDateTime);
    setSecondTimestamp(Math.floor(now.getTime() / 1000).toString());
    setMillisecondTimestamp(now.getTime().toString());
  }, []);

  // 日期时间变更处理
  const handleDateTimeChange = (value: string) => {
    setDateTime(value);
    if (value) {
      // 解析本地时间字符串
      const [datePart, timePart] = value.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      
      // 创建日期对象（本地时区）
      const date = new Date(year, month - 1, day, hours, minutes, seconds);
      const timestamp = date.getTime();
      
      if (!isNaN(timestamp)) {
        setSecondTimestamp(Math.floor(timestamp / 1000).toString());
        setMillisecondTimestamp(timestamp.toString());
      }
    } else {
      setSecondTimestamp('');
      setMillisecondTimestamp('');
    }
  };

  // 秒时间戳变更处理
  const handleSecondTimestampChange = (value: string) => {
    setSecondTimestamp(value);
    if (value && /^\d+$/.test(value)) {
      const timestamp = parseInt(value) * 1000;
      const date = new Date(timestamp);
      const localDateTime = formatLocalDateTime(date);
      setDateTime(localDateTime);
      setMillisecondTimestamp(timestamp.toString());
    } else {
      setDateTime('');
      setMillisecondTimestamp('');
    }
  };

  // 毫秒时间戳变更处理
  const handleMillisecondTimestampChange = (value: string) => {
    setMillisecondTimestamp(value);
    if (value && /^\d+$/.test(value)) {
      const timestamp = parseInt(value);
      const date = new Date(timestamp);
      const localDateTime = formatLocalDateTime(date);
      setDateTime(localDateTime);
      setSecondTimestamp(Math.floor(timestamp / 1000).toString());
    } else {
      setDateTime('');
      setSecondTimestamp('');
    }
  };

  // 获取当前时间
  const getCurrentTime = () => {
    const now = new Date();
    const localDateTime = formatLocalDateTime(now);
    setDateTime(localDateTime);
    setSecondTimestamp(Math.floor(now.getTime() / 1000).toString());
    setMillisecondTimestamp(now.getTime().toString());
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Clock size={20} />
          时间戳转换器
        </h3>
        {timezone && (
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Globe size={16} />
            <span>{timezone} ({offset})</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {/* 日期时间输入 */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar size={16} />
            日期时间
          </label>
          <input
            type="datetime-local"
            value={dateTime.replace(' ', 'T')}
            onChange={(e) => handleDateTimeChange(e.target.value.replace('T', ' '))}
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
          />
        </div>

        {/* 秒时间戳输入 */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Hash size={16} />
            秒时间戳
          </label>
          <input
            type="text"
            value={secondTimestamp}
            onChange={(e) => handleSecondTimestampChange(e.target.value)}
            placeholder="输入秒时间戳"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
          />
        </div>

        {/* 毫秒时间戳输入 */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Hash size={16} />
            毫秒时间戳
          </label>
          <input
            type="text"
            value={millisecondTimestamp}
            onChange={(e) => handleMillisecondTimestampChange(e.target.value)}
            placeholder="输入毫秒时间戳"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
          />
        </div>

        {/* 获取当前时间按钮 */}
        <button
          onClick={getCurrentTime}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 font-medium"
        >
          获取当前时间
        </button>
      </div>
    </div>
  );
};

export default TimestampConverter;