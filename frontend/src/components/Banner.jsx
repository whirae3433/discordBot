import Header from './Header/Header';

export default function Banner() {
  return (
    <div
      className="relative flex flex-col justify-center items-center h-72 md:h-72 text-white w-screen max-w-none bg-black"
      style={{
        backgroundImage: `url('/images/time7.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 검정 반투명 오버레이 */}
      <div className="absolute inset-0 bg-black/75"></div>

      {/* 헤더 겹치게 */}
      <Header />

      {/* 배너 텍스트 */}
      <div className="relative text-center mt-12 md:mt-20">
        
        <p className="text-gray-300 mt-3 text-base md:text-lg"></p>
      </div>
    </div>
  );
}
