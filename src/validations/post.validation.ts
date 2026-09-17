import { z } from "zod";

export const createPostSchema = z.object({
  userId: z.coerce
    .number()
    .int()
    .positive({
      message: "User ID must be a positive integer",
    }),

  categoryId: z.coerce
    .number()
    .int()
    .positive({
      message: "Category ID must be a positive integer",
    })
    .optional(),

  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters long",
    })
    .max(255, {
      message: "Title must be at most 255 characters long",
    }),

  content: z
    .string()
    .min(10, {
      message: "Content must be at least 10 characters long",
    }),
});