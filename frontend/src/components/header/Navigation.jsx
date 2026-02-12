import NavItem from './NavItem';
import { useAuth } from '../../hooks/useAuth';

export default function Navigation() {
  const { user } = useAuth();

  return (
    <nav className="flex gap-6 font-bold text-sm text-white">
      <NavItem to="/home" label="Home" />

      <NavItem to={user ? '/profile' : '/entry'} label="Profile" />

      <NavItem to="/servers" label="Servers" />

      <NavItem to="/info" label="Info" />

      <NavItem to="/others" label="Ohters" />
    </nav>
  );
}
