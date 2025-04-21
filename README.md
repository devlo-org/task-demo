# Task Management API

A RESTful API for managing tasks and users in a team environment.

## Features

- User authentication and authorization
- Task CRUD operations
- Role-based access control
- Task assignment and status tracking
- Priority management
- MongoDB integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile
- GET /api/users/users - Get all users (admin only)

### Tasks
- POST /api/tasks - Create a new task
- GET /api/tasks - Get tasks (with filters)
- PATCH /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task (admin only)

## Development

```bash
# Run in development mode
npm run dev

# Build the project
npm run build

# Run linting
npm run lint

# Run tests
npm run test
```

## Security Considerations

- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- Role-based access control implemented
- Rate limiting enabled
- Helmet middleware for security headers