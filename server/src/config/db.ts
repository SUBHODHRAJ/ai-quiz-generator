import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  try {
    const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const mongoUri = rawUri?.trim();

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing from environment variables.");
    }

    if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
      throw new Error(
        "Invalid MONGO_URI scheme: expected connection string to start with 'mongodb://' or 'mongodb+srv://'."
      );
    }

    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully.");
  } catch (error: any) {
    console.error("MongoDB connection failed:", error.message || error);
    throw error;
  }
};
