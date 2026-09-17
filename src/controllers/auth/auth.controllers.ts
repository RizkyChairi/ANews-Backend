import { Request, Response} from 'express';
import { loginSchema, registerSchema } from '../../validations/auth.validation';
import { usersTable } from '../../config/schema';
import { db } from '../../config/db';
import { eq } from 'drizzle-orm';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

export class Authcontroller { 
        register = async (req: Request, res: Response) => {
             // get request user
            const validatedData = registerSchema.parse(req.body);
            const { username, email, password } = validatedData;
           //check email yg sama
           const existingEmail = await db.query.usersTable.findFirst({
                where: eq(usersTable.email, email), 
           });
            
           if (existingEmail) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Email already exists' });
           }
           // 3. hash password
           const hashedPassword = await bcrypt.hash(password, 10);

           //4. input database 
           const [insertedUser] = await db
           .insert(usersTable)
           .values({
            username: username,
            email: email,
            password: hashedPassword,
              })
              .$returningId();


        };

          login = async (req: Request, res: Response) => {
        try {
            // 1. VALIDATION
            const validatedData = loginSchema.parse(req.body);
            const { email, password } = validatedData;


            // 2. FIND USER BY EMAIL
            const user = await db.query.usersTable.findFirst({
                where: eq(usersTable.email, email),
            });


            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Email or password incorrect",
                });
            }


            // 3. CHECK PASSWORD
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );


            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Email or password incorrect",
                });
            }




            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: "7d",
                }
            );


            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    },
                },
            });


        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }





}
  export default new Authcontroller();