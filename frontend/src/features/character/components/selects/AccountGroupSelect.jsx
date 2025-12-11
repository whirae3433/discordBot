import Select from '../../../../components/ui/Select';

const OPTIONS = ['본계정', '부계정', '버프캐'];

export default function AccountGroupSelect({ value, onChange }) {
  return (
    <Select
      options={OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="계정 선택"
    />
  );
}
