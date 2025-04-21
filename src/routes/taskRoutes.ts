import express, { Request, Response } from "express";
import { Task } from "../models/Task";
import { authenticate, authorize } from "../middleware/auth";
import mongoose from "mongoose";
import { 
  validateTitle, 
  validateDescription, 
  validateStatus, 
  validatePriority, 
  validateDueDate, 
  validateAssignedTo 
} from '../utils/taskValidators';

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
  dueDate?: string | Date;
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
      
      // Use imported validators
      
      // Validate title if provided
      if (updates.title !== undefined) {
        const result = validateTitle(updates.title);
        if (!result.isValid) {
          res.status(400).json({ error: result.error });
          return;
        }
        updates.title = updates.title.trim();
      }

      // Validate description if provided
      if (updates.description !== undefined) {
        const result = validateDescription(updates.description);
        if (!result.isValid) {
          res.status(400).json({ error: result.error });
          return;
        }
        updates.description = updates.description.trim();
      }

      // Validate status if provided
      if (updates.status !== undefined) {
        const result = validateStatus(updates.status);
        if (!result.isValid) {
          res.status(400).json({ error: result.error });
          return;
        }
      }

      // Validate priority if provided
      if (updates.priority !== undefined) {
        const result = validatePriority(updates.priority);
        if (!result.isValid) {
          res.status(400).json({ error: result.error });
          return;
        }
      }

      // Validate due date if provided
      if (updates.dueDate !== undefined) {
        const result = validateDueDate(updates.dueDate);
        if (!result.isValid) {
          res.status(400).json({ error: result.error });
          return;
        }
        updates.dueDate = result.parsedDate;
      }

      // Validate assignedTo if provided
      if (updates.assignedTo !== undefined) {
        const result = await validateAssignedTo(updates.assignedTo);
        if (!result.isValid) {
          res.status(400).json({ error: result.error });
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
