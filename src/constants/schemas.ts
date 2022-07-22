import z from "zod";

export const sendMessageSchema = z.object({
    roomId: z.string(),
    message: z.string(),
});

export let accountSchema: any = {};
export let sessionSchema: any = {};
export let messageSchema: any = {};
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

export type Message = z.TypeOf<typeof messageSchema>;

export const messageSubSchema = z.object({
    roomId: z.string(),
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
