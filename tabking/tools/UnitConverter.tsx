import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRightLeft } from 'lucide-react';

interface ConversionUnit {
  name: string;
  symbol: string;
  toBase: number; // 转换为基准单位的乘数
}

interface ConversionCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  units: ConversionUnit[];
  baseUnit: string;
}

const UnitConverter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('length');
  const [inputValue, setInputValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const categories: ConversionCategory[] = [
    {
      id: 'length',
      name: '长度',
      icon: <Calculator size={16} />,
      baseUnit: 'meter',
      units: [
        { name: '毫米', symbol: 'mm', toBase: 0.001 },
        { name: '厘米', symbol: 'cm', toBase: 0.01 },
        { name: '分米', symbol: 'dm', toBase: 0.1 },
        { name: '米', symbol: 'm', toBase: 1 },
        { name: '千米', symbol: 'km', toBase: 1000 },
        { name: '英寸', symbol: 'in', toBase: 0.0254 },
        { name: '英尺', symbol: 'ft', toBase: 0.3048 },
        { name: '码', symbol: 'yd', toBase: 0.9144 },
        { name: '英里', symbol: 'mi', toBase: 1609.344 },
      ]
    },
    {
      id: 'weight',
      name: '重量',
      icon: <Calculator size={16} />,
      baseUnit: 'kilogram',
      units: [
        { name: '毫克', symbol: 'mg', toBase: 0.000001 },
        { name: '克', symbol: 'g', toBase: 0.001 },
        { name: '千克', symbol: 'kg', toBase: 1 },
        { name: '吨', symbol: 't', toBase: 1000 },
        { name: '磅', symbol: 'lb', toBase: 0.453592 },
        { name: '盎司', symbol: 'oz', toBase: 0.0283495 },
        { name: '斤', symbol: '斤', toBase: 0.5 },
        { name: '两', symbol: '两', toBase: 0.05 },
      ]
    },
    {
      id: 'temperature',
      name: '温度',
      icon: <Calculator size={16} />,
      baseUnit: 'celsius',
      units: [
        { name: '摄氏度', symbol: '°C', toBase: 1 },
        { name: '华氏度', symbol: '°F', toBase: 1 },
        { name: '开尔文', symbol: 'K', toBase: 1 },
      ]
    },
    {
      id: 'area',
      name: '面积',
      icon: <Calculator size={16} />,
      baseUnit: 'squareMeter',
      units: [
        { name: '平方毫米', symbol: 'mm²', toBase: 0.000001 },
        { name: '平方厘米', symbol: 'cm²', toBase: 0.0001 },
        { name: '平方米', symbol: 'm²', toBase: 1 },
        { name: '平方千米', symbol: 'km²', toBase: 1000000 },
        { name: '公顷', symbol: 'ha', toBase: 10000 },
        { name: '亩', symbol: '亩', toBase: 666.666667 },
        { name: '平方英尺', symbol: 'ft²', toBase: 0.092903 },
        { name: '平方英寸', symbol: 'in²', toBase: 0.00064516 },
      ]
    },
    {
      id: 'volume',
      name: '体积',
      icon: <Calculator size={16} />,
      baseUnit: 'liter',
      units: [
        { name: '毫升', symbol: 'mL', toBase: 0.001 },
        { name: '升', symbol: 'L', toBase: 1 },
        { name: '立方米', symbol: 'm³', toBase: 1000 },
        { name: '立方厘米', symbol: 'cm³', toBase: 0.001 },
        { name: '加仑(美)', symbol: 'gal', toBase: 3.78541 },
        { name: '夸脱(美)', symbol: 'qt', toBase: 0.946353 },
        { name: '品脱(美)', symbol: 'pt', toBase: 0.473176 },
        { name: '液体盎司(美)', symbol: 'fl oz', toBase: 0.0295735 },
      ]
    },
    {
      id: 'speed',
      name: '速度',
      icon: <Calculator size={16} />,
      baseUnit: 'meterPerSecond',
      units: [
        { name: '米/秒', symbol: 'm/s', toBase: 1 },
        { name: '千米/小时', symbol: 'km/h', toBase: 0.277778 },
        { name: '英里/小时', symbol: 'mph', toBase: 0.44704 },
        { name: '节', symbol: 'kn', toBase: 0.514444 },
        { name: '英尺/秒', symbol: 'ft/s', toBase: 0.3048 },
        { name: '厘米/秒', symbol: 'cm/s', toBase: 0.01 },
      ]
    }
  ];

  useEffect(() => {
    const category = categories.find(cat => cat.id === selectedCategory);
    if (category && category.units.length > 0) {
      setFromUnit(category.units[0].symbol);
      setToUnit(category.units[1]?.symbol || category.units[0].symbol);
    }
  }, [selectedCategory]);

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number;
    
    // 转换为摄氏度
    switch (from) {
      case '°C':
        celsius = value;
        break;
      case '°F':
        celsius = (value - 32) * 5 / 9;
        break;
      case 'K':
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    // 从摄氏度转换到目标单位
    switch (to) {
      case '°C':
        return celsius;
      case '°F':
        return celsius * 9 / 5 + 32;
      case 'K':
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const convertValue = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setResult('请输入有效数字');
      return;
    }

    const category = categories.find(cat => cat.id === selectedCategory);
    if (!category) return;

    if (selectedCategory === 'temperature') {
      const convertedValue = convertTemperature(numValue, fromUnit, toUnit);
      setResult(convertedValue.toFixed(6));
    } else {
      const fromUnitData = category.units.find(unit => unit.symbol === fromUnit);
      const toUnitData = category.units.find(unit => unit.symbol === toUnit);
      
      if (!fromUnitData || !toUnitData) return;

      // 先转换为基准单位，再转换为目标单位
      const baseValue = numValue * fromUnitData.toBase;
      const convertedValue = baseValue / toUnitData.toBase;
      
      setResult(convertedValue.toFixed(6));
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    
    // 如果有输入值，重新计算
    if (inputValue && result) {
      setInputValue(result);
      setTimeout(() => convertValue(), 0);
    }
  };

  const clearAll = () => {
    setInputValue('');
    setResult('');
  };

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
      <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
        <Calculator size={20} />
        单位换算器
      </h3>

      {/* 分类选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">选择换算类型</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/80'
              }`}
            >
              {category.icon}
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {currentCategory && (
        <div className="space-y-4">
          {/* 输入值 */}
          <div>
            <label className="block text-sm font-medium mb-2">输入数值</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="请输入要转换的数值"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/50"
            />
          </div>

          {/* 单位选择 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">从</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {currentCategory.units.map((unit) => (
                  <option key={unit.symbol} value={unit.symbol} className="bg-gray-800">
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">到</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                {currentCategory.units.map((unit) => (
                  <option key={unit.symbol} value={unit.symbol} className="bg-gray-800">
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 交换按钮 */}
          <div className="flex justify-center">
            <button
              onClick={swapUnits}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="交换单位"
            >
              <ArrowRightLeft size={16} />
            </button>
          </div>

          {/* 转换按钮 */}
          <div className="flex gap-2">
            <button
              onClick={convertValue}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 font-medium"
            >
              转换
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200 font-medium"
            >
              清空
            </button>
          </div>

          {/* 结果显示 */}
          {result && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
              <div className="text-sm text-white/60 mb-1">转换结果：</div>
              <div className="text-lg font-mono">
                {inputValue} {fromUnit} = {result} {toUnit}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-6 text-xs text-white/70 space-y-1">
        <p>• 选择换算类型和单位</p>
        <p>• 输入要转换的数值</p>
        <p>• 点击转换按钮或按回车键进行计算</p>
        <p>• 支持长度、重量、温度、面积、体积、速度等单位换算</p>
        <p>• 温度换算支持摄氏度、华氏度、开尔文</p>
      </div>
    </div>
  );
};

export default UnitConverter;