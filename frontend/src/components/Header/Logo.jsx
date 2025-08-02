import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link
      to="/"
      className="text-white font-bold text-xl hover:text-gray-300"
    >
      TIMELESS
    </Link>
  );
}
