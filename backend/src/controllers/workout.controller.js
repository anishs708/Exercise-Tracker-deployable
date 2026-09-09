import mongoose from "mongoose";
import workout from "../models/workout.model.js";
import asyncHandler from "express-async-handler";

const getAWorkout = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400);
        throw new Error("Doesn't exist");
    }   
    const user_id = req.user._id
    const found = await workout.findOne({_id:id,user : user_id});
    if(!found){
        res.status(404);
        throw new Error("Didn't find this workout")
    }
    res.status(200).json(found);

});
const getAllWorkouts = asyncHandler(async(req,res)=>{
    const user_id = req.user._id
    const workouts = await workout.find({user:user_id}).sort({createdAt: -1});
    res.status(200).json(workouts);
})
const updateWorkout = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400);
        throw new Error("Doesn't exist");
    }
    const user_id = req.user._id
    const updated = await workout.findOneAndUpdate(
        {_id: id, user: user_id},
        req.body,
        {new:true, runValidators:true}
    );
    if(!updated){
        res.status(404);
        throw new Error("Didn't find this workout");
    }
    res.status(200).json(updated);
});
const deleteWorkout = asyncHandler(async(req,res)=>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
    res.status(400);
    throw new Error("Doesn't exist");
}
    const user_id = req.user._id;
    const deleted = await workout.findOneAndDelete({_id:id,user:user_id});
    if(!deleted){
        res.status(404);
        throw new Error("Didn't find this workout");
    }
    res.status(200).json(deleted);
})
const createWorkout = asyncHandler(async(req,res)=>{
    const {name,description,exercises} = req.body;
    if(!name || !description || !exercises){
        res.status(400);
        throw new Error("Enter all fields");
    }
    const user_id = req.user._id
    const newWorkout = await workout.create({name,description,exercises,user:user_id});
    res.status(201).json(newWorkout);
})
export {createWorkout,deleteWorkout,updateWorkout,getAWorkout,getAllWorkouts}
