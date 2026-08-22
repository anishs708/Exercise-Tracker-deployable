import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Exercise from "../models/exercise.model.js";

dotenv.config();

const dataFile = new URL("../data/exercises.json", import.meta.url);

const seedExercises = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is missing from .env");
  }

  const exercises = JSON.parse(await readFile(dataFile, "utf8"));

  await mongoose.connect(process.env.MONGODB_URL);

  const result = await Exercise.bulkWrite(
    exercises.map((exercise) => ({
      updateOne: {
        filter: { name: exercise.name },
        update: { $set: exercise },
        upsert: true
      }
    }))
  );

  console.log(
    `Exercise seed complete: ${result.upsertedCount} added, ${result.modifiedCount} updated.`
  );
};

try {
  await seedExercises();
} catch (error) {
  console.error(`Exercise seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
