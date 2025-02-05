import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './Routes/authRoutes.js'
import userRouter from './Routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

connectDB(); 

// CORS setup - Allow only specific origins for credentials
const allowedOrigins = ['http://localhost:5173']; // Allowed origin(s)

app.use(cors({
  origin: allowedOrigins,       // Allow only specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed HTTP methods
  credentials: true,            // Allow credentials (cookies, HTTP authentication, etc.)
}));

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// API Endpoints
app.get('/', (req, res) => {
  res.send("API working");
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} - Headers:`, req.headers);
    next();
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
