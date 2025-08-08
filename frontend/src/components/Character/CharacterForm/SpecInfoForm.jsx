export default function SpecInfoForm({
  atk,
  setAtk,
  bossDmg,
  setBossDmg,
  hp,
  setHp,
  acc,
  setAcc,
}) {
  return (
    <div>
      {/* 스공 */}
      <input
        type="number"
        placeholder="스공"
        value={atk}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
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
          if (value >= 0 && value <= 15.1) {
            setBossDmg(e.target.value);
          } else if (e.target.value === '') {
            setBossDmg('');
          }
        }}
        step="0.1"
        min="0"
        max="15.1"
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />

      {/* HP */}
      <input
        type="number"
        placeholder="체력"
        value={hp}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          if (value >= 0 && value <= 30000) {
            setHp(e.target.value);
          } else if (e.target.value === '') {
            setHp('');
          }
        }}
        step="10"
        min="0"
        max="30000"
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />

      {/* 명중률 */}
      <input
        type="number"
        placeholder="명중률"
        value={acc}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          if (value >= 0 && value <= 999) {
            setAcc(e.target.value);
          } else if (e.target.value === '') {
            setAcc('');
          }
        }}
        step="1"
        min="0"
        max="999"
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />
    </div>
  );
}
