import { useState } from 'react';

export default function Select({
  options = [],
  value,
  onChange,
  placeholder = '선택하세요',
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="relative w-full mb-2">
      <button
        type="button"
        className={`w-full p-2 border border-gray-300 rounded bg-white text-left ${
          value ? 'text-gray-900' : 'text-gray-400'
        }`}
        onClick={() => setOpen(!open)}
      >
        {value || placeholder}
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
