import express from "express";
import {getAExercise,getAllExercise } from "../controllers/exercise.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get('/',getAllExercise);
router.get('/:id',getAExercise);

export default router;