import { z } from "zod";

export const deletePostSchema = z.object({
    id: z.string()
        .regex(/^\d+$/, "ID harus berupa angka")
        .transform(Number),
});

export type DeletePostInput = z.infer<typeof deletePostSchema>;