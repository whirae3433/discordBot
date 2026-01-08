import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Layout from './Layout';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
// import Info from './pages/Info';
import ReportItem from './pages/ReportItem';
import ProfileEntry from './pages/ProfileEntry';
import InviteAlreadyExists from './pages/InviteAlreadyExists';
import InviteSuccess from './pages/InviteSuccess';

const router = createBrowserRouter([
  {
    path: '/', // 루트 라우트
    element: <Layout />, // Layout이 모든 페이지의 공통 틀
    errorElement: <NotFound />, // 404 페이지
    children: [
      { path: 'invite-success', element: <InviteSuccess /> },
      { path: 'invite-already-exists', element: <InviteAlreadyExists /> },
      { path: 'invite-error', element: <NotFound /> },
      
      { path: 'home', element: <HomePage /> }, // /home
      { path: 'report-item', element: <ReportItem /> },

      // 로그인 진입점
      { path: 'entry', element: <ProfileEntry /> },

      // 내 프로필 (discordId 기준)
      { path: 'profile/:discordId', element: <ProfilePage /> },

      // {
      //   path: ':serverId', // /:serverId 이하
      //   element: <Outlet />,
      //   children: [
      //     { path: 'profile', element: <ProfileEntry /> },
      //     { path: 'profile/:discordId', element: <ProfilePage /> },
      //     { path: 'info', element: <Info /> },
      //   ],
      // },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
