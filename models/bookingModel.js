const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, "Boking must have a price"],
  },
  paid: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Review must belong to a tour."],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user"],
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "tour",
    select: "name",
  });

  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
