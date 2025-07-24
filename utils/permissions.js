const channelConfigMap = require('../config');

function isAdmin(channelId, userId) {
  const config = channelConfigMap[channelId];
  //console.log('[isAdmin check]', { channelId, userId, admins: config?.admins });
  if (!config || !config.admins) return false;
  return config.admins.includes(userId);
}

module.exports = { isAdmin };
