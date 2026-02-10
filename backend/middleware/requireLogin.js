module.exports = function requireLogin(req, res, next) {
  if (!req.session?.user?.id) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  next();
};
