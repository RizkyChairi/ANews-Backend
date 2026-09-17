import { z } from "zod";

export const updatePostSchema = z.object({
    title: z.string()
        .min(3, "Title minimal 3 karakter")
        .max(255, "Title maksimal 255 karakter")
        .optional(),
    content: z.string()
        .min(10, "Content minimal 10 karakter")
        .optional(),
    categoryId: z.coerce
        .number()
        .int()
        .positive("Category ID must be a positive integer")
        .optional()
        .nullable(),
    status: z.enum(['publish', 'published']).optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;