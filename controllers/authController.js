const JWT = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");

const asyncHandler = require("../utils/asyncHandler.js");
const createToken = require("../utils/createToken.js");
const AppError = require("../utils/AppError.js");
const User = require("../models/userModel.js");
const sendEmail = require("../utils/email.js");
const Email = require("../utils/email.js");

// MiddleWare
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  user.password = undefined;
  const token = createToken(res, user.id);

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;

  const user = await User.findOne({ email }).select("+password +active");
  if (!user) return next(new AppError("You are not have account please sinup"));

  const correct = user && (await user.matchPassword(password, user.password));

  if (!correct) return next(new AppError("Incorrect Password"));

  const token = createToken(res, user.id);
  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({ status: "success" });
};

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next("There is no user with this email", 404);

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}`;
  const message = `Forget your password? submit a PATCH request with new password and passwordConfirm to:${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (Valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token send to email ",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new AppError("There was an error ", 500));
  }
});

exports.resetpassword = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();
  user.password = undefined;

  createToken(res, user.id);

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const correct = await user.matchPassword(
    req.body.currentPassword,
    user.password
  );

  if (!correct)
    return next(new AppError("Your current password is wrong", 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  user.password = undefined;
  const token = createToken(res, user.id);

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  const authExist =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer");

  const errorsMsgs = {
    userBelonging: "The user belonging to this token does no longer exist.",
    userNotlogged: "You are not logged in! Please log in to get access.",
    userNoExist: "the user has no longest exist",
  };

  if (req.cookies.jwt) token = req.cookies.jwt;
  if (authExist) token = req.headers.authorization.split(" ")[1];

  if (!token) return next(new AppError(errorsMsgs.userNotlogged, 401));

  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) return next(new AppError(errorsMsgs.userBelonging, 401));
  if (currentUser.changePasswordAfter(decoded.iat))
    return next(new AppError(errorsMsgs.userNoExist, 401));

  req.user = currentUser;
  req.token = token;
  next();
});

exports.restictTo = (...roles) => {
  return (req, _, next) => {
    if (roles.includes(req.user.role)) return next();
    next(new AppError("Your don't have permession", 403));
  };
};
