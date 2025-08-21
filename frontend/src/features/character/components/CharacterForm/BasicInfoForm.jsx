export default function BasicInfoForm({
  ign,
  setIgn,
  // profileImg,
  // setProfileImg,
  level,
  setLevel,
}) {
  return (
    <div>
      <input
        type="text"
        placeholder="인게임 닉"
        value={ign}
        onChange={(e) => setIgn(e.target.value)}
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />

      <input
        type="number"
        placeholder="레벨"
        value={level}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);

          if (value >= 0 && value <= 200) {
            setLevel(e.target.value);
          } else if (e.target.value === '') {
            setLevel('');
          }
        }}
        step="1"
        min="0"
        max="200"
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      />
      {/* <input
        type="text"
        placeholder="프로필 이미지 URL"
        value={profileImg}
        onChange={(e) => setProfileImg(e.target.value)}
        className="w-full mb-2 p-2 border border-gray-300 rounded"
      /> */}
    </div>
  );
}
