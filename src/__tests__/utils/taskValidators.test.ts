import { 
  validateTitle, 
  validateDescription, 
  validateStatus, 
  validatePriority, 
  validateDueDate, 
  validateAssignedTo 
} from '../../utils/taskValidators';
import mongoose from 'mongoose';

// Mock mongoose for the user validation test
jest.mock('mongoose', () => {
  // Create a mock User model
  const mockUserModel = {
    exists: jest.fn()
  };
  
  return {
    Types: {
      ObjectId: {
        isValid: jest.fn(),
      },
    },
    model: jest.fn((name) => {
      if (name === 'User') {
        return mockUserModel;
      }
      return {
        exists: jest.fn()
      };
    }),
  };
});

describe('Task Validators', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  describe('validateTitle', () => {
    test('should reject empty titles', () => {
      expect(validateTitle('')).toEqual({ 
        isValid: false, 
        error: 'Title must be between 1 and 100 characters' 
      });
    });
    
    test('should reject whitespace-only titles', () => {
      expect(validateTitle('   ')).toEqual({ 
        isValid: false, 
        error: 'Title must be between 1 and 100 characters' 
      });
    });
    
    test('should reject non-string titles', () => {
      expect(validateTitle(123 as any)).toEqual({ 
        isValid: false, 
        error: 'Title must be between 1 and 100 characters' 
      });
      expect(validateTitle(null as any)).toEqual({ 
        isValid: false, 
        error: 'Title must be between 1 and 100 characters' 
      });
      expect(validateTitle({} as any)).toEqual({ 
        isValid: false, 
        error: 'Title must be between 1 and 100 characters' 
      });
    });
    
    test('should reject titles longer than 100 characters', () => {
      expect(validateTitle('a'.repeat(101))).toEqual({ 
        isValid: false, 
        error: 'Title must be between 1 and 100 characters' 
      });
    });
    
    test('should accept valid titles', () => {
      expect(validateTitle('Valid Title')).toEqual({ isValid: true });
      expect(validateTitle('a'.repeat(100))).toEqual({ isValid: true }); // Boundary test
    });
  });
  
  describe('validateDescription', () => {
    test('should reject empty descriptions', () => {
      expect(validateDescription('')).toEqual({ 
        isValid: false, 
        error: 'Description is required and must be a non-empty string' 
      });
    });
    
    test('should reject whitespace-only descriptions', () => {
      expect(validateDescription('   ')).toEqual({ 
        isValid: false, 
        error: 'Description is required and must be a non-empty string' 
      });
    });
    
    test('should reject non-string descriptions', () => {
      expect(validateDescription(123 as any)).toEqual({ 
        isValid: false, 
        error: 'Description is required and must be a non-empty string' 
      });
      expect(validateDescription(null as any)).toEqual({ 
        isValid: false, 
        error: 'Description is required and must be a non-empty string' 
      });
    });
    
    test('should accept valid descriptions', () => {
      expect(validateDescription('Valid Description')).toEqual({ isValid: true });
      expect(validateDescription('Short')).toEqual({ isValid: true });
      expect(validateDescription('a'.repeat(1000))).toEqual({ isValid: true }); // Long description
    });
  });
  
  describe('validateStatus', () => {
    test('should reject invalid status values', () => {
      expect(validateStatus('pending')).toEqual({ 
        isValid: false, 
        error: 'Invalid status value' 
      });
      expect(validateStatus('done')).toEqual({ 
        isValid: false, 
        error: 'Invalid status value' 
      });
      expect(validateStatus(123 as any)).toEqual({ 
        isValid: false, 
        error: 'Invalid status value' 
      });
    });
    
    test('should accept valid status values', () => {
      expect(validateStatus('todo')).toEqual({ isValid: true });
      expect(validateStatus('in_progress')).toEqual({ isValid: true });
      expect(validateStatus('completed')).toEqual({ isValid: true });
    });
  });
  
  describe('validatePriority', () => {
    test('should reject non-integer priorities', () => {
      expect(validatePriority(2.5)).toEqual({ 
        isValid: false, 
        error: 'Priority must be an integer between 1 and 5' 
      });
      expect(validatePriority('3' as any)).toEqual({ 
        isValid: false, 
        error: 'Priority must be an integer between 1 and 5' 
      });
    });
    
    test('should reject priorities out of range', () => {
      expect(validatePriority(0)).toEqual({ 
        isValid: false, 
        error: 'Priority must be an integer between 1 and 5' 
      });
      expect(validatePriority(6)).toEqual({ 
        isValid: false, 
        error: 'Priority must be an integer between 1 and 5' 
      });
      expect(validatePriority(-1)).toEqual({ 
        isValid: false, 
        error: 'Priority must be an integer between 1 and 5' 
      });
    });
    
    test('should accept valid priorities', () => {
      expect(validatePriority(1)).toEqual({ isValid: true });
      expect(validatePriority(3)).toEqual({ isValid: true });
      expect(validatePriority(5)).toEqual({ isValid: true });
    });
  });
  
  describe('validateDueDate', () => {
    // Create a Jest spy for Date constructor
    const originalDateConstructor = global.Date;
    const mockNow = new Date('2023-01-01T12:00:00Z').getTime();
    
    beforeEach(() => {
      // Simple Date mock that always returns fixed 'now' date
      // when called without arguments, but works normally otherwise
      global.Date = jest.fn((...args: any[]) => {
        if (args.length === 0) {
          return new originalDateConstructor(mockNow);
        }
        return new originalDateConstructor(...args);
      }) as any;
      
      // Ensure the Date.now() function works as expected
      global.Date.now = jest.fn(() => mockNow);
    });
    
    afterEach(() => {
      // Restore original Date constructor
      global.Date = originalDateConstructor;
    });
    
    test('should reject invalid date formats', () => {
      // Create a date that will definitely be invalid
      const result = validateDueDate('definitely-not-a-date');
      
      // Verify result has the expected error
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid due date format');
    });
    
    test('should reject dates in the past', () => {
      // Create a date that's in the past
      const result = validateDueDate('2022-12-31T12:00:00Z');
      
      // Verify result has the expected error
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Due date must be in the future');
    });
    
    test('should accept valid future dates', () => {
      // Create a date that's in the future
      const result = validateDueDate('2023-01-02T12:00:00Z');
      
      // Verify validation passes
      expect(result.isValid).toBe(true);
      // Check that we got a parsed date that looks like a date object
      expect(typeof result.parsedDate).toBe('object');
      expect(result.parsedDate?.toISOString).toBeDefined();
    });
  });
  
  describe('validateAssignedTo', () => {
    test('should reject invalid ObjectId format', async () => {
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);
      
      const result = await validateAssignedTo('invalid-id');
      
      expect(result).toEqual({ 
        isValid: false, 
        error: 'Invalid assignedTo user ID' 
      });
      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalid-id');
    });
    
    test('should reject non-existent users', async () => {
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      (mongoose.model as jest.Mock)().exists.mockResolvedValue(false);
      
      const result = await validateAssignedTo('valid-id-but-no-user');
      
      expect(result).toEqual({ 
        isValid: false, 
        error: 'Assigned user does not exist' 
      });
      expect(mongoose.model).toHaveBeenCalledWith('User');
      expect(mongoose.model('User').exists).toHaveBeenCalledWith({ _id: 'valid-id-but-no-user' });
    });
    
    test('should accept valid users', async () => {
      (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(true);
      
      // Get the mock User model and set it to return true for exists
      const mockUserModel = mongoose.model('User');
      (mockUserModel.exists as jest.Mock).mockResolvedValue(true);
      
      const result = await validateAssignedTo('valid-user-id');
      
      expect(result).toEqual({ isValid: true });
      expect(mongoose.model).toHaveBeenCalledWith('User');
      expect(mockUserModel.exists).toHaveBeenCalledWith({ _id: 'valid-user-id' });
    });
  });
});
