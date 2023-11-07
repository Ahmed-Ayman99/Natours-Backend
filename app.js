const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const stripe = require("stripe")(
  "sk_test_51Mmkd8KJrcYzSRjrtCSLdF937kUlQ6vu4gwO2m7TEstGmISGGko4HzGJLPT5h87YdIAR2ObEmSMAr1hGK3R7v2ac00GX3uCeQu"
);

const endpointSecret =
  "whsec_7e1a7091bd73dce17b4dd4e3447a5824173e6a635aec2b104a7fa61365d9d6ea";

const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRoutes = require("./routes/tourRoutes.js");
const errorController = require("./controllers/errorController.js");
const userRoutes = require("./routes/userRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const { webhookCheckout } = require("./controllers/bookingController.js");

const app = express();

app.use("/assets", express.static("./public"));
app.use(
  cors({
    credentials: true,
  })
);

app.options("*", cors());

//_________ protection MDW _________
// Rate_Limiter

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "difficulty",
      "ratingsAverage",
      "ratingsQuantity",
      "price",
    ],
  })
);

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// webhook - Checkout;
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

app.set("view engine", "pug");
app.set("views", "./views");

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/api/tours", tourRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);

app.all("*", (req, _, next) => {
  const err = new Error(`Can't Find ${req.originalUrl}`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

app.use(errorController);

module.exports = app;
