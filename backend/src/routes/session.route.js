import express from "express";
import {
    createSession,
    getUpcomingSessions,
    getSessionHistory,
    getSession,
    startSession,
    completeSession,
    cancelSession,
    deleteSession
} from "../controllers/session.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createSession);
router.get("/upcoming", getUpcomingSessions);
router.get("/history", getSessionHistory);
router.get("/:id", getSession);
router.patch("/:id/start", startSession);
router.patch("/:id/complete", completeSession);
router.patch("/:id/cancel", cancelSession);
router.delete("/:id", deleteSession);

export default router;
