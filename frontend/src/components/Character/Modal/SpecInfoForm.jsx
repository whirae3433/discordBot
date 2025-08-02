export default function SpecInfoForm({
  atk,
  setAtk,
  bossDmg,
  setBossDmg,
  skill,
  setSkill,
}) {
  const skills = ['리프1', '리프20', '리프30', '리저', '연막', '샾', '뻥'];
  return (
    <div>
      {/* 스공 */}
      <input
        type="number"
        placeholder="스공"
        value={atk}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);

          // 범위 체크
          if (value >= 0 && value <= 20000) {
            setAtk(e.target.value);
          } else if (e.target.value === '') {
            setAtk('');
          }
        }}
        step="10"
        min="0"
        max="20000"
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />

      {/* 보공 */}
      <input
        type="number"
        placeholder="보공 (%)"
        value={bossDmg}
        onChange={(e) => {
          const value = parseFloat(e.target.value);

          // 범위 체크
          if (value >= 0 && value <= 15.1) {
            setBossDmg(e.target.value);
          } else if (e.target.value === '') {
            // 빈 값 허용
            setBossDmg('');
          }
        }}
        step="0.1"
        min="0"
        max="15.1"
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />

      {/* 스킬 선택 */}
      <select
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        className={`w-full mb-2 p-2 border border-gray-300 rounded bg-white ${
          skill ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        <option value="">
          (버프캐만) 스킬
        </option>
        {skills.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
