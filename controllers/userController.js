const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/userModel.js");
const asyncHandler = require("../utils/asyncHandler.js");
const AppError = require("../utils/AppError.js");

// Multer

// Save to mempryStorage as a Buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
  }

  cb(new AppError("Not an image! Please upload only image", false));
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

// Sharp Resize images
exports.resizePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/users/${req.file.filename}`);

  next();
});

// Middleware
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    length: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const id = req.user.id || req.params.id;
  const user = await User.findById(id);

  res.status(200).json({
    status: "success",
    token: req.token,
    data: user,
  });
});

exports.updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    next(new AppError("Tou can't update password here", 400));

  const updatedVals = ["name", "email"];
  const filterObj = {};
  updatedVals.forEach((val) => {
    filterObj[val] = req.body[val];
  });

  if (req.file) filterObj.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user.id, filterObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
