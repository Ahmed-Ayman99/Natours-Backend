const multer = require("multer");
const sharp = require("sharp");

const Tour = require("../models/tourModel.js");
const featuresAPI = require("../utils/featuresAPI.js");
const asyncHandler = require("../utils/asyncHandler.js");

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

exports.uploadTourPhotos = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// Sharp Resize images
exports.resizeTourPhoto = asyncHandler(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(200, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`tours/${req.body.imageCover}`);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(200, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.topFiveCheapest = asyncHandler(async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-ratingsAverage,price";
  next();
});

exports.getAllTours = asyncHandler(async (req, res, next) => {
  const { query } = new featuresAPI(Tour.find(), req.query)
    .sort()
    .filter()
    .pagination()
    .limitation();

  const tours = await query;

  res.status(200).json({
    status: "succeess",
    results: tours.length,
    data: tours,
  });
});

exports.getTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)
    .populate({
      path: "guides",
      select: "-__v",
    })
    .populate({
      path: "reviews",
      select: "-__v",
    });

  if (!tour) return next(new Error("No tour found with this ID"));

  res.status(201).json({
    status: "success",
    data: tour,
  });
});

exports.createTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.deleteTour = asyncHandler(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);

  res.status(201).json({
    status: "success",
    data: null,
  });
});

exports.updateTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: tour,
  });
});

exports.getToursStats = asyncHandler(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: null,
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRatings: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        maxPrice: { $max: "$price" },
        minPrice: { $avg: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: stats,
  });
});

exports.getMonthlyPlane = asyncHandler(async (req, res, next) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: {
          $push: {
            name: "$name",
            imageCover: "$imageCover",
            description: "$description",
            ratingsAverage: "$ratingsAverage",
            duration: "$duration",
            difficulty: "$difficulty",
            summary: "$summary",
            locations: "$locations",
            maxGroupSize: "$maxGroupSize",
            price: "$price",
            ratingsAverage: "$ratingsAverage",
            ratingsQuantity: "$ratingsQuantity",
            id: "$_id",
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: plan,
  });
});
