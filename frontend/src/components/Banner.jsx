export default function Banner() {
  return (
    <div className="relative flex flex-col justify-center items-center h-88 md:h-88 text-white w-screen max-w-none bg-black">
      {/* 배너 텍스트 */}
      <div className="relative text-center mt-12 md:mt-12">
        <h2 className="text-xl md:text-xl font-bold">
          1. '!정보 &lt;닉네임&gt;' 입력하면 본계정, 부계정 2개만 출력됩니다.
          <br />
          2. '!정보 &lt;닉네임&gt; 버프' 입력하면 버프캐만 출력됩니다. ( 구현
          예정 )<br />
          3. '!정보 &lt;닉네임&gt; all' 입력하면 전부 출력됩니다. ( 구현 예정 )
          <br />
          4. 이미지URL은 .jpg .jpeg .png 만 되고 같은 계정내 최초 등록한
          이미지가 적용됩니다.
        </h2>
        <p className="text-gray-300 mt-3 text-base md:text-lg">
          수정기능이 없습니다. 삭제 후 재등록 바랍니다.
        </p>
      </div>
    </div>
  );
}
