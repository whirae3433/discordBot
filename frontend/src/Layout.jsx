import { Outlet } from 'react-router-dom';
import Banner from './components/banner/Banner';
import Header from './components/Header/Header';

export default function Layout() {
  return (
    <>
      {/* 헤더는 항상 고정 */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Header />
      </div>

      {/* 배너는 스크롤 위치에 따라 이동 */}
      <div className="mt-[72px] z-0">
        {' '}
        {/* 헤더 높이만큼 margin-top */}
        <Banner />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 max-w-5xl mx-auto p-6 pt-6">
        <Outlet />
      </main>
    </>
  );
}
