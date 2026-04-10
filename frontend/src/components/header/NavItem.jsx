import { NavLink } from 'react-router-dom';

export default function NavItem({ to, label }) {
  return (
    <NavLink to={to} className="relative flex flex-col items-center">
      {({ isActive }) => (
        <>
          <span
            className={`transition ${
              isActive
                ? 'text-black'
                : 'text-zinc-500 font-semibold hover:text-black'
            }`}
          >
            {label}
          </span>

          {/* 밑줄 */}
          {isActive && (
            <div className="absolute left-0 right-0 -bottom-[15px] h-[1.2px] bg-black" />
          )}
        </>
      )}
    </NavLink>
  );
}
