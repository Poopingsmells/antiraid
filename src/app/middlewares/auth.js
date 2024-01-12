module.exports = (req, res, next) => {
  return req.session.passport?.user ? next() : res.redirect("auth/login");
};
