export default function AddCharacterCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-zinc-100 rounded-none p-4 flex flex-col items-center justify-center shadow hover:shadow-md transition cursor-pointer"
    >
      <span className="text-4xl text-gray-500 font-bold">+</span>
    </div>
  );
}
