import mongoose from "mongoose";
import user from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createToken = (_id)=>{
    return jwt.sign({_id},process.env.SECRET_SAUCE,{expiresIn: '3d'})
}
const signIn = asyncHandler(async(req,res)=>{
    const {email,password,name,height,weight,age} = req.body;
    if(!email || !password || !name ||!height || !weight || !age){
        res.status(400);
        throw new Error("Can't leave any field emtpy");
    }
    if(!validator.isEmail(email)){
        res.status(400)
        throw new Error("You need a correct email");
    }
    if(!validator.isStrongPassword(password)){
        res.status(400)
        throw new Error("You need a STRONG password");
    }
    const exist = await user.findOne({email});
    if(exist){
        res.status(400);
        throw new Error("Already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt);
    const addedUser = await user.create({email,password: hash, name ,height,weight,age});
    const token = createToken(addedUser._id);
    res.cookie("token",token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 3 * 24 * 60 * 60 * 1000
        })
    res.status(200).json({email});
});
const logIn = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("Missing fields");
    }
    const exists = await user.findOne({email});
    if(!exists){
        res.status(400)
        throw new Error("Email doesn't exists");
    }
    const correctPwd = await bcrypt.compare(password, exists.password)
    if(!correctPwd){
        res.status(400);
        throw new Error("Wrong password");
    }
    const token = createToken(exists._id);
    res.cookie("token",token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3 * 24 * 60 * 60 * 1000
    })
    res.status(200).json({email})

});
const logoutUser = asyncHandler((req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  res.status(200).json({ message: "Logged out" });
});
export {signIn,logIn,logoutUser};