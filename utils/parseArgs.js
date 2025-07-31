/**
 * @param {string[]} args - 명령어 입력 인자 배열 (명령어 키워드 제외)
 * @param {Object} options - 파싱 옵션
 * @param {boolean} options.requireName - 닉네임 필수 여부
 * @param {boolean} options.allowNumbers - 숫자 인자 허용 여부
 * @param {boolean} options.allowFlags - --플래그 허용 여부
 * @returns {Object} { name, numbers, flags, restArgs, error }
 */
function parseArgs(args, options = {}) {
  const {
    requireName = false,
    allowNumbers = false,
    allowFlags = false,
  } = options;

  // 최소 인자 검사
  if (!args || args.length === 0) {
    return { error: '명령어가 잘못됐어. 도움이 필요하면 <!무영>을 불러줘.' };
  }

  // 1. 닉네임 파싱 (첫 번째 인자)
  const name = requireName ? args[0] : null;

  // 2. 숫자 인자 파싱
  const numbers = allowNumbers
    ? args.filter((arg) => /^\d+$/.test(arg)).map(Number)
    : [];

  // 3. 플래그 파싱 (--옵션)
  const flags = allowFlags
    ? args.filter((arg) => arg.startsWith('--')).map((flag) => flag.replace('--', ''))
    : [];

  // 4. 나머지 인자 (닉네임/숫자/플래그 제외)
  const restArgs = args.filter(
    (arg) =>
      arg !== name &&
      !numbers.includes(Number(arg)) &&
      !flags.includes(arg.replace('--', ''))
  );

  return { name, numbers, flags, restArgs };
}

module.exports = parseArgs;
