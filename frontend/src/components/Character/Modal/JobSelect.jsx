import { useState } from 'react';

export default function JobSelect({ buffJobs, mainJobs, onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');

  const handleSelect = (job) => {
    setSelected(job);
    onChange(job);
    setOpen(false);
  };

  return (
    <div className="relative w-full mb-2">
      {/* 드롭다운 버튼 */}
      <button
        type="button"
        className={`w-full p-2 border border-gray-300 rounded bg-white text-left ${
          selected ? 'text-gray-900' : 'text-gray-400'
        }`}
        onClick={() => setOpen(!open)}
      >
        {selected || '직업 선택'}
      </button>

      {/* 옵션 목록 */}
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto z-10">
          {/* 버프 캐릭터 그룹 */}
          <div className="px-2 py-1 text-xs text-gray-500">
            -- 버프 캐릭터 --
          </div>
          {buffJobs.map((job) => (
            <div
              key={job}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(job)}
            >
              {job}
            </div>
          ))}

          {/* 메인 캐릭터 그룹 */}
          <div className="px-2 py-1 text-xs text-gray-500 mt-2">
            -- 메인 캐릭터 --
          </div>
          {mainJobs.map((job) => (
            <div
              key={job}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(job)}
            >
              {job}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
