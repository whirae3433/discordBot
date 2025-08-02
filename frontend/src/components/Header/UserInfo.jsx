export default function UserInfo() {
  return (
    <div className="flex font-bold text-white text-xl items-center gap-3">
      <img
        src="/images/avatar-placeholder.png"
        alt="avatar"
        className="w-8 h-8 rounded-full border border-gray-400"
      />
      <span className="text-white text-sm">이케아 님</span>
    </div>
  );
}
