import Logo from './Logo';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import UserInfo from './UserInfo';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full flex flex-col z-20 bg-zinc-900/50 backdrop-blur-md">
      {/* 모바일 전용: 서치바 위쪽 */}
      <div className="flex justify-center mt-2 md:hidden">
        <SearchBar />
      </div>

      {/* 메인 헤더 라인 (3분할) */}
      <div className="flex items-center px-6 py-4">
        {/* 왼쪽: 로고 + 네비 */}
        <div className="flex items-center gap-12 flex-1">
          <Logo />
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

      {/* 하단 구분선 */}
      <div className="border-b border-gray-300 opacity-40"></div>
    </header>
  );
}
