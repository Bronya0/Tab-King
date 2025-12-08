import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Hash } from 'lucide-react';

const TimestampConverter: React.FC = () => {
  const [dateTime, setDateTime] = useState('');
  const [secondTimestamp, setSecondTimestamp] = useState('');
  const [millisecondTimestamp, setMillisecondTimestamp] = useState('');

  // 初始化当前时间
  useEffect(() => {
    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    setDateTime(localDateTime);
    setSecondTimestamp(Math.floor(now.getTime() / 1000).toString());
    setMillisecondTimestamp(now.getTime().toString());
  }, []);

  // 日期时间变更处理
  const handleDateTimeChange = (value: string) => {
    setDateTime(value);
    if (value) {
      const timestamp = new Date(value).getTime();
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
      const localDateTime = date.toISOString().slice(0, 19).replace('T', ' ');
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
      const localDateTime = date.toISOString().slice(0, 19).replace('T', ' ');
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
    const localDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    setDateTime(localDateTime);
    setSecondTimestamp(Math.floor(now.getTime() / 1000).toString());
    setMillisecondTimestamp(now.getTime().toString());
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} />
        时间戳转换器
      </h3>
      
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