const express = require("express");

const {
  getAllUsers,
  getUser,
  resizePhoto,
  updateMe,
  uploadUserPhoto,
} = require("../controllers/userController.js");
const reviewRoutes = require("./reviewRoutes.js");

const {
  forgetPassword,
  login,
  logout,
  protect,
  resetpassword,
  restictTo,
  signup,
  updatePassword,
} = require("../controllers/authController.js");

const userRoutes = express.Router();

userRoutes.use("/my-reviews", reviewRoutes);

userRoutes.route("/signup").post(signup);
userRoutes.route("/login").post(login);
userRoutes.route("/logout").get(logout);

userRoutes.use(protect);
userRoutes.route("/forgotpassword").post(forgetPassword);
userRoutes.route("/resetpassword/:token").patch(resetpassword);
userRoutes.route("/updatepassword").patch(protect, updatePassword);

userRoutes.patch("/updateMe", uploadUserPhoto, resizePhoto, updateMe);
userRoutes.route("/").get(restictTo("admin"), getAllUsers);
userRoutes.get("/me", getUser);
userRoutes.route("/:id").get(getUser);

module.exports = userRoutes;
