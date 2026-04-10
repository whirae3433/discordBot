import { IoSearchOutline } from 'react-icons/io5';

export default function SearchBar() {
  return (
    <div className="relative flex items-center w-64">
      <input
        type="text"
        placeholder="길드원 검색 . . ."
        className="w-full bg-transparent border-b border-zinc-300 translate-y-1 pr-8 text-sm text-zinc-600 placeholder:text-zinc-400 focus:outline-none"
      />

      {/* 돋보기 아이콘 */}
      <span className="absolute -right-4 text-zinc-400 cursor-pointer hover:text-black transition">
        <IoSearchOutline />
      </span>
    </div>
  );
}
