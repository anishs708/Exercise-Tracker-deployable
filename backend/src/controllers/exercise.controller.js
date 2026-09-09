import mongoose from "mongoose";
import exercise from "../models/exercise.model.js";
import asyncHandler from "express-async-handler";

const getAExercise = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400);
        throw new Error("Doesn't exist");
    }
    const found = await exercise.findOne({_id: id});
    if(!found){
        res.status(404);
        throw new Error("Exercise is not found");
    }
    res.status(200).json(found);
});
const getAllExercise = asyncHandler(async(req,res)=>{
    const exercises = await exercise.find().sort({name: 1})
    res.json(exercises);
})
export {getAExercise,getAllExercise}
