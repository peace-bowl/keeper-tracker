import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function RetroNumberInput({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  className = 'w-24',
  inputClassName = 'text-base font-bold',
  accentColor = 'ochre', // 'ochre' | 'orange' | 'teal'
  disabled = false,
  placeholder = '',
  ...props
}) {
  const numericVal = value === '' || value === null || value === undefined ? 0 : Number(value);

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    const current = isNaN(numericVal) ? 0 : numericVal;
    const nextVal = Math.min(max, current + step);
    onChange(nextVal);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    const current = isNaN(numericVal) ? 0 : numericVal;
    const nextVal = Math.max(min, current - step);
    onChange(nextVal);
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(raw);
    }
  };

  const focusBorderClasses = {
    ochre: 'focus-within:border-[#D99F26]',
    orange: 'focus-within:border-[#E65A2B]',
    teal: 'focus-within:border-[#2A6B60]'
  }[accentColor] || 'focus-within:border-[#D99F26]';

  const hoverBgClasses = {
    ochre: 'hover:bg-[#D99F26] hover:text-[#141816]',
    orange: 'hover:bg-[#E65A2B] hover:text-[#F4EFE3]',
    teal: 'hover:bg-[#2A6B60] hover:text-[#F4EFE3]'
  }[accentColor] || 'hover:bg-[#D99F26] hover:text-[#141816]';

  return (
    <div
      className={`relative inline-flex items-stretch rounded-sm border-2 dark:border-[#2D3732] border-[#1C201D] dark:bg-[#1C2320] bg-[#EFEAD8] transition-colors overflow-hidden ${focusBorderClasses} ${className}`}
    >
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value ?? ''}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-transparent px-2 py-1 text-center font-typewriter dark:text-[#F4EFE3] text-[#161B18] outline-none min-w-0 ${inputClassName}`}
        {...props}
      />
      <div className="flex flex-col border-l-2 dark:border-[#2D3732] border-[#1C201D] shrink-0 dark:bg-[#141816] bg-[#FAF6EE]">
        <button
          type="button"
          tabIndex={-1}
          onClick={handleIncrement}
          disabled={disabled || (!isNaN(numericVal) && numericVal >= max)}
          className={`flex-1 px-1 flex items-center justify-center dark:text-[#A8B2AC] text-[#5A6861] ${hoverBgClasses} active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5A6861] transition-colors border-b dark:border-[#2D3732] border-[#1C201D]`}
          title="Increase"
        >
          <ChevronUp className="w-3 h-3 stroke-[3]" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={handleDecrement}
          disabled={disabled || (!isNaN(numericVal) && numericVal <= min)}
          className={`flex-1 px-1 flex items-center justify-center dark:text-[#A8B2AC] text-[#5A6861] ${hoverBgClasses} active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5A6861] transition-colors`}
          title="Decrease"
        >
          <ChevronDown className="w-3 h-3 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
