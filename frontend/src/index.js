import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import Layout from './Layout';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ReportItem from './pages/ReportItem';
import ProfileEntry from './pages/ProfileEntry';
import InviteAlreadyExists from './pages/InviteAlreadyExists';
import InviteSuccess from './pages/InviteSuccess';
import RequireAuth from './pages/RequireAuth';
import Others from './pages/Others';
import TimerApp from './timer/TimerApp';

const isApp = !!window?.muyeong?.isDesktopApp;

const router = createBrowserRouter([
  {
    path: '/',
    element: isApp ? <TimerApp /> : <Layout />,  // ✅ 앱이면 Others만
    errorElement: <NotFound />,
    children: [
      // --- invite 결과 페이지 ---
      { path: 'invite-success', element: <InviteSuccess /> },
      { path: 'invite-already-exists', element: <InviteAlreadyExists /> },
      { path: 'invite-error', element: <NotFound /> },

      // --- 공개 페이지 ---
      { path: '', element: <HomePage /> },
      { path: 'home', element: <HomePage /> }, // /home
      { path: 'report-item', element: <ReportItem /> },
      { path: 'entry', element: <ProfileEntry /> },
      { path: 'servers', element: <NotFound /> },
      { path: 'info', element: <NotFound /> },
      { path: 'others', element: <Others /> },

      // 내 프로필 (discordId 기준)
      {
        path: 'profile/:discordId',
        element: <Navigate to="/profile" replace />,
      },

      // --- 보호 구역(로그인 필요) ---
      {
        element: <RequireAuth />,
        children: [
          { path: 'profile', element: <ProfilePage /> }, // ✅ /profile
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
