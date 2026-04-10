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
    <nav className="flex gap-6 font-bold text-sm text-zinc-700">
      <NavItem to="/home" label="Home" />
      <NavItem to={user ? '/profile' : '/entry'} label="Profile" />

      <button
        onClick={handleTimerClick}
        className="relative flex flex-col items-center"
      >
        <span
          className={`transition ${
            isTimerActive
              ? 'text-black'
              : 'text-zinc-500 font-semibold hover:text-black'
          }`}
        >
          Timer
        </span>

        {isTimerActive && (
          <div className="absolute left-0 right-0 -bottom-[15px] h-[1.2px] bg-black" />
        )}
      </button>
    </nav>
  );
}
