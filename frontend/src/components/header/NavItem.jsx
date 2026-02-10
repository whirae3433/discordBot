import { NavLink } from 'react-router-dom';

export default function NavItem({ to, label }) {
  return (
    <NavLink to={to} className="relative flex flex-col items-center">
      {({ isActive }) => (
        <>
          <span
            className={`hover:text-gray-300 ${
              isActive ? 'text-white font-bold' : 'text-gray-400'
            }`}
          >
            {label}
          </span>

          {/* 굵은 밑줄 (헤더 구분선과 같은 위치) */}
          {isActive && (
            <div className="absolute -bottom-[22px] w-full border-b-2 border-white" />
          )}
        </>
      )}
    </NavLink>
  );
}
