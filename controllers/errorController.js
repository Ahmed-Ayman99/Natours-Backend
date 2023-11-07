const AppError = require("../utils/AppError.js");

// const Handel Error
const handelCastError = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handelValidateError = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const handelDuplicateError = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}, Please use another value`;

  return new AppError(message, 400);
};

const handelJsonWebTokenError = (err) =>
  new AppError("Invalid token, Please login again");

const handeTokenExpiredError = () =>
  new AppError("Token has been expired, Please login again");

// Send Response
const sendDevErr = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    stack: err.stack,
    message: err.message,
    error: err,
  });
};

const sendProdErr = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (!err.isOperational) {
    res.status(err.statusCode).json({
      status: "error",
      message: "Something went very wrong",
      err: err,
    });
  }
};

// Controller
const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevErr(res, err);
  }

  if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));

    if (error.name === "CastError") err = handelCastError(err);
    if (error.name === "ValidationError") err = handelValidateError(err);
    if (error.code === 11000) err = handelDuplicateError(err);

    if (error.name === "JsonWebTokenError") err = handelJsonWebTokenError(err);
    if (error.name === "TokenExpiredError") err = handeTokenExpiredError(err);

    sendProdErr(res, err);
  }
};
module.exports = errorController;
