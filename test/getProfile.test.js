jest.mock('../utils/googleSheets', () => ({
  sheets: {
    spreadsheets: {
      values: {
        get: jest.fn().mockResolvedValue({
          data: {
            values: [
              [
                '디코ID',
                '프로필 사진',
                '닉네임',
                '인겜닉',
                '직업군',
                '직업',
                '레벨',
                '스공',
                '보공',
                '스킬',
              ],
              [
                '12345',
                'https://img.url',
                '이케아',
                'IGN',
                '전사',
                '히어로',
                '250',
                '10000',
                '200',
                '스킬A',
              ],
            ],
          },
        }),
      },
    },
  },
}));

const { getProfileByNickname } = require('../utils/getProfile');

test('닉네임으로 프로필 찾기', async () => {
  const fakeMessage = {
    guild: { id: '1392521025039892590' },
    reply: jest.fn(),
  };

  const result = await getProfileByNickname(fakeMessage, '이케아');

  expect(result.nicknameValue).toBe('이케아');
});
