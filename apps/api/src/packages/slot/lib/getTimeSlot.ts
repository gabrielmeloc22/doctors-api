import { differenceInMinutes, getHours, getMinutes } from "date-fns";
import { ISlot } from "../slotTable";

export const getTimeSlot = (slot: ISlot, selectedStart: Date): number => {
    const timeSlotCount =
        differenceInMinutes(slot.endTime, slot.startTime) / slot.duration;

    const slotEndMinutes =
        getHours(slot.endTime) * 60 + getMinutes(slot.endTime);
    const selectedStartMinutes =
        getHours(selectedStart) * 60 + getMinutes(selectedStart);

    const selectedTimeSlot =
        timeSlotCount -
        Math.abs(slotEndMinutes - selectedStartMinutes) / slot.duration;

    return selectedTimeSlot;
};
