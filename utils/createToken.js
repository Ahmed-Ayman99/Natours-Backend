const JWT = require("jsonwebtoken");

const createToken = (res, id) => {
  const token = JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  const cookieOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 90 * 24 * 60 * 60 * 1000,
  };

  res.cookie("jwt", token, cookieOption);

  return token;
};

module.exports = createToken;
