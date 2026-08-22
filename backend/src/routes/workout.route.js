import express from "express";
import { createWorkout,deleteWorkout,updateWorkout,getAWorkout,getAllWorkouts } from "../controllers/workout.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get('/',getAllWorkouts);
router.get('/:id',getAWorkout);
router.post('/',createWorkout);
router.delete('/:id',deleteWorkout);
router.patch('/:id',updateWorkout);

export default router;