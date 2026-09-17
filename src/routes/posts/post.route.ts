// // import {Router} from "express" ; 
// // import { uploadSingleImage } from "../../middleware/upload.middleware";
// // import postsController from "../../controllers/posts/posts.controller";


// // const router = Router();
// // router.post('/', uploadSingleImage, postsController.createPost);

// // // GET all posts (Guest)
// // router.get('/', postsController.getAllPosts);

// // // GET post by ID (Guest)
// // router.get('/:id', postsController.getPostById);

// // // GET user posts (Guest)
// // router.get('/users/:userId/posts', postsController.getUserPosts);

// // // GET user post by ID (Guest)
// // router.get('/users/:userId/posts/:postId', postsController.getUserPostById);


// // export default router ; 
// import { Router } from "express";
// import { uploadSingleImage } from "../../middleware/upload.middleware";
// import postsController from "../../controllers/posts/posts.controller";

// const router = Router();

// // ============ PUBLIC ROUTES (GUEST - TANPA LOGIN) ============
// // GET all posts (Guest)
// router.get('/', postsController.getAllPosts);

// // GET post by ID (Guest)
// router.get('/:id', postsController.getPostById);

// // ============ PROTECTED ROUTES (HARUS LOGIN) ============
// // POST create post (Harus login - cek token di controller)
// router.post('/', uploadSingleImage, postsController.createPost);

// // GET user posts (Harus login - cek token di controller)
// router.get('/users/:userId/posts', postsController.getUserPosts);

// // GET user post by ID (Harus login - cek token di controller)
// router.get('/users/:userId/posts/:postId', postsController.getUserPostById);

// export default router;

// routes/posts/posts.routes.ts
// import { Router } from "express";
// import { uploadSingleImage } from "../../middleware/upload.middleware";
// import postsController from "../../controllers/posts/posts.controller";
// import { authenticate } from "../../middleware/auth.middleware"; // <-- IMPORT INI

// const router = Router();

// // ============ PUBLIC ROUTES (TANPA LOGIN) ============
// router.get('/', postsController.getAllPosts);
// router.get('/:id', postsController.getPostById);

// // ============ PROTECTED ROUTES (HARUS LOGIN) ============
// router.post('/', authenticate, uploadSingleImage, postsController.createPost);
// router.get('/users/:userId/posts', authenticate, postsController.getUserPosts);
// router.get('/users/:userId/posts/:postId', authenticate, postsController.getUserPostById);
// router.put('/:id', authenticate, uploadSingleImage, postsController.updatePost);
// router.delete('/:id', authenticate, postsController.deletePost);

// export default router;
import { Router, Request, Response, NextFunction } from "express";
import { uploadSingleImage } from "../../middleware/upload.middleware";
import postsController from "../../controllers/posts/posts.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);
router.get('/category/:categoryId', postsController.getPostsByCategory);

// login dlu euy
router.post(
    '/',
    authenticate,
    (req: Request, res: Response, next: NextFunction) => {
        uploadSingleImage(req, res, (err: any) => {
            if (err) {
                console.log(' Upload error:', err.message);
                return res.status(400).json({
                    success: false,
                    message: err.message || "Error uploading file"
                });
            }
            console.log('Upload middleware success');
            console.log('File:', req.file ? {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : 'No file');
            console.log('Body:', req.body);
            next();
        });
    },
    postsController.createPost
);

router.get('/users/:userId/posts', authenticate, postsController.getUserPosts);
router.get('/users/:userId/posts/:postId', authenticate, postsController.getUserPostById);
router.put(
    '/:id',
    authenticate,
    (req: Request, res: Response, next: NextFunction) => {
        uploadSingleImage(req, res, (err: any) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || "Error uploading file"
                });
            }
            next();
        });
    },
    postsController.updatePost
);
router.delete('/:id', authenticate, postsController.deletePost);

export default router;