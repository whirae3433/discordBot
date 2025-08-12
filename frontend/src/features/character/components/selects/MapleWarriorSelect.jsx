import Select from '../../../../components/ui/Select';

const OPTIONS = ['없음', '메10', '메20', '메30'];

export default function MapleWarriorSelect({ value, onChange }) {
  return (
    <Select
      options={OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="메용 선택"
    />
  );
}
