import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const mongoUri = rawUri?.trim();

  if (!mongoUri) {
    console.error("CRITICAL: MONGO_URI is missing from environment variables.");
    return;
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    console.error(
      "CRITICAL: Invalid MONGO_URI scheme: expected connection string to start with 'mongodb://' or 'mongodb+srv://'."
    );
    return;
  }

  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log("MongoDB connected successfully.");
  } catch (error: any) {
    console.error(
      "MongoDB connection failed. Please ensure 0.0.0.0/0 is added to MongoDB Atlas Network Access IP Whitelist: " +
        (error.message || error)
    );
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime connection error:", err.message);
});
