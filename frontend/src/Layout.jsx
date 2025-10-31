import { Outlet } from 'react-router-dom';
import Header from './components/header/Header';

export default function Layout() {
  return (
    <>
      {/* 헤더는 항상 고정 */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Header />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 max-w-5xl mx-auto p-6 pt-6">
        <Outlet />
      </main>
    </>
  );
}
