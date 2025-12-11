export default function LoginButton({ serverId }) {
  const handleLogin = () => {
    const apiBase =
      process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';
    window.location.href = `${apiBase}/api/auth/login?serverId=${serverId}`;
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
    >
      Discord 로그인
    </button>
  );
}
