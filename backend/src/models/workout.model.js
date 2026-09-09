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
        ref: "Exercise",
        required: true
    },
        sets: {
            type: Number,
            required: true,
            min: 1
        },
        reps: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps: true});
const Workout = mongoose.model("Workout",workoutSchema);
export default Workout;
