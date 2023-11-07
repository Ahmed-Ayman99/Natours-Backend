const express = require("express");

const {
  createReview,
  delteReview,
  getAllReviews,
  getReview,
} = require("../controllers/reviewController.js");

const { protect, restictTo } = require("../controllers/authController.js");
const { getAllTours } = require("../controllers/tourController.js");

const reviewRoutes = express.Router({ mergeParams: true });

reviewRoutes.use(protect);
reviewRoutes
  .route("/")
  .get(getAllReviews)
  .post(restictTo("user"), createReview);

reviewRoutes.route("/:id").get(getReview).delete(delteReview);

module.exports = reviewRoutes;
