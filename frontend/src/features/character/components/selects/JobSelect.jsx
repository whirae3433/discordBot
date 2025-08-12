import { useState } from 'react';

const BUFF_JOBS = ['리프1', '리프30', '리저', '뻥', '연막', '샤프']; // '뻥캐' vs '뻥' 표기 통일
const MAIN_JOBS = [
  '히어로',
  '닼나',
  '팔라딘',
  '보마',
  '신궁',
  '썬콜',
  '불독',
  '비숍',
  '나로',
  '섀도어',
  '바이퍼',
  '캡틴',
  '에반',
  '아란',
];

export default function JobSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (job) => {
    onChange(job);
    setOpen(false);
  };

  return (
    <div className="relative w-full mb-2">
      <button
        type="button"
        className={`w-full p-2 border border-gray-300 rounded bg-white text-left ${
          value ? 'text-gray-900' : 'text-gray-400'
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {value || '직업 선택'}
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto z-10">
          <div className="px-2 py-1 text-xs text-gray-500">
            -- 버프 캐릭터 --
          </div>
          {BUFF_JOBS.map((job) => (
            <div
              key={job}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(job)}
            >
              {job}
            </div>
          ))}

          <div className="px-2 py-1 text-xs text-gray-500 mt-2">
            -- 메인 캐릭터 --
          </div>
          {MAIN_JOBS.map((job) => (
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
