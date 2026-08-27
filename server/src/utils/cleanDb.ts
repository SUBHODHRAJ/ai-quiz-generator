import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/ai-quiz-generator";

async function cleanDatabase() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const collections = await mongoose.connection.db?.collections();
    if (collections && collections.length > 0) {
      for (const collection of collections) {
        const count = await collection.countDocuments();
        console.log(`Clearing collection "${collection.collectionName}" (${count} documents)...`);
        await collection.deleteMany({});
      }
    } else {
      console.log("No collections found.");
    }

    console.log("All dummy and test data successfully purged. Database is clean!");
    process.exit(0);
  } catch (error) {
    console.error("Clean DB error:", error);
    process.exit(1);
  }
}

cleanDatabase();
