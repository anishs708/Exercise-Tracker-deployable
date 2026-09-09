import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
    targetReps: {
        type: Number,
        required: true,
        min: 1
    },
    reps: {
        type: Number,
        min: 0,
        default: 0
    },
    weight: {
        type: Number,
        min: 0,
        default: 0
    },
        addedWeight: {
        type: Number,
        min: 0,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const sessionExerciseSchema = new mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
        required: true
    },
    trackingType: {
        type: String,
        enum: ["external_weight", "bodyweight", "bodyweight_added"],
        required: true
    },
    bodyWeight: {
        type: Number,
        min: 0,
        default: 0
    },
    comments: {
        type: String,
        trim: true,
        default: ""
    },
    sets: {
        type: [setSchema],
        validate: {
            validator: (sets) => sets.length > 0,
            message: "Each exercise must contain at least one set"
        }
    }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    workout: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        required: true
    },
    workoutName: {
        type: String,
        required: true,
        trim: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["scheduled", "in_progress", "completed", "cancelled"],
        default: "scheduled"
    },
    completedAt: {
        type: Date,
        default: null
    },
    comments: {
        type: String,
        trim: true,
        default: ""
    },
    exercises: {
        type: [sessionExerciseSchema],
        validate: {
            validator: (exercises) => exercises.length > 0,
            message: "A workout session must contain at least one exercise"
        }
    },
    weightUnit: {
        type: String,
        enum: ["kg", "lb"],
        required: true,
        default: "lb"
    }
}, { timestamps: true });

const WorkoutSession = mongoose.model("WorkoutSession", sessionSchema);

export default WorkoutSession;
