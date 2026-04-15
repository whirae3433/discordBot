import { Outlet } from 'react-router-dom';
import Header from './components/header/Header';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-50">
      <div className="shrink-0 sticky top-0 z-30">
        <Header />
      </div>

      <main className="app-scroll flex-1 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}