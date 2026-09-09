import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import exerciseRouter from "./src/routes/exercise.route.js";
import userRouter from "./src/routes/user.route.js";
import workoutRouter from "./src/routes/workout.route.js";
import sessionRouter from "./src/routes/session.route.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./src/middlewares/errorhandler.js";

dotenv.config()
const app = express ();
const port = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use("/api/user",userRouter);
app.use("/api/workout",workoutRouter);
app.use("/api/exercise",exerciseRouter);
app.use("/api/sessions",sessionRouter);

app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("connected");

    app.listen(port, () => {
      console.log(`this is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
