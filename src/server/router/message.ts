import { createRouter } from "./context";
import {
    addReactionMessageSchema, Reaction, reactSubSchema
} from "../../constants/schemas";
import { prisma } from "../../server/db/client";
import * as trpc from "@trpc/server";
import { Events } from "../../constants/events";

export const messageRouter = createRouter()
    .mutation("add-reaction-message", {
        input: addReactionMessageSchema,
        async resolve({ ctx, input }) {
            if (ctx?.session?.user) {
                const user = await prisma.user.findFirst({ where: { id: ctx?.session?.user.id } })
                const message = await prisma.message.findFirst({ where: { id: input.messageId }, include: { reactions: true } })
                if (user && message) {
                    const reaction = await prisma.reaction.create({ data: { userId: user.id, reaction: input.reaction.reaction, label: input.reaction.label, messageId: message.id }, include: { user: true } })
                    const newReacts = [...message.reactions, reaction]
                    const finalReacts = newReacts.map((r) => ({ id: r.id }))
                    await prisma.message.update({ where: { id: input.messageId }, data: { reactions: { connect: finalReacts } } })
                    ctx.ee.emit(Events.REACT_TO_MESSAGE, reaction);
                }
            }
        },
    }).subscription("onMessageReact", {
        input: reactSubSchema,
        async resolve({ ctx, input }) {
            return new trpc.Subscription<Reaction>((emit) => {
                async function onReact(data: Reaction) {
                    if (input.messageId === data.messageId) {
                        emit.data(data);
                    }
                }
                ctx.ee.on(Events.REACT_TO_MESSAGE, onReact);

                return () => {
                    ctx.ee.off(Events.REACT_TO_MESSAGE, onReact);
                };
            });
        },
    });
