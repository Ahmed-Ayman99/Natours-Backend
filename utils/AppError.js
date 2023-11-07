class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// const appErr=(msg,statusCode)=>{
//   const err = new Error(msg)
//   err.status = `${statusCode}`.startsWith("4") ? "fail" : "error"
//   err.statusCode = statusCode
//   Error.captureStackTrace(err,appErr)
//   return err
// }
// const er= appErr("msg",404)

module.exports = AppError;
