import { FaDiscord } from 'react-icons/fa';

export default function LoginButton({ serverId }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleLogin = () => {
    window.location.href = `${BASE_URL}/api/auth/login?serverId=${serverId}`;
    console.log('BASE_URL from env:', process.env.REACT_APP_BASE_URL);
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
    >
      <FaDiscord />
      Discord 로그인
    </button>
  );
}
