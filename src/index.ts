import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { userRouter } from "./routes/userRoutes";
import { taskRouter } from "./routes/taskRoutes";
import { SERVER_CONFIG, DB_CONFIG } from "./config";

const app = express();
const port = SERVER_CONFIG.port;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(limiter);

mongoose
  .connect(DB_CONFIG.uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
