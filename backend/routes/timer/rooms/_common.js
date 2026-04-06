function requireLogin(req, res) {
  const discordId = req.user?.discord_id;
  if (!discordId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return String(discordId);
}

module.exports = {
  requireLogin,
};
