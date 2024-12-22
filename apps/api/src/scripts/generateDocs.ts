import {
    OpenApiGeneratorV3,
    OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";

import fs from "node:fs";
import { doctorAvailableSlotsGetDocs } from "../packages/doctor/doctorAvailableSlotsGet";
import { doctorBookingGetDocs } from "../packages/doctor/doctorBookingGet";
import { doctorPostDocs } from "../packages/doctor/doctorPost";
import { doctorSlotPostsDocs } from "../packages/doctor/doctorSlotPost";
import { slotBookPostDocs } from "../packages/slot/slotBookPost";

const registry = new OpenAPIRegistry();

registry.registerPath(doctorBookingGetDocs);
registry.registerPath(doctorAvailableSlotsGetDocs);
registry.registerPath(doctorPostDocs);
registry.registerPath(doctorSlotPostsDocs);
registry.registerPath(slotBookPostDocs);

const generator = new OpenApiGeneratorV3(registry.definitions);

const doc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "Doctors Calendar API",
    },
});

const fileContent = JSON.stringify(doc, null, 2);

fs.writeFileSync("./src/openapi-docs.json", fileContent, {
    encoding: "utf-8",
});
