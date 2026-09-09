import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Workout from "../models/workout.model.js";
import WorkoutSession from "../models/session.model.js";

const sessionPopulate = [
    { path: "workout", select: "name description" },
    { path: "exercises.exercise", select: "name category muscleGroup trackingType" }
];

const validateWeightUnit = (weightUnit) => {
    if (!["kg", "lb"].includes(weightUnit)) {
        const error = new Error("weightUnit must be kg or lb");
        error.statusCode = 400;
        throw error;
    }
};

const validateId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error("Invalid session id");
        error.statusCode = 400;
        throw error;
    }
};

const findOwnedSession = async (id, userId) => {
    validateId(id);

    const session = await WorkoutSession.findOne({ _id: id, user: userId });
    if (!session) {
        const error = new Error("Workout session not found");
        error.statusCode = 404;
        throw error;
    }

    return session;
};

const populateSession = async (session) => {
    await session.populate(sessionPopulate);
    return session;
};

const createSession = asyncHandler(async (req, res) => {
    const {
        workout: workoutId,
        scheduledAt,
        comments = "",
        weightUnit = "lb"
    } = req.body;

    if (!workoutId || !scheduledAt) {
        res.status(400);
        throw new Error("Workout and scheduledAt are required");
    }

    if (!mongoose.Types.ObjectId.isValid(workoutId)) {
        res.status(400);
        throw new Error("Invalid workout id");
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
        res.status(400);
        throw new Error("scheduledAt must be a valid date");
    }

    validateWeightUnit(weightUnit);

    const workout = await Workout.findOne({
        _id: workoutId,
        user: req.user._id
    }).populate("exercises.exercise", "trackingType");

    if (!workout) {
        res.status(404);
        throw new Error("Workout not found");
    }

    if (workout.exercises.length === 0) {
        res.status(400);
        throw new Error("Cannot schedule a workout with no exercises");
    }

    if (workout.exercises.some((workoutExercise) => !workoutExercise.exercise)) {
        res.status(400);
        throw new Error("Workout contains an exercise that no longer exists");
    }

    const exercises = workout.exercises.map((workoutExercise) => ({
        exercise: workoutExercise.exercise._id,
        trackingType: workoutExercise.exercise.trackingType,
        sets: Array.from({ length: workoutExercise.sets }, () => ({
            targetReps: workoutExercise.reps
        }))
    }));

    const session = await WorkoutSession.create({
        user: req.user._id,
        workout: workout._id,
        workoutName: workout.name,
        scheduledAt: scheduledDate,
        comments,
        weightUnit,
        exercises
    });

    res.status(201).json(await populateSession(session));
});

const getUpcomingSessions = asyncHandler(async (req, res) => {
    const sessions = await WorkoutSession.find({
        user: req.user._id,
        status: { $in: ["scheduled", "in_progress"] }
    })
        .sort({ scheduledAt: 1 })
        .populate(sessionPopulate);

    res.status(200).json(sessions);
});

const getSessionHistory = asyncHandler(async (req, res) => {
    const sessions = await WorkoutSession.find({
        user: req.user._id,
        status: { $in: ["completed", "cancelled"] }
    })
        .sort({ updatedAt: -1 })
        .populate(sessionPopulate);

    res.status(200).json(sessions);
});

const getSession = asyncHandler(async (req, res) => {
    const session = await findOwnedSession(req.params.id, req.user._id);
    res.status(200).json(await populateSession(session));
});

const startSession = asyncHandler(async (req, res) => {
    const session = await findOwnedSession(req.params.id, req.user._id);

    if (session.status !== "scheduled") {
        res.status(409);
        throw new Error("Only a scheduled session can be started");
    }

    session.status = "in_progress";
    await session.save();

    res.status(200).json(await populateSession(session));
});

