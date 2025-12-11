import { useState } from 'react';
import BasicInfoForm from './BasicInfoForm';
import SpecInfoForm from './SpecInfoForm';
import { useAuth } from '../../../../hooks/useAuth.jsx';
import JobSelect from '../selects/JobSelect.jsx';
import MapleWarriorSelect from '../selects/MapleWarriorSelect.jsx';

export default function CharacterForm({
  onSubmit,
  initialValues,
  submitLabel = '추가하기',
}) {
  const { user } = useAuth();
  const displayName = user?.nickname || user?.username;

  const [form, setForm] = useState(() => ({
    ign: initialValues?.ign ?? '',
    // profileImg: initialValues?.profileImg ?? '',
    job: initialValues?.job ?? '',
    level:
      initialValues?.level === 0 || initialValues?.level
        ? String(initialValues.level)
        : '',
    atk:
      initialValues?.atk === 0 || initialValues?.atk
        ? String(initialValues.atk)
        : '',
    bossDmg:
      initialValues?.bossDmg === 0 || initialValues?.bossDmg
        ? String(initialValues.bossDmg)
        : '',
    hp:
      initialValues?.hp === 0 || initialValues?.hp
        ? String(initialValues.hp)
        : '',
    acc:
      initialValues?.acc === 0 || initialValues?.acc
        ? String(initialValues.acc)
        : '',
    mapleWarrior: initialValues?.mapleWarrior ?? '',
  }));

  const set = (k) => (v) => setForm((prev) => ({ ...prev, [k]: v }));

  const buildPayload = () => {
    const toNumOrNull = (v) =>
      v === '' || v === null || v === undefined ? null : Number(v);
    return {
      nickname: displayName,
      ign: form.ign,
      job: form.job,
      level: toNumOrNull(form.level),
      atk: toNumOrNull(form.atk),
      bossDmg: toNumOrNull(form.bossDmg),
      order: '',
      hp: toNumOrNull(form.hp),
      acc: toNumOrNull(form.acc),
      mapleWarrior: form.mapleWarrior,
    };
  };

  // ✅ 커스텀 검증: 빈칸이면 alert, 범위 오류도 alert
  const handleSubmit = (e) => {
    e.preventDefault(); // 브라우저 기본 제출/검증 막기

    const ign = String(form.ign ?? '').trim();
    const levelStr = String(form.level ?? '').trim();
    const job = String(form.job ?? '').trim();
    const missing = [];
    if (!ign) missing.push('인게임 닉');
    if (!levelStr) missing.push('레벨');
    if (!job) missing.push('직업');

    if (missing.length) {
      alert(`다음 필수 항목을 입력해 주세요:\n- ${missing.join('\n- ')}`);
      return;
    }

    // 레벨 숫자/범위 체크 (0~200)
    const levelNum = Number(levelStr);
    if (!Number.isFinite(levelNum) || levelNum < 0 || levelNum > 200) {
      alert('레벨은 0~200 사이의 숫자여야 합니다.');
      return;
    }

    // 통과 → 저장
    onSubmit(buildPayload());
  };

  return (
    // ⬇️ 폼으로 감싸고, noValidate로 브라우저 기본 검증 끔
    <form onSubmit={handleSubmit} noValidate>
      <BasicInfoForm
        ign={form.ign}
        setIgn={set('ign')}
        level={form.level}
        setLevel={set('level')}
      />

      <JobSelect value={form.job} onChange={set('job')} />
      <div className="border-t my-4" />

      <SpecInfoForm
        atk={form.atk}
        setAtk={set('atk')}
        bossDmg={form.bossDmg}
        setBossDmg={set('bossDmg')}
        hp={form.hp}
        setHp={set('hp')}
        acc={form.acc}
        setAcc={set('acc')}
        mapleWarrior={form.mapleWarrior}
        setMapleWarrior={set('mapleWarrior')}
      />

      <MapleWarriorSelect
        value={form.mapleWarrior}
        onChange={set('mapleWarrior')}
      />

      <div className="flex justify-center mt-4">
        {/* ⬇️ 버튼은 항상 활성화, type=submit로 제출 트리거 */}
        <button
          type="submit"
          className="px-4 py-1 bg-black text-white rounded hover:bg-gray-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
