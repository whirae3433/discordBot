import { Link, useParams } from 'react-router-dom';

export default function Logo() {
  const { serverId } = useParams();
  return (
    <Link
      to={`/${serverId}/home`}
      className="text-white font-bold text-xl hover:text-gray-300"
    >
      TIMELESS
    </Link>
  );
}
