import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    height:{
        type: Number,
        required: true
    },
    weight:{
        type: Number,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    schedule:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Workout"
    }]



})
const User = mongoose.model("User",userSchema);
export default User;