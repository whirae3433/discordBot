import { useLocation, useParams } from 'react-router-dom';
import NavItem from './NavItem';
import { useAuth } from '../../hooks/useAuth';

export default function Navigation() {
  const location = useLocation();
  const { serverId } = useParams();
  const { user } = useAuth();

  return (
    <nav className="flex gap-6 font-bold text-sm text-white">
      <NavItem
        to={`/${serverId}/home`}
        label="Home"
        activePath={location.pathname}
      />

      <NavItem
        to={`/${serverId}/profile/${user ? user.id : 'guest'}`}
        label='Profile'
        activePath={location.pathname}
      />

      <NavItem
        to={`/${serverId}/info`}
        label="Info"
        activePath={location.pathname}
      />
    </nav>
  );
}
