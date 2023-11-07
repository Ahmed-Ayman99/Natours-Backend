const express = require("express");

const { protect, restictTo } = require("../controllers/authController.js");
const reviewRoutes = require("./reviewRoutes.js");

const {
  createTour,
  deleteTour,
  getAllTours,
  getMonthlyPlane,
  getTour,
  getToursStats,
  resizeTourPhoto,
  topFiveCheapest,
  updateTour,
  uploadTourPhotos,
} = require("../controllers/tourController.js");

const tourRouter = express.Router();

tourRouter.use("/:tourId/review", reviewRoutes);

tourRouter.route("/top-5-cheapest").get(topFiveCheapest, getAllTours);
tourRouter.route("/tours-stats").get(getToursStats);
tourRouter.route("/monthly-plane/:year").get(getMonthlyPlane);
tourRouter.route("/").get(getAllTours).post(createTour);

tourRouter
  .route("/:id")
  .get(protect, getTour)
  .patch(
    protect,
    restictTo("admin", "lead-guide"),
    uploadTourPhotos,
    resizeTourPhoto,
    updateTour
  )
  .delete(protect, restictTo("admin", "lead-guide"), deleteTour);

module.exports = tourRouter;
