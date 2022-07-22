import { createRouter } from "./context";
import { randomUUID } from "crypto";
import {
  Message,
  messageSubSchema,
  sendMessageSchema,
  getMessagesSchema,
  createRoomShema,
} from "../../constants/schemas";
import { Events } from "../../constants/events";
import * as trpc from "@trpc/server";
import { prisma } from "../../server/db/client";

export const roomRouter = createRouter()
  .mutation("send-message", {
    input: sendMessageSchema,
    async resolve({ ctx, input }) {
      const room = await prisma.room.findFirst({ where: { id: input.roomId } })
      const message: Message = {
        id: randomUUID(),
        message: input.message,
        roomId: room?.id,
        sentAt: new Date(),
        senderId: ctx.session?.user?.id,
      }
      await prisma.message.create({ data: message });
      ctx.ee.emit(Events.SEND_MESSAGE, message);
      return {
        ...message, sender: {
          name: ctx.session?.user?.name || "Paul",
          id: ctx.session?.user?.id || "Dfkdflsd",
        }
      };
    },
  })
  .mutation("create-new-room", {
    input: createRoomShema, async resolve({ ctx, input }) {
      if (ctx.session && ctx.session.user) {
        const room = await prisma.room.create({ data: { name: input.roomName, createdAt: new Date(), creatorId: null, private: true } })
        return room;
      }
    }
  })
  .query("get-room", {
    input: getMessagesSchema, resolve({ ctx, input }) {
      return prisma.room.findFirst({ where: { id: input.roomId } });
    }
  })
  .query("get-messages", {
    input: getMessagesSchema, resolve({ ctx, input }) {
      return prisma.room.findFirst({ where: { id: input.roomId } }).messages();
    }
  })
  .query("get-rooms", {
    async resolve({ ctx }) {
      if (ctx.session && ctx.session.user) {
        // return await prisma.user.findFirst({ where: { name: ctx.session.user.id } }).rooms();
        return await prisma.room.findMany()
      }
    }
  })
  .subscription("onSendMessage", {
    input: messageSubSchema,
    resolve({ ctx, input }) {
      return new trpc.Subscription<Message>((emit) => {
        function onMessage(data: Message) {
          if (input.roomId === data.roomId) {
            emit.data(data);
          }
        }

        ctx.ee.on(Events.SEND_MESSAGE, onMessage);

        return () => {
          ctx.ee.off(Events.SEND_MESSAGE, onMessage);
        };
      });
    },
  });
