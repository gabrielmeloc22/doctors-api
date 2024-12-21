import { Router } from "express";
import { doctorAvailableSlotsGet } from "./packages/doctor/doctorAvailableSlotsGet";
import { doctorBookingGet } from "./packages/doctor/doctorBookingGet";
import { doctorPost } from "./packages/doctor/doctorPost";
import { doctorSlotPost } from "./packages/doctor/doctorSlotPost";
import { slotBookPost } from "./packages/slot/slotBookPost";

export const router: Router = Router();

router.use((req, res, next) => {
    // TODO: add a logger
    next();
});

// doctor routes
router.post("/doctors", doctorPost);
router.post("/doctors/:id/slots", doctorSlotPost);
router.get("/doctors/:id/bookings", doctorBookingGet);
router.get("/doctors/:id/available_slots", doctorAvailableSlotsGet);

// books
router.post("/slots/:id/book", slotBookPost);
