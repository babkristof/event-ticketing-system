import {getPrismaClient} from "../../../src/database/prismaClient";
import {stopContainers} from "./container.singleton";

export default async () => {
    await getPrismaClient().$disconnect();
    await stopContainers();
};
