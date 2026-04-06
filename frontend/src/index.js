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
import TimerRoomPage from './timer/pages/TimerRoomPage';
import TimerLobbyPage from './timer/pages/TimerLobbyPage';
import TimerCreatePage from './timer/pages/TimerCreatePage';
import TimerEditPage from './timer/pages/TimerEditPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { path: 'invite-success', element: <InviteSuccess /> },
      { path: 'invite-already-exists', element: <InviteAlreadyExists /> },
      { path: 'invite-error', element: <NotFound /> },

      { path: '', element: <HomePage /> },
      { path: 'home', element: <HomePage /> },
      { path: 'report-item', element: <ReportItem /> },
      { path: 'entry', element: <ProfileEntry /> },
      { path: 'servers', element: <NotFound /> },
      { path: 'info', element: <NotFound /> },

      {
        path: 'profile/:discordId',
        element: <Navigate to="/profile" replace />,
      },

      {
        element: <RequireAuth />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'timer', element: <TimerLobbyPage /> },
          { path: 'timer/create', element: <TimerCreatePage /> },
          { path: 'timer/room/:roomId', element: <TimerRoomPage /> },
          { path: 'timer/room/:roomId/edit', element: <TimerEditPage /> },
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
