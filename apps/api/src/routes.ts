import { Router } from "express";
import { doctorCreatePost } from "./packages/doctor/doctorCreatePost";
import { routeNotImplemented } from "./utils/routeNotImplemented";

export const router: Router = Router();

router.use((req, res, next) => {
    // TODO: add a logger
    next();
});

// doctor routes
router.post("/doctors", doctorCreatePost);
router.post("/doctors/[id]/slots", routeNotImplemented);
router.get("/doctors/[id]/bookings", routeNotImplemented);
router.get("/doctors/[id]/available_slots", routeNotImplemented);

// books
router.post("/slots/[id]/book", routeNotImplemented);