const applyCompletedSets = (session, submittedExercises) => {
    if (!Array.isArray(submittedExercises)) {
        const error = new Error("exercises must be an array");
        error.statusCode = 400;
        throw error;
    }

    if (submittedExercises.length !== session.exercises.length) {
        const error = new Error("Submit results for every exercise in the session");
        error.statusCode = 400;
        throw error;
    }

    submittedExercises.forEach((submittedExercise, exerciseIndex) => {
        const sessionExercise = session.exercises[exerciseIndex];
        const { bodyWeight = 0, comments = "" } = submittedExercise;

        if (!Number.isFinite(bodyWeight) || bodyWeight < 0) {
            const error = new Error(`Exercise ${exerciseIndex + 1} needs a non-negative bodyWeight`);
            error.statusCode = 400;
            throw error;
        }

        if (typeof comments !== "string") {
            const error = new Error(`Exercise ${exerciseIndex + 1} comments must be text`);
            error.statusCode = 400;
            throw error;
        }

        if (sessionExercise.trackingType === "bodyweight_added" && bodyWeight <= 0) {
            const error = new Error(`Exercise ${exerciseIndex + 1} requires bodyWeight`);
            error.statusCode = 400;
            throw error;
        }

        sessionExercise.bodyWeight = sessionExercise.trackingType === "bodyweight_added"
            ? bodyWeight
            : 0;
        sessionExercise.comments = comments.trim();

        if (!Array.isArray(submittedExercise.sets) ||
            submittedExercise.sets.length !== sessionExercise.sets.length) {
            const error = new Error(`Submit results for every set in exercise ${exerciseIndex + 1}`);
            error.statusCode = 400;
            throw error;
        }

        submittedExercise.sets.forEach((submittedSet, setIndex) => {
            const { reps, weight = 0, addedWeight = 0, completed } = submittedSet;

            if (!Number.isFinite(reps) || reps < 0 ||
                !Number.isFinite(weight) || weight < 0 ||
                !Number.isFinite(addedWeight) || addedWeight < 0 ||
                typeof completed !== "boolean") {
                const error = new Error(
                    `Exercise ${exerciseIndex + 1}, set ${setIndex + 1} needs non-negative reps, weight, and addedWeight plus a completed boolean`
                );
                error.statusCode = 400;
                throw error;
            }

            const storedSet = sessionExercise.sets[setIndex];
            storedSet.reps = reps;
            storedSet.weight = sessionExercise.trackingType === "external_weight" ? weight : 0;
            storedSet.addedWeight = sessionExercise.trackingType === "bodyweight_added" ? addedWeight : 0;
            storedSet.completed = completed;
        });
    });
};

const completeSession = asyncHandler(async (req, res) => {
    const session = await findOwnedSession(req.params.id, req.user._id);

    if (session.status !== "in_progress") {
        res.status(409);
        throw new Error("Only an in-progress session can be completed");
    }

    applyCompletedSets(session, req.body.exercises);

    if (req.body.weightUnit !== undefined) {
        validateWeightUnit(req.body.weightUnit);
        session.weightUnit = req.body.weightUnit;
    }

    if (req.body.comments !== undefined) {
        session.comments = req.body.comments;
    }

    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    res.status(200).json(await populateSession(session));
});

const cancelSession = asyncHandler(async (req, res) => {
    const session = await findOwnedSession(req.params.id, req.user._id);

    if (!["scheduled", "in_progress"].includes(session.status)) {
        res.status(409);
        throw new Error("Only a scheduled or in-progress session can be cancelled");
    }

    if (req.body.comments !== undefined) {
        session.comments = req.body.comments;
    }

    session.status = "cancelled";
    session.completedAt = null;
    await session.save();

    res.status(200).json(await populateSession(session));
});

const deleteSession = asyncHandler(async (req, res) => {
    validateId(req.params.id);

    const session = await WorkoutSession.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!session) {
        res.status(404);
        throw new Error("Workout session not found");
    }

    res.status(200).json(session);
});

export {
    createSession,
    getUpcomingSessions,
    getSessionHistory,
    getSession,
    startSession,
    completeSession,
    cancelSession,
    deleteSession
};
