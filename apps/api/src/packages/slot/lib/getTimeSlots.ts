import { differenceInMinutes } from "date-fns";
import { ISlot } from "../slotTable";

export const getTimeSlots = (slot: ISlot): number[] => {
    const timeSlotCount =
        differenceInMinutes(slot.endTime, slot.startTime) / slot.duration;

    const timeSlots = Array.from({
        length: timeSlotCount,
    }).map((_, i) => i);

    return timeSlots;
};
