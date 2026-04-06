import NavItem from './NavItem';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isTimerActive = location.pathname.startsWith('/timer');

  const handleTimerClick = () => {
    const savedRoomId = localStorage.getItem('currentTimerRoomId');

    if (savedRoomId) {
      navigate(`/timer/room/${savedRoomId}`);
    } else {
      navigate('/timer');
    }
  };

  return (
    <nav className="flex gap-6 font-bold text-sm text-white">
      <NavItem to="/home" label="Home" />
      <NavItem to={user ? '/profile' : '/entry'} label="Profile" />

      <button
        onClick={handleTimerClick}
        className={`transition ${
          isTimerActive ? 'text-white' : 'text-white/70 hover:text-white'
        }`}
      >
        Timer
      </button>
    </nav>
  );
}
