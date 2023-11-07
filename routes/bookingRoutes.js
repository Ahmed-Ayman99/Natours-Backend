const express = require("express");

const {
  getCheckoutSession,
  getAllBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  getMyBookings,
} = require("../controllers/bookingController.js");

const { protect } = require("../controllers/authController.js");

const bookingRoutes = express.Router();

bookingRoutes.use(protect);
bookingRoutes.get("/myTours", getMyBookings);

bookingRoutes.get("/checkout-session/:tourId", protect, getCheckoutSession);
bookingRoutes.route("/:id").get(getBooking).patch(updateBooking);
bookingRoutes
  .route("/")
  .get(getAllBookings)
  .post(createBooking)
  .delete(deleteBooking);

module.exports = bookingRoutes;
