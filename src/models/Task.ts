import mongoose from "mongoose";

export interface ITask {
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: number;
  dueDate: Date | string;
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed"],
      default: "todo",
    },
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: "Due date must be in the future",
      },
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);
