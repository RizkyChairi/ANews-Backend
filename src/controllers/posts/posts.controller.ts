import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createPostSchema } from "../../validations/post.validation";
import { updatePostSchema } from "../../validations/update-post.validation";
import { db } from "../../config/db";
import { postsTable, usersTable, categoriesTable } from "../../config/schema";
import { eq, and, desc } from "drizzle-orm";
import { uploadToCloudinary, deleteFromCloudinary } from "../../services/cloudinary.service";
import { z } from "zod";

export class PostController {
    // create POST
   createPost = async (req: Request, res: Response) => {
    try {
        const validateData = createPostSchema.parse(req.body);
        const { userId, title, content, categoryId } = validateData;

        let imageUrl: string | undefined;

        if (req.file) {
            try {
                
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                imageUrl = uploadResult.secure_url;
                console.log(' Image uploaded to Cloudinary:', imageUrl);
            } catch (uploadError) {
                console.error(' Cloudinary upload error:', uploadError);
                // kalo error udh lah 
                return res.status(400).json({
                    success: false,
                    message: "Gagal upload gambar ke Cloudinary",
                    error: uploadError instanceof Error ? uploadError.message : uploadError
                });
            }
        }

        if (categoryId) {
            const categoryExists = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.id, categoryId))
                .then(rows => rows[0]);

            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: "Category not found",
                });
            }
        }

        const [insertedPost] = await db.insert(postsTable)
            .values({ 
                userId, 
                title, 
                content, 
                categoryId, 
                imageUrl 
            })
            .$returningId();

        const newPost = await db
            .select({
                id: postsTable.id,
                userId: postsTable.userId,
                categoryId: postsTable.categoryId,
                title: postsTable.title,
                content: postsTable.content,
                status: postsTable.status,
                imageUrl: postsTable.imageUrl,
                createdAt: postsTable.createdAt,
                updatedAt: postsTable.updatedAt,
                user: {
                    id: usersTable.id,
                    username: usersTable.username,
                    email: usersTable.email,
                },
                category: {
                    id: categoriesTable.id,
                    name: categoriesTable.name,
                    slug: categoriesTable.slug,
                }
            })
            .from(postsTable)
            .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
            .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
            .where(eq(postsTable.id, insertedPost.id))
            .then(rows => rows[0]);

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: { post: newPost },
        });

    } catch (error) {
        console.error("Create post error:", error);
        
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

        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: error instanceof Error ? error.message : error,
        });
    }
}
    getAllPosts = async (req: Request, res: Response) => {
        try {
            const posts = await db
                .select({
                    id: postsTable.id,
                    userId: postsTable.userId,
                    categoryId: postsTable.categoryId,
                    title: postsTable.title,
                    content: postsTable.content,
                    status: postsTable.status,
                    imageUrl: postsTable.imageUrl,
                    imagePublicId: postsTable.imagePublicId,
                    createdAt: postsTable.createdAt,
                    updatedAt: postsTable.updatedAt,
                    user: {
                        id: usersTable.id,
                        username: usersTable.username,
                        email: usersTable.email,
                    },
                    category: {
                        id: categoriesTable.id,
                        name: categoriesTable.name,
                        slug: categoriesTable.slug,
                    }
                })
                .from(postsTable)
                .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
                .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
                .where(eq(postsTable.status, 'published'))
                .orderBy(desc(postsTable.createdAt));

            return res.status(200).json({
                success: true,
                message: "Posts retrieved successfully",
                data: {
                    posts,
                    total: posts.length,
                },
            });

        } catch (error) {
            console.error("Get all posts error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    getPostById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string' || isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid post ID",
                });
            }

            const postId = parseInt(id as string, 10);

            const post = await db
                .select({
                    id: postsTable.id,
                    userId: postsTable.userId,
                    categoryId: postsTable.categoryId,
                    title: postsTable.title,
                    content: postsTable.content,
                    status: postsTable.status,
                    imageUrl: postsTable.imageUrl,
                    imagePublicId: postsTable.imagePublicId,
                    createdAt: postsTable.createdAt,
                    updatedAt: postsTable.updatedAt,
                    user: {
                        id: usersTable.id,
                        username: usersTable.username,
                        email: usersTable.email,
                    },
                    category: {
                        id: categoriesTable.id,
                        name: categoriesTable.name,
                        slug: categoriesTable.slug,
                    }
                })
                .from(postsTable)
                .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
                .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
                .where(and(
                    eq(postsTable.id, postId),
                    eq(postsTable.status, 'published')
                ))
                .then(rows => rows[0]);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: "Post not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Post retrieved successfully",
                data: { post },
            });

        } catch (error) {
            console.error("Get post by ID error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    getUserPosts = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;

            if (!userId || typeof userId !== 'string' || isNaN(Number(userId))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID",
                });
            }

            const parsedUserId = parseInt(userId as string, 10);

            const user = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.id, parsedUserId))
                .then(rows => rows[0]);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            const posts = await db
                .select({
                    id: postsTable.id,
                    userId: postsTable.userId,
                    categoryId: postsTable.categoryId,
                    title: postsTable.title,
                    content: postsTable.content,
                    status: postsTable.status,
                    imageUrl: postsTable.imageUrl,
                    imagePublicId: postsTable.imagePublicId,
                    createdAt: postsTable.createdAt,
                    updatedAt: postsTable.updatedAt,
                    user: {
                        id: usersTable.id,
                        username: usersTable.username,
                        email: usersTable.email,
                    },
                    category: {
                        id: categoriesTable.id,
                        name: categoriesTable.name,
                        slug: categoriesTable.slug,
                    }
                })
                .from(postsTable)
                .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
                .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
                .where(and(
                    eq(postsTable.userId, parsedUserId),
                    eq(postsTable.status, 'published')
                ))
                .orderBy(desc(postsTable.createdAt));

            return res.status(200).json({
                success: true,
                message: "User posts retrieved successfully",
                data: {
                    posts,
                    total: posts.length,
                    userId: parsedUserId,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                    }
                },
            });

        } catch (error) {
            console.error("Get user posts error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }   
    }
    
     getPostsByCategory = async (req: Request, res: Response) => {
        try {
            const { categoryId } = req.params;

            // Validasi categoryId
            if (!categoryId || typeof categoryId !== 'string' || isNaN(Number(categoryId))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }

            const parsedCategoryId = parseInt(categoryId, 10);

            // Cek apakah category ada
            const category = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.id, parsedCategoryId))
                .then(rows => rows[0]);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            // Ambil semua post di category tersebut
            const posts = await db
                .select({
                    id: postsTable.id,
                    userId: postsTable.userId,
                    categoryId: postsTable.categoryId,
                    title: postsTable.title,
                    content: postsTable.content,
                    status: postsTable.status,
                    imageUrl: postsTable.imageUrl,
                    imagePublicId: postsTable.imagePublicId,
                    createdAt: postsTable.createdAt,
                    updatedAt: postsTable.updatedAt,
                    user: {
                        id: usersTable.id,
                        username: usersTable.username,
                        email: usersTable.email,
                    },
                    category: {
                        id: categoriesTable.id,
                        name: categoriesTable.name,
                        slug: categoriesTable.slug,
                        description: categoriesTable.description,
                    }
                })
                .from(postsTable)
                .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
                .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
                .where(and(
                    eq(postsTable.categoryId, parsedCategoryId),
                    eq(postsTable.status, 'published') // Hanya yang published
                ))
                .orderBy(desc(postsTable.createdAt));

            return res.status(200).json({
                success: true,
                message: "Posts by category retrieved successfully",
                data: {
                    category: {
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        description: category.description,
                    },
                    posts,
                    total: posts.length,
                },
            });

        } catch (error) {
            console.error("Get posts by category error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    // GET user post by id
    getUserPostById = async (req: Request, res: Response) => {
        try {
            const { userId, postId } = req.params;

            if (!userId || typeof userId !== 'string' || isNaN(Number(userId)) ||
                !postId || typeof postId !== 'string' || isNaN(Number(postId))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID or post ID",
                });
            }

            const parsedUserId = parseInt(userId as string, 10);
            const parsedPostId = parseInt(postId as string, 10);

            const user = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.id, parsedUserId))
                .then(rows => rows[0]);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            const post = await db
                .select({
                    id: postsTable.id,
                    userId: postsTable.userId,
                    categoryId: postsTable.categoryId,
                    title: postsTable.title,
                    content: postsTable.content,
                    status: postsTable.status,
                    imageUrl: postsTable.imageUrl,
                    imagePublicId: postsTable.imagePublicId,
                    createdAt: postsTable.createdAt,
                    updatedAt: postsTable.updatedAt,
                    user: {
                        id: usersTable.id,
                        username: usersTable.username,
                        email: usersTable.email,
                    },
                    category: {
                        id: categoriesTable.id,
                        name: categoriesTable.name,
                        slug: categoriesTable.slug,
                    }
                })
                .from(postsTable)
                .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
                .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
                .where(and(
                    eq(postsTable.id, parsedPostId),
                    eq(postsTable.userId, parsedUserId),
                    eq(postsTable.status, 'published')
                ))
                .then(rows => rows[0]);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: "Post not found or does not belong to this user",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Post retrieved successfully",
                data: { post },
            });

        } catch (error) {
            console.error("Get user post by ID error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }

    // UPDATE POST
    updatePost = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        console.log(' UPDATE POST - ID:', id);
        console.log(' UPDATE POST - User ID:', userId);
        console.log(' UPDATE POST - Body:', req.body);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Please login first",
            });
        }

        if (!id || typeof id !== 'string' || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID format",
            });
        }

        const postId = parseInt(id, 10);
        const parsedUserId = parseInt(userId.toString(), 10);

        // Cek apakah post ada dan milik user
        const existingPost = await db
            .select()
            .from(postsTable)
            .where(and(
                eq(postsTable.id, postId),
                eq(postsTable.userId, parsedUserId)
            ))
            .then(rows => rows[0]);

        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found or you are not the owner",
            });
        }

        // Validasi data
        const validatedData = updatePostSchema.parse(req.body);
        
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (validatedData.title !== undefined) {
            updateData.title = validatedData.title;
        }
        if (validatedData.content !== undefined) {
            updateData.content = validatedData.content;
        }
        if (validatedData.categoryId !== undefined) {
            // Cek category exists
            if (validatedData.categoryId !== null) {
                const categoryExists = await db
                    .select()
                    .from(categoriesTable)
                    .where(eq(categoriesTable.id, validatedData.categoryId))
                    .then(rows => rows[0]);

                if (!categoryExists) {
                    return res.status(400).json({
                        success: false,
                        message: "Category not found",
                    });
                }
            }
            updateData.categoryId = validatedData.categoryId;
        }
        if (validatedData.status !== undefined) {
            updateData.status = validatedData.status;
        }

        // Handle upload gambar baru
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            updateData.imageUrl = uploadResult.secure_url;
            updateData.imagePublicId = uploadResult.public_id;

            if (existingPost.imagePublicId) {
                await deleteFromCloudinary(existingPost.imagePublicId);
            }
        }

        // Update database
        await db
            .update(postsTable)
            .set(updateData)
            .where(eq(postsTable.id, postId));

        // Ambil data terbaru
        const updatedPost = await db
            .select({
                id: postsTable.id,
                userId: postsTable.userId,
                categoryId: postsTable.categoryId,
                title: postsTable.title,
                content: postsTable.content,
                status: postsTable.status,
                imageUrl: postsTable.imageUrl,
                imagePublicId: postsTable.imagePublicId,
                createdAt: postsTable.createdAt,
                updatedAt: postsTable.updatedAt,
                user: {
                    id: usersTable.id,
                    username: usersTable.username,
                    email: usersTable.email,
                },
                category: {
                    id: categoriesTable.id,
                    name: categoriesTable.name,
                    slug: categoriesTable.slug,
                }
            })
            .from(postsTable)
            .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
            .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
            .where(eq(postsTable.id, postId))
            .then(rows => rows[0]);

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: { post: updatedPost },
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

        console.error("Update post error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: error instanceof Error ? error.message : error,
        });
    }
}
    // DELETE POST
    deletePost = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: Please login first",
                });
            }

            if (!id || typeof id !== 'string' || isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid post ID format",
                });
            }

            const postId = parseInt(id, 10);
            const parsedUserId = parseInt(userId.toString(), 10);

            const existingPost = await db
                .select()
                .from(postsTable)
                .where(and(
                    eq(postsTable.id, postId),
                    eq(postsTable.userId, parsedUserId)
                ))
                .then(rows => rows[0]);

            if (!existingPost) {
                return res.status(404).json({
                    success: false,
                    message: "Post not found or you are not the owner",
                });
            }

            if (existingPost.imagePublicId) {
                await deleteFromCloudinary(existingPost.imagePublicId);
            }

            await db
                .delete(postsTable)
                .where(eq(postsTable.id, postId));

            return res.status(200).json({
                success: true,
                message: "Post deleted successfully",
                data: {
                    deletedPostId: postId,
                    deletedBy: parsedUserId,
                },
            });

        } catch (error) {
            console.error("Delete post error:", error);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: error instanceof Error ? error.message : error,
            });
        }
    }
}

export default new PostController();