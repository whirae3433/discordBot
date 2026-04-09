import Navigation from './Navigation';
import SearchBar from './SearchBar';
import UserInfo from './UserInfo';

export default function Header() {
  return (
    <header className="w-full flex flex-col bg-white border-b border-zinc-200">
      {/* 모바일 전용: 서치바 위쪽 */}
      <div className="flex justify-center mt-2 md:hidden">
        <SearchBar />
      </div>

      {/* 메인 헤더 라인 (3분할) */}
      <div className="flex h-12 items-center px-6 py-2">
        <div className="flex items-center gap-12 flex-1">
          <Navigation />
        </div>

        {/* 중앙: 데스크탑 전용 서치바 */}
        <div className="hidden md:flex justify-center flex-1">
          <SearchBar />
        </div>

        {/* 오른쪽: 유저 정보 */}
        <div className="flex justify-end flex-1">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}