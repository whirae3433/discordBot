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
    path: '/:serverId',
    element: <Layout />, // 공통 레이아웃
    errorElement: <NotFound />, // 404 페이지
    children: [
      { path: 'home', element: <HomePage /> }, // 기본 페이지
      { path: 'profile/:discordId', element: <ProfilePage /> }, // 프로필 페이지
      { path: 'info', element: <Info /> }, // DLSVH
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
