const serverConfigs = require('../config/dataConfig');

// 테스트할 서버 ID
const testServerId = '1256648495599849622';

if (serverConfigs[testServerId]) {
  console.log('서버 설정 불러오기 성공:');
  console.log(serverConfigs[testServerId]);
} else {
  console.error('서버 설정을 찾을 수 없습니다.');
}
