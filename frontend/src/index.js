import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Layout from './Layout';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import Info from './pages/Info';

const router = createBrowserRouter([
  {
    path: '/',                  // ✅ 루트 라우트
    element: <Layout />,        // Layout이 모든 페이지의 공통 틀
    errorElement: <NotFound />, // 404 페이지
    children: [
      { path: 'home', element: <HomePage /> }, // ✅ /home
      {
        path: ':serverId',      // ✅ /:serverId 이하
        children: [
          { path: 'profile/:discordId', element: <ProfilePage /> },
          { path: 'info', element: <Info /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
