const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const { signToken } = require("../utils/jwt");
const { requireFields } = require("../utils/validators");

const sanitizeUser = (user) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  return safeUser;
};

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = signToken(user);
  return successResponse(res, {
    statusCode,
    message: "Authentication successful.",
    data: { token, user: sanitizeUser(user) },
  });
};

const register = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "email", "password"]);

  const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
  if (existingUser) throw new AppError("Email is already registered.", 409);

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone || "",
    role: req.body.role && ["kitchen", "admin"].includes(req.body.role) ? "customer" : "customer",
  });

  sendAuthResponse(res, user, 201);
});

const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password"]);

  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) throw new AppError("Your account is inactive.", 403);

  sendAuthResponse(res, user);
});

const me = asyncHandler(async (req, res) => {
  successResponse(res, {
    message: "Current user fetched.",
    data: { user: req.user },
  });
});

module.exports = { login, me, register };
