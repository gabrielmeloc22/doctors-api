import { addDays, differenceInDays, startOfDay } from "date-fns";

export const getDatesInterval = (start: Date, end: Date): Date[] => {
    const days = differenceInDays(end, start) || 1;

    return Array.from({ length: days + 1 }).map((_, i) =>
        addDays(startOfDay(start), i)
    );
};
