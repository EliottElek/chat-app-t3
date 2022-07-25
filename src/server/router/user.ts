import { createRouter } from "./context";
import { randomUUID } from "crypto";
import {
    signInSchema
} from "../../constants/schemas";
import { prisma } from "../../server/db/client";

export const userRouter = createRouter()
    .mutation("sign-in", {
        input: signInSchema,
        async resolve({ ctx, input }) {
            const user = await prisma.user.create({ data: { id: randomUUID(), name: input.name, email: input.email, image: input.image } })
            return user;
        },
    })
    .query("get-all-users", {
        async resolve({ ctx, input }) {
            return await prisma.user.findMany({
                where: {
                    NOT: {
                        id: ctx?.session?.user?.id || ""
                    }
                },
            })
        },
    })