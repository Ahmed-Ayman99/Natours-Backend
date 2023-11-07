const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
    );
  } catch (err) {
    console.error(`Error : ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
