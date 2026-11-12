const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/AegisDB";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB Connected");
  } catch (error) {
    const isLocalUri = uri.includes("127.0.0.1") || uri.includes("localhost");
    const allowFallback = process.env.NODE_ENV !== "production" && isLocalUri;
    if (allowFallback) {
      try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const dbPath = path.join(__dirname, "..", ".mongo-data");
        fs.mkdirSync(dbPath, { recursive: true });
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbPath,
            storageEngine: "wiredTiger",
            dbName: "AegisDB",
          },
        });
        const memUri = memoryServer.getUri("AegisDB");
        await mongoose.connect(memUri);
        console.log("MongoDB Connected (local dev embedded instance)");
        return;
      } catch (fallbackErr) {
        console.error("Embedded MongoDB fallback failed:", fallbackErr.message);
      }
    }
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
