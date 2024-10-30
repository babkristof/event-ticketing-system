import {getPrismaClient} from "../../../src/database/prismaClient";
import {stopContainer} from "./container.singleton";

export default async () => {
    await getPrismaClient().$disconnect();
    await stopContainer();
};
