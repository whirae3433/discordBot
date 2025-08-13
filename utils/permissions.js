const channelConfigMap = require('../config');

function isAdmin(serverId, userId) {
  const config = channelConfigMap[serverId];
  if (!config?.admins) return false;
  return config.admins.includes(userId);
}
module.exports = { isAdmin };
