import { add, getDate, setDate } from "date-fns";
import { ISlot } from "../slotTable";

export const getTimeSlotDate = (
    slot: ISlot,
    date: Date,
    timeSlot: number
): Date => {
    return add(setDate(slot.startTime, getDate(date)), {
        minutes: timeSlot * slot.duration,
    });
};
