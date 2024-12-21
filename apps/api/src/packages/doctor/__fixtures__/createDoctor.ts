import { db } from "../../../database/db";
import { DeepPartial } from "../../../utils/deepPartial";
import { doctorTable, IDoctor } from "../doctorTable";

export const createDoctor = async (
    args?: DeepPartial<IDoctor>
): Promise<IDoctor> => {
    const doctorCount = await db.$count(doctorTable);

    const [doctor] = await db
        .insert(doctorTable)
        .values({
            email: `doc${doctorCount}@mail.com`,
            firstName: "john",
            lastName: `doe ${doctorCount}`,
            username: `john#${doctorCount}`,
            ...args,
        })
        .returning();

    return doctor as IDoctor;
};
