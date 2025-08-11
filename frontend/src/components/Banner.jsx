export default function Banner() {
  return (
    <div className="relative flex flex-col justify-center items-center h-88 md:h-72 text-white w-screen max-w-none bg-black">
      {/* 배너 텍스트 */}
      <div className="relative text-center mt-12 md:mt-12">
        <h2 className="text-sm md:text-base font-medium text-gray-300 leading-relaxed">
          1. '!정보 &lt;닉네임&gt;' 입력하면 본계정, 부계정 2개만 출력됩니다.
          <br />
          2. '!정보 &lt;닉네임&gt; 버프' 입력하면 버프캐만 출력됩니다. ( 구현
          예정 )<br />
          3. '!정보 &lt;닉네임&gt; all' 입력하면 전부 출력됩니다. ( 구현 예정 )
          <br />
          4. 이미지URL은 .jpg .jpeg .png 만 되고 같은 계정내 최초 등록한
          이미지가 적용됩니다.
        </h2>
        <p className="mt-4 text-2xl md:text-3xl font-extrabold text-red-500">
          수정 기능 추가 완료!
        </p>
      </div>
    </div>
  );
}
