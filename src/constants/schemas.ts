import z from "zod";

export const sendMessageSchema = z.object({
    roomId: z.string(),
    message: z.string(),
    messageToReplyId: z.string()
});

export let accountSchema: any = {};
export let sessionSchema: any = {};
export let messageSchema: any = {};
export let reactionSchema: any = {};
export let roomSchema: any = {};
export let userSchema: any = {};
userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    image: z.string(),
    accounts: z.array(accountSchema),
    sessions: z.array(sessionSchema),
    messages: z.array(messageSchema)
})

accountSchema = z.object({
    id: z.string(),
    userId: z.string(),
    type: z.string(),
    provider: z.string(),
    providerAccountId: z.string(),
    refreshToken: z.string(),
    accessToken: z.string(),
    expiresAt: z.number(),
    tokenType: z.string(),
    sope: z.string(),
    idToken: z.string(),
    sessionState: z.string(),
    user: userSchema
})

messageSchema = z.object({
    id: z.string(),
    message: z.string(),
    roomId: z.string(),
    sentAt: z.date(),
    sender: userSchema
});
roomSchema = z.object({
    id: z.string(),
    name: z.string(),
    messages: z.array(messageSchema),
    members: z.array(userSchema),
    readMembers: z.array(userSchema),
    createdAt: z.date(),
    lastModified: z.date(),
    private: z.boolean(),
    creator: userSchema
});
reactionSchema = z.object({
    id: z.string(),
    label: z.string(),
    reaction: z.string(),
    user: userSchema,
    message: messageSchema
});
export type Message = z.TypeOf<typeof messageSchema>;
export type Reaction = z.TypeOf<typeof reactionSchema>;
export type Room = z.TypeOf<typeof roomSchema>;

export const userUpdateSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string(),
})

export const messageSubSchema = z.object({
    roomId: z.string(),
});
export const reactSubSchema = z.object({
    messageId: z.string(),
});
export const getMessagesSchema = z.object({
    roomId: z.string(),
});
export const createRoomShema = z.object({
    roomName: z.string(),
});
export const signInSchema = z.object({
    name: z.string(),
    email: z.string(),
    image: z.string(),
});
export const changeImageRoomSchema = z.object({
    roomId: z.string(),
    image: z.string(),
});
export const changeNameRoomSchema = z.object({
    roomId: z.string(),
    name: z.string(),
});
export const addMemberRoomSchema = z.object({
    roomId: z.string(),
    memberIds: z.array(z.string()),
});
export const addReactionMessageSchema = z.object({
    messageId: z.string(),
    reaction: z.object({ reaction: z.string(), label: z.string() })
});
export const roomSubSchema = z.object({
    userId: z.string(),
});