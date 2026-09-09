import express from "express";
import {signUp,logIn,logoutUser} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post('/signUp',signUp);
router.post('/logIn',logIn);
router.post('/logOut',authenticate,logoutUser);

export default router;
