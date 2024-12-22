import { add } from "date-fns";
import { db } from "../../../database/db";
import { DeepPartial } from "../../../utils/deepPartial";
import { createDoctor } from "../../doctor/__fixtures__/createDoctor";
import { ISlot, SLOT_REPEAT_TYPE_ENUM, slotTable } from "../slotTable";

export const createSlot = async (args?: DeepPartial<ISlot>): Promise<ISlot> => {
    const doctor = await createDoctor();

    const [slot] = await db
        .insert(slotTable)
        .values({
            doctorId: doctor.id,
            duration: 30,
            startTime: new Date(),
            endTime: add(new Date(), { minutes: 30 }),
            repeatType: SLOT_REPEAT_TYPE_ENUM.SINGLE,
            ...args,
        })
        .returning();

    return slot as ISlot;
};
