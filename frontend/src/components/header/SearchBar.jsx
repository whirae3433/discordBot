import { IoSearchOutline } from 'react-icons/io5';

export default function SearchBar() {
  return (
    <div className="relative flex items-center w-64">
      <input
        type="text"
        placeholder="길드원 검색..."
        className="w-full bg-transparent border-b border-gray-400 translate-y-1 pr-8 text-white focus:outline-none"
      />

      {/* 오른쪽 돋보기 아이콘 */}
      <span className="absolute -right-4 text-gray-400 cursor-pointer hover:text-white">
        <IoSearchOutline />
      </span>
    </div>
  );
}
