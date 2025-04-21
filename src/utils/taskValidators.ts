import mongoose from 'mongoose';

/**
 * Validates that a task title is properly formatted
 */
export const validateTitle = (title: unknown): { isValid: boolean; error?: string } => {
  if (typeof title !== 'string' || title.trim().length === 0 || title.length > 100) {
    return { isValid: false, error: 'Title must be between 1 and 100 characters' };
  }
  return { isValid: true };
};

/**
 * Validates that a task description is properly formatted
 */
export const validateDescription = (description: unknown): { isValid: boolean; error?: string } => {
  if (typeof description !== 'string' || description.trim().length === 0) {
    return { isValid: false, error: 'Description is required and must be a non-empty string' };
  }
  return { isValid: true };
};

/**
 * Validates that a task status is a valid enum value
 */
export const validateStatus = (status: unknown): { isValid: boolean; error?: string } => {
  const validStatuses = ['todo', 'in_progress', 'completed'];
  if (!validStatuses.includes(status as string)) {
    return { isValid: false, error: 'Invalid status value' };
  }
  return { isValid: true };
};

/**
 * Validates that a task priority is in the valid range
 */
export const validatePriority = (priority: unknown): { isValid: boolean; error?: string } => {
  if (!Number.isInteger(priority) || (priority as number) < 1 || (priority as number) > 5) {
    return { isValid: false, error: 'Priority must be an integer between 1 and 5' };
  }
  return { isValid: true };
};

/**
 * Validates that a due date is in the valid format and in the future
 */
export const validateDueDate = (dueDate: unknown): { isValid: boolean; error?: string; parsedDate?: Date } => {
  const parsedDate = new Date(dueDate as string);
  
  // Check if the date is valid first
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: 'Invalid due date format' };
  }
  
  // Then check if it's in the future
  if (parsedDate <= new Date()) {
    return { isValid: false, error: 'Due date must be in the future' };
  }
  
  return { isValid: true, parsedDate };
};

/**
 * Validates that an assignedTo user ID is valid and exists
 */
export const validateAssignedTo = async (assignedTo: unknown): Promise<{ isValid: boolean; error?: string }> => {
  if (!mongoose.Types.ObjectId.isValid(assignedTo as string)) {
    return { isValid: false, error: 'Invalid assignedTo user ID' };
  }
  
  const userExists = await mongoose.model('User').exists({ _id: assignedTo });
  if (!userExists) {
    return { isValid: false, error: 'Assigned user does not exist' };
  }
  
  return { isValid: true };
};
