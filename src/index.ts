import express, { type Express, type Request, type Response } from 'express';
import authRoute from './routes/auth/auth.route';
import postRouter from './routes/posts/post.route';
import cors from 'cors';
import categoryRouter from './routes/categories/category.route';

const app: Express = express();
const port = 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

app.use(express.json());
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/categories', categoryRouter);

app.get("/", (req, res) => {
  res.send("Hello World! + typescript");
});

app.listen(port, () => {
    console.log(` Server is running on http://localhost:${port}`);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Also: http://127.0.0.1:${port}`);
});