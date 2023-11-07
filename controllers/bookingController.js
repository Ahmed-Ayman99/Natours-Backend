const stripe = require("stripe")(
  "sk_test_51Mmkd8KJrcYzSRjrtCSLdF937kUlQ6vu4gwO2m7TEstGmISGGko4HzGJLPT5h87YdIAR2ObEmSMAr1hGK3R7v2ac00GX3uCeQu"
);

const endpointSecret = "whsec_wClyqzqbdvk5zC3WS6aUcg5j6aJDUwCm";
const asyncHandler = require("../utils/asyncHandler.js");
const featuresAPI = require("../utils/featuresAPI.js");
const Booking = require("../models/bookingModel.js");
const Tour = require("../models/tourModel.js");
const User = require("../models/userModel.js");

exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const { query } = new featuresAPI(Booking.find(), req.query)
    .sort()
    .filter()
    .pagination()
    .limitation();

  const bookings = await query;

  res.status(200).json({
    status: "succeess",
    results: bookings.length,
    data: bookings,
  });
});

exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map((booking) => booking.tour.id);

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).json({
    status: "succeess",
    results: tours.length,
    data: tours,
  });
});

exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) return next(new Error("No booking found with this ID"));

  res.status(201).json({
    status: "success",
    data: booking,
  });
});

exports.createBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.create(req.body);

  res.status(201).json({
    status: "success",
    data: booking,
  });
});

exports.updateBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(201).json({
    status: "success",
    data: booking,
  });
});

exports.deleteBooking = asyncHandler(async (req, res, next) => {
  await Booking.findByIdAndDelete(req.params.id);

  res.status(201).json({
    status: "success",
  });
});

// Checkout  Booking  & Stripe
exports.getCheckoutSession = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `https://ahmed-ayman-natours.netlify.app/`,
    cancel_url: `https://ahmed-ayman-natours.netlify.app/tour/${tour.id}`,

    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `https://backendnatours-production.up.railway.app/public/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].unit_amount / 100;

  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed")
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};
