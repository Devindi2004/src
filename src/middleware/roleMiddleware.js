const AppError = require("../utils/AppError");

const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission for this action.", 403));
    }

    return next();
  };

module.exports = { authorize };
