import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["cardio", "strength", "flexibility", "mobility"],
        required: true
        },
    muscleGroup: [{
        type: String,
        enum: ["upper chest","lower chest","spinal erectors","tricep long","tricep short","tricep mid","bicep long","bicep short","lateral head",'front delt','rear delt'
            ,'upper back','lats','traps',"quads",'hamstrings','glutes','calves','lower abs','upper abs','obliques','forearms'],
        required: true
    }]
},{timestamps: true});
const Exercise = mongoose.model("Exercise",exerciseSchema);
export default Exercise;