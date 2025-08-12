import { useState } from 'react';
import BasicInfoForm from './BasicInfoForm';
import SpecInfoForm from './SpecInfoForm';
import { useAuth } from '../../../../hooks/useAuth.jsx';
import JobSelect from '../selects/JobSelect.jsx';
import AccountGroupSelect from '../selects/AccountGroupSelect.jsx';
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
    profileImg: initialValues?.profileImg ?? '',
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
    accountGroup: initialValues?.accountGroup ?? '',
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

  const handleSubmit = () => {
    const toNumOrNull = (v) =>
      v === '' || v === null || v === undefined ? null : Number(v);
    const payload = {
      nickname: displayName,
      ign: form.ign,
      profileImg: form.profileImg,
      job: form.job,
      level: toNumOrNull(form.level),
      atk: toNumOrNull(form.atk),
      bossDmg: toNumOrNull(form.bossDmg),
      accountGroup: form.accountGroup,
      order: '',
      hp: toNumOrNull(form.hp),
      acc: toNumOrNull(form.acc),
      mapleWarrior: form.mapleWarrior,
    };
    onSubmit(payload);
  };

  return (
    <>
      <BasicInfoForm
        ign={form.ign}
        setIgn={set('ign')}
        profileImg={form.profileImg}
        setProfileImg={set('profileImg')}
        level={form.level}
        setLevel={set('level')}
      />

      <JobSelect value={form.job} onChange={set('job')} />
      <AccountGroupSelect
        value={form.accountGroup}
        onChange={set('accountGroup')}
      />

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
