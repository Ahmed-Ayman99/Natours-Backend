const Review = require("../models/reviewModel.js");
const Tour = require("../models/tourModel.js");
const AppError = require("../utils/AppError.js");
const asyncHandler = require("../utils/asyncHandler.js");

exports.getAllReviews = asyncHandler(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  if (req.user) filter = { user: req.user._id };

  const reviews = await Review.find(filter)
    .populate({
      path: "user",
    })
    .populate({
      path: "tour",
    });

  res.status(200).json({
    status: "success",
    length: reviews.length,
    data: reviews,
  });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate({
      path: "user",
    })
    .populate({
      path: "tour",
    });

  res.status(200).json({
    status: "success",
    data: review,
  });
});

exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.tour = req.body.tour || req.params.tourId;
  req.body.user = req.body.user || req.user.id;

  const tour = await Tour.findOne({ tour: req.body.tour, user: req.body.user });

  if (!tour) return next(new AppError("Your don't have permession", 403));

  const review = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: review,
  });
});

exports.delteReview = asyncHandler(async (req, res, next) => {
  await Review.findByIdAndDelete(req.params.id);

  res.status(201).json({
    status: "success",
  });
});
