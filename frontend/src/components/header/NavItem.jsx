import { Link } from 'react-router-dom';

export default function NavItem({ to, label, activePath }) {
  const isActive = activePath === to;

  return (
    <div className="relative flex flex-col items-center">
      <Link to={to} className="hover:text-gray-300">
        {label}
      </Link>

      {/* 굵은 밑줄 (헤더 구분선과 같은 위치로) */}
      {isActive && (
        <div className="absolute -bottom-[22px] w-full border-b-2 border-white"></div>
      )}
    </div>
  );
}
