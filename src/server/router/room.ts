import { createRouter } from "./context";
import { randomUUID } from "crypto";
import {
  Message,
  messageSubSchema,
  sendMessageSchema,
  getMessagesSchema,
  createRoomShema,
  changeImageRoomSchema,
  changeNameRoomSchema,
  addMemberRoomSchema
} from "../../constants/schemas";
import { Events } from "../../constants/events";
import * as trpc from "@trpc/server";
import { prisma } from "../../server/db/client";

export const roomRouter = createRouter()
  .mutation("send-message", {
    input: sendMessageSchema,
    async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) return;
      const room = await prisma.room.findFirst({ where: { id: input.roomId } })
      const message: Message = {
        id: randomUUID(),
        message: input.message,
        roomId: room?.id,
        sentAt: new Date(),
        senderId: ctx.session?.user?.id,
      }
      let newMessage = await prisma.message.create({ data: message, include: { sender: true, messageToAnswer: true, replies: true } });
      const prismaRoom = await prisma.room.update({ include: { readMembers: true }, where: { id: input.roomId }, data: { lastModified: new Date() } })
      const user = await prisma.user.findFirst({ where: { id: ctx.session?.user.id } })
      if (user && prismaRoom) {
        const members = prismaRoom.readMembers.map((m) => ({ id: m.id }))
        await prisma.room.update({ include: { readMembers: true }, where: { id: prismaRoom.id }, data: { readMembers: { disconnect: members, connect: { id: user.id } } } })
      }
      if (input.messageToReplyId !== "")
        newMessage = await prisma.message.update({ where: { id: newMessage.id }, data: { messageToAnswerId: input.messageToReplyId }, include: { sender: true, messageToAnswer: true, replies: true } })
      ctx.ee.emit(Events.SEND_MESSAGE, newMessage);
      return newMessage
    },
  })
  .mutation("create-new-room", {
    input: createRoomShema, async resolve({ ctx, input }) {
      if (ctx.session && ctx.session.user) {
        const user = await prisma.user.findFirst({ where: { id: ctx.session.user.id } })
        const room = await prisma.room.create({ data: { name: input.roomName, createdAt: new Date(), creatorId: ctx.session.user.id, private: true } })
        if (user && room) {
          const members = [{ id: ctx.session.user.id }]
          await prisma.room.update({ include: { members: true }, where: { id: room.id }, data: { members: { connect: members } } })
        }
        return room;
      }
    }
  })
  .query("get-room", {
    input: getMessagesSchema, resolve({ ctx, input }) {
      return prisma.room.findFirst({
        where: { id: input.roomId }, include: {
          readMembers: true,
          members: true
        }
      });
    }
  })
  .query("get-messages", {
    input: getMessagesSchema, resolve({ ctx, input }) {
      return prisma.room.findFirst({ where: { id: input.roomId } }).messages({ include: { sender: true, replies: true, messageToAnswer: true } });
    }
  })
  .query("get-rooms", {
    async resolve({ ctx }) {
      if (ctx.session && ctx.session.user) {
        // return await prisma.user.findFirst({ where: { name: ctx.session.user.id } }).rooms();
        const room = await prisma.room.findMany({
          orderBy: {
            lastModified: 'desc'
          },
          include: {
            members: true,
            readMembers: true,
            messages: {
              orderBy: {
                sentAt: 'desc',
              },
              include: {
                sender: true
              },
              take: 1,

            }
          },
          where: {
            members: {
              some: {
                id: ctx.session.user.id
              }
            }
          },
        })
        return room
      }
    }
  })
  .mutation("read-room", {
    input: getMessagesSchema, async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) return;
      const room = await prisma.room.findFirst({ where: { id: input.roomId }, include: { readMembers: true } })
      const user = await prisma.user.findFirst({ where: { id: ctx.session?.user.id } })
      if (room && user) {
        room.readMembers.push(user)
        const members = room.readMembers.map((m) => ({ id: m.id }))
        await prisma.room.update({ include: { readMembers: true }, where: { id: input.roomId }, data: { readMembers: { connect: members } } })
      }
    }
  })
  .mutation("change-image-room", {
    input: changeImageRoomSchema, async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) return;
      await prisma.room.update({ where: { id: input.roomId }, data: { image: input.image } })
    }
  })
  .mutation("add-member-room", {
    input: addMemberRoomSchema, async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) return;
      const room = await prisma.room.findFirst({ where: { id: input.roomId }, include: { members: true } })
      const user = await prisma.user.findFirst({ where: { id: input.memberId } })
      if (room && user) {
        room.members.push(user)
        const members = room.members.map((m) => ({ id: m.id }))
        await prisma.room.update({ include: { members: true }, where: { id: input.roomId }, data: { members: { connect: members } } })
      }
    }
  })
  .mutation("change-name-room", {
    input: changeNameRoomSchema, async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) return;
      await prisma.room.update({ where: { id: input.roomId }, data: { name: input.name } })
    }
  })
  .subscription("onSendMessage", {
    input: messageSubSchema,
    async resolve({ ctx, input }) {

      return new trpc.Subscription<Message>((emit) => {
        async function onMessage(data: Message) {
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
