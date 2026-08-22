import asyncHandler from "express-async-handler";
import user from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authenticate = asyncHandler(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        res.status(401);
        throw new Error("Need to authenticate!");
    }
    const {_id} = jwt.verify(token, process.env.SECRET_SAUCE);
    req.user = await user.findOne({_id}).select("_id");
    next();
});
