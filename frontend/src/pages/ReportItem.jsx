import { useState } from 'react';

export default function ReportItem() {
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      alert('아이템 이름을 입력하세요.');
      return;
    }

    const res = await fetch('/api/report-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: name }),
    });

    const data = await res.json();
    if (data.success) {
      setSent(true);
    }
  };

  return (
    <div className="w-full flex justify-center mt-20 mb-20">
      <div className="bg-[#1c1e22] w-[360px] p-7 rounded-xl shadow-xl text-white">
        {!sent ? (
          <>
            <h2 className="text-2xl font-semibold text-center mb-2">
              아이템 제보하기
            </h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              등록되지 않은 아이템이 있다면 알려주세요.
            </p>

            <input
              type="text"
              placeholder="아이템 이름 입력"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[#2b2d31] text-white rounded-lg outline-none mb-4"
            />

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => (window.location.href = '/')}
                className="w-1/2 py-2 rounded-lg bg-[#3a3c40] hover:bg-[#4a4c50] transition"
              >
                취소
              </button>

              <button
                onClick={submit}
                className="w-1/2 py-2 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] transition text-white"
              >
                제출하기
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-xl font-semibold mb-2">
              제보가 접수되었습니다! 🙏
            </h3>
            <p className="text-gray-400 text-sm">
              빠르게 확인 후 반영하겠습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
