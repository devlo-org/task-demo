import express, { Request, Response } from "express";
import { Task } from "../models/Task";
import { authenticate, authorize } from "../middleware/auth";
import mongoose from "mongoose";

const router = express.Router();

interface CreateTaskRequest {
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: number;
  dueDate: string;
  assignedTo: string;
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "completed";
  priority?: number;
  dueDate?: string;
  assignedTo?: string;
}

router.post(
  "/",
  authenticate,
  async (
    req: Request<{}, {}, CreateTaskRequest>,
    res: Response,
  ): Promise<void> => {
    try {
      const { title, description, status, priority, dueDate, assignedTo } =
        req.body;

      if (!title || !description || !dueDate || !assignedTo) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const task = new Task({
        title,
        description,
        status: status || "todo",
        priority: priority || 3,
        dueDate: new Date(dueDate),
        assignedTo,
        createdBy: req.user?.userId,
      });

      await task.save();
      await task.populate("assignedTo", "name email");
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to create task" });
    }
  },
);

router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, priority, assignedTo } = req.query;
      const query: any = {};
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20;

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (assignedTo === "me") {
        query.assignedTo = new mongoose.Types.ObjectId(req.user?.userId);
      }

      const tasks = await Task.find(query)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Task.countDocuments(query);

      res.json({
        tasks,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  },
);

router.patch(
  "/:id",
  authenticate,
  async (
    req: Request<{ id: string }, {}, UpdateTaskRequest>,
    res: Response,
  ): Promise<void> => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      if (
        task.assignedTo.toString() !== req.user?.userId &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({ error: "Not authorized to update this task" });
        return;
      }

      const updates = req.body;
      
      // Validate title if provided
      if (updates.title !== undefined) {
        if (typeof updates.title !== 'string' || updates.title.trim().length === 0 || updates.title.length > 100) {
          res.status(400).json({ error: "Title must be between 1 and 100 characters" });
          return;
        }
        updates.title = updates.title.trim();
      }

      // Validate description if provided
      if (updates.description !== undefined) {
        if (typeof updates.description !== 'string' || updates.description.trim().length === 0) {
          res.status(400).json({ error: "Description is required and must be a non-empty string" });
          return;
        }
        updates.description = updates.description.trim();
      }

      // Validate status if provided
      if (updates.status !== undefined) {
        const validStatuses = ["todo", "in_progress", "completed"];
        if (!validStatuses.includes(updates.status)) {
          res.status(400).json({ error: "Invalid status value" });
          return;
        }
      }

      // Validate priority if provided
      if (updates.priority !== undefined) {
        if (!Number.isInteger(updates.priority) || updates.priority < 1 || updates.priority > 5) {
          res.status(400).json({ error: "Priority must be an integer between 1 and 5" });
          return;
        }
      }

      // Validate due date if provided
      if (updates.dueDate !== undefined) {
        const dueDate = new Date(updates.dueDate);
        if (isNaN(dueDate.getTime())) {
          res.status(400).json({ error: "Invalid due date format" });
          return;
        }
        if (dueDate <= new Date()) {
          res.status(400).json({ error: "Due date must be in the future" });
          return;
        }
        updates.dueDate = dueDate;
      }

      // Validate assignedTo if provided
      if (updates.assignedTo !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(updates.assignedTo)) {
          res.status(400).json({ error: "Invalid assignedTo user ID" });
          return;
        }
        const userExists = await mongoose.model('User').exists({ _id: updates.assignedTo });
        if (!userExists) {
          res.status(400).json({ error: "Assigned user does not exist" });
          return;
        }
      }

      Object.assign(task, updates);
      await task.save();
      await task.populate("assignedTo", "name email");
      res.json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Failed to update task" });
      }
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  },
);

export const taskRouter = router;
