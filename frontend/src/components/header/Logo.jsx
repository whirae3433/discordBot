import { Link, useParams } from 'react-router-dom';

export default function Logo() {
  const { serverId } = useParams();
  return (
    <Link
      to={`/${serverId}/home`}
      className="text-white font-bold text-xl hover:text-gray-300"
    >
      <img
        src="/images/muyeong.png"
        alt="무영이 로고"
        className="h-6 w-6 rounded"
        loading="eager"
        decoding="async"
      />
      <span>무영이</span>
    </Link>
  );
}
