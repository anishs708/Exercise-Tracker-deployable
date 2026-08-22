import { Timestamp } from "mongodb";
import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    exercises:[{
        exercise:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Exercise"
    },
        sets: Number,
        reps: Number,
        weight: Number
    }],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true});
const Workout = mongoose.model("Workout",workoutSchema);
export default Workout;