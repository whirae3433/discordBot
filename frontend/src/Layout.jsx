import { Outlet } from 'react-router-dom';
import Header from './components/header/Header';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <div className="sticky top-0 z-30">
        <Header />
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
