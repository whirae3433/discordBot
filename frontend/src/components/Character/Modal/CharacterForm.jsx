import { useState } from 'react';
import BasicInfoForm from './BasicInfoForm';
import SpecInfoForm from './SpecInfoForm';
import { useAuth } from '../../../Hooks/useAuth';

export default function CharacterForm({ onSubmit }) {
  const { user } = useAuth();
  const displayName = user?.nickname || user?.username; // 서버 닉네임 우선

  const buffJobs = ['리프1', '리프30', '리저', '뻥', '연막', '샤프'];
  const mainJobs = [
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

  // 상태
  const [ign, setIgn] = useState('');
  const [job, setJob] = useState('');
  const [level, setLevel] = useState('');
  const [atk, setAtk] = useState('');
  const [bossDmg, setBossDmg] = useState('');
  const [profileImg, setProfileImg] = useState('');

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
        setJob={setJob}
        level={level}
        setLevel={setLevel}
        buffJobs={buffJobs}
        mainJobs={mainJobs}
      />

      <div className="border-t my-4"></div>

      {/* 스펙 정보 섹션 */}
      <SpecInfoForm
        atk={atk}
        setAtk={setAtk}
        bossDmg={bossDmg}
        setBossDmg={setBossDmg}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleSubmit}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          추가
        </button>
      </div>
    </>
  );
}
