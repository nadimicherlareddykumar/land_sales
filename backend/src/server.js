const dotenv = require("dotenv");
dotenv.config(); // Must be first before any other require that reads env

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  console.log("Database connected successfully.");

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();
