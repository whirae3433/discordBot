import { useLocation } from 'react-router-dom';
import NavItem from './NavItem';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="flex gap-6 font-bold text-sm text-white">
      <NavItem to="/" label="Home" activePath={location.pathname} />
      <NavItem
        to="/update/1211483619613220886"
        label="Profile"
        activePath={location.pathname}
      />
      <NavItem to="/about" label="Info" activePath={location.pathname} />
    </nav>
  );
}
