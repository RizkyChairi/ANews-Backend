import { Request, Response } from "express";
import { db } from "../../config/db";
import { categoriesTable } from "../../config/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createCategorySchema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100),
    description: z.string().optional(),
});

const updateCategorySchema = z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().optional().nullable(),
});

export class CategoryController {

    createCategory = async (req: Request, res: Response) => {
        try {
            const validatedData = createCategorySchema.parse(req.body);
            const { name, slug, description } = validatedData;

            
            const existingCategory = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.name, name))
                .then(rows => rows[0]);

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category name already exists",
                });
            }

            const existingSlug = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.slug, slug))
                .then(rows => rows[0]);

            if (existingSlug) {
                return res.status(400).json({
                    success: false,
                    message: "Category slug already exists",
                });
            }

            const [insertedCategory] = await db
                .insert(categoriesTable)
                .values({ name, slug, description })
                .$returningId();

            const newCategory = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.id, insertedCategory.id))
                .then(rows => rows[0]);

            return res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: { category: newCategory },
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }

            console.error("Create category error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    // GET ALL CATEGORIES
    getAllCategories = async (req: Request, res: Response) => {
        try {
            const categories = await db
                .select()
                .from(categoriesTable)
                .orderBy(categoriesTable.name);

            return res.status(200).json({
                success: true,
                message: "Categories retrieved successfully",
                data: {
                    categories,
                    total: categories.length,
                },
            });

        } catch (error) {
            console.error("Get all categories error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
    getCategoryById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string' || isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const categoryId = parseInt(id, 10);

            const category = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.id, categoryId))
                .then(rows => rows[0]);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Category retrieved successfully",
                data: { category },
            });

        } catch (error) {
            console.error("Get category by ID error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    updateCategory = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string' || isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const categoryId = parseInt(id, 10);

            const existingCategory = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.id, categoryId))
                .then(rows => rows[0]);

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            const validatedData = updateCategorySchema.parse(req.body);
            const updateData: any = {
                updatedAt: new Date(),
            };

            if (validatedData.name !== undefined) {
                // Check if name already exists (except this category)
                const nameExists = await db
                    .select()
                    .from(categoriesTable)
                    .where(eq(categoriesTable.name, validatedData.name))
                    .then(rows => rows[0]);

                if (nameExists && nameExists.id !== categoryId) {
                    return res.status(400).json({
                        success: false,
                        message: "Category name already exists",
                    });
                }
                updateData.name = validatedData.name;
            }

            if (validatedData.slug !== undefined) {
                // Check if slug already exists (except this category)
                const slugExists = await db
                    .select()
                    .from(categoriesTable)
                    .where(eq(categoriesTable.slug, validatedData.slug))
                    .then(rows => rows[0]);

                if (slugExists && slugExists.id !== categoryId) {
                    return res.status(400).json({
                        success: false,
                        message: "Category slug already exists",
                    });
                }
                updateData.slug = validatedData.slug;
            }

            if (validatedData.description !== undefined) {
                updateData.description = validatedData.description;
            }

            await db
                .update(categoriesTable)
                .set(updateData)
                .where(eq(categoriesTable.id, categoryId));

            const updatedCategory = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.id, categoryId))
                .then(rows => rows[0]);

            return res.status(200).json({
                success: true,
                message: "Category updated successfully",
                data: { category: updatedCategory },
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: error.issues.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }

            console.error("Update category error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    deleteCategory = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string' || isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const categoryId = parseInt(id, 10);

            const existingCategory = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.id, categoryId))
                .then(rows => rows[0]);

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            await db
                .delete(categoriesTable)
                .where(eq(categoriesTable.id, categoryId));

            return res.status(200).json({
                success: true,
                message: "Category deleted successfully",
                data: {
                    deletedCategoryId: categoryId,
                },
            });

        } catch (error) {
            console.error("Delete category error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
}

export default new CategoryController();