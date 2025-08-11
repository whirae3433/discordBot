import { useState } from 'react';
import BasicInfoForm from './BasicInfoForm';
import SpecInfoForm from './SpecInfoForm';
import { useAuth } from '../../../Hooks/useAuth';
import Select from './Select';
import { buffJobs, mainJobs } from './Jobs.js';

export default function CharacterForm({
  onSubmit,
  initialValues,
  submitLabel = '추가하기',
}) {
  const { user } = useAuth();
  const displayName = user?.nickname || user?.username; // 서버 닉네임 우선

  // 상태
  const [ign, setIgn] = useState(() => initialValues?.ign ?? '');
  const [job, setJob] = useState(() => initialValues?.job ?? '');
  const [level, setLevel] = useState(() =>
    initialValues?.level === 0 || initialValues?.level
      ? String(initialValues.level)
      : ''
  );
  const [atk, setAtk] = useState(() =>
    initialValues?.atk === 0 || initialValues?.atk
      ? String(initialValues.atk)
      : ''
  );
  const [bossDmg, setBossDmg] = useState(() =>
    initialValues?.bossDmg === 0 || initialValues?.bossDmg
      ? String(initialValues.bossDmg)
      : ''
  );
  const [profileImg, setProfileImg] = useState(
    () => initialValues?.profileImg ?? ''
  );
  const [accountGroup, setAccountGroup] = useState(
    () => initialValues?.accountGroup ?? '본계정'
  );
  const [hp, setHp] = useState(() =>
    initialValues?.hp === 0 || initialValues?.hp ? String(initialValues.hp) : ''
  );
  const [acc, setAcc] = useState(() =>
    initialValues?.acc === 0 || initialValues?.acc
      ? String(initialValues.acc)
      : ''
  );
  const [mapleWarrior, setMapleWarrior] = useState(
    () => initialValues?.mapleWarrior ?? '없음'
  );
  const jobOptions = [
    '-- 버프 캐릭터 --',
    ...buffJobs,
    '-- 메인 캐릭터 --',
    ...mainJobs,
  ];

  // 제출 함수
  const handleSubmit = () => {
    const newCharacter = {
      nickname: displayName,
      ign,
      profileImg,
      job,
      level: Number(level),
      atk: atk ? Number(atk) : null,
      bossDmg: bossDmg ? Number(bossDmg) : null,
      accountGroup,
      order: '',
      hp: hp ? Number(hp) : null,
      acc: acc ? Number(acc) : null,
      mapleWarrior, // 문자열 그대로
    };
    onSubmit(newCharacter);
  };

  return (
    <>
      {/* 기본 정보 섹션 */}
      <BasicInfoForm
        ign={ign}
        setIgn={setIgn}
        profileImg={profileImg}
        setProfileImg={setProfileImg}
        level={level}
        setLevel={setLevel}
      />

      <Select
        options={jobOptions}
        value={job}
        onChange={setJob}
        placeholder="직업 선택"
      />

      <Select
        options={['본계정', '부계정', '버프캐']}
        value={accountGroup}
        onChange={setAccountGroup}
        placeholder="계정 그룹 선택"
      />

      <div className="border-t my-4"></div>

      {/* 스펙 정보 섹션 */}
      <SpecInfoForm
        atk={atk}
        setAtk={setAtk}
        bossDmg={bossDmg}
        setBossDmg={setBossDmg}
        hp={hp}
        setHp={setHp}
        acc={acc}
        setAcc={setAcc}
        mapleWarrior={mapleWarrior}
        setMapleWarrior={setMapleWarrior}
      />

      <Select
        options={['없음', '메10', '메20', '메30']}
        value={mapleWarrior}
        onChange={setMapleWarrior}
        placeholder="메용 선택"
      />

      <div className="flex justify-center mt-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-1 bg-black text-white rounded hover:bg-gray-800"
        >
          {submitLabel}
        </button>
      </div>
    </>
  );
}
