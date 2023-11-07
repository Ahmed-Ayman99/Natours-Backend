const app = require("./app.js");
const connectDB = require("./utils/connectDB.js");

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

connectDB();

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(port));
