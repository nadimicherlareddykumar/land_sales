const mongoose = require("mongoose");
let MongoMemoryServer;
try {
  MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
} catch (e) {}

let mongod = null;

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  try {
    if (uri && uri.includes("127.0.0.1") && MongoMemoryServer) {
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`Using MongoDB in-memory server at ${uri}`);
    } else if (!uri) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB_NAME || undefined
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
