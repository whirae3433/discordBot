import { Outlet } from 'react-router-dom';
import Banner from './components/Banner';
import Header from './components/Header/Header';

export default function Layout() {
  return (
    <>
      {/* 배너: 배경처럼 고정 */}
      <div className="fixed top-0 left-0 w-full z-0">
        <Banner />
      </div>

      {/* 헤더: 배너 위에 고정 */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Header />
      </div>
      

      {/* 메인 콘텐츠: 배너보다 위에 위치 */}
      <main className="relative z-10 max-w-5xl mx-auto p-6 pt-[120px]">
        <Outlet />
      </main>
    </>
  );
}
