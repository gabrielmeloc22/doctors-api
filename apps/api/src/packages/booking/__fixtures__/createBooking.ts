import { db } from "../../../database/db";
import { DeepPartial } from "../../../utils/deepPartial";
import { createSlot } from "../../slot/__fixtures__/createSlot";
import { bookingTable, IBooking } from "../bookingTable";

export const createBooking = async (
    args?: DeepPartial<IBooking>
): Promise<IBooking> => {
    const slotId = args?.slotId ? args.slotId : (await createSlot()).id;

    const [booking] = await db
        .insert(bookingTable)
        .values({
            slotId: slotId,
            time: new Date(),
            patientId: "1",
            reason: "checkup",
            ...args,
        })
        .returning();

    return booking as IBooking;
};
