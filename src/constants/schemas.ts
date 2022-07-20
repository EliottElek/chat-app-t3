import z from "zod";

export const sendMessageSchema = z.object({
    roomId: z.string(),
    message: z.string(),
});
const userSchema = z.object({
    id: z.string(),
    name: z.string(),
})
const accountSchema: any = z.object({
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


const messageSchema = z.object({
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
