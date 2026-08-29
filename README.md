# DevBoard

DevBoard is a compact full-stack MERN application built for learning and practicing modern React, Node.js, Express, and MongoDB development.

The project is intentionally kept small while introducing practical full-stack concepts such as authentication, user-owned data, REST APIs, custom hooks, React Context, optimistic UI updates, debounced search, pagination, and React performance optimization.

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure

```text
devboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskItem.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useDebounce.js
│   │   │   └── useTasks.js
│   │   │
│   │   ├── lib/
│   │   │   └── api.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── models/
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Features

### Authentication

- User registration
- User login
- JWT authentication
- Protected routes
- Authenticated session validation
- Logout
- User-owned task data

### Task Management

- Create tasks
- Edit tasks
- Complete and uncomplete tasks
- Delete tasks
- Task priorities
- Due dates
- Search
- Status filtering
- Priority filtering
- Sorting
- Pagination

### User Experience

- Responsive layout
- Mobile navigation
- Loading states
- Error states
- Empty states
- Optimistic updates
- Request cancellation
- Debounced search

## React Concepts

DevBoard is also used as a practical React learning project.

### Custom Hooks

Task logic is separated into:

```text
useTasks
```

Authentication logic is separated into:

```text
useAuth
```

Debounced values are handled by:

```text
useDebounce
```

### React Context

Authentication state is shared through:

```text
AuthProvider
```

This allows components such as the navbar, login page, signup page, and protected routes to access the same authenticated user state.

### `useCallback`

Used where stable function references are useful, particularly when callbacks are passed to memoized components or when callback identity needs to remain stable across renders.

### `useMemo`

Used when derived data benefits from memoization rather than being recalculated unnecessarily.

The project intentionally avoids using `useMemo` everywhere.

### `React.memo`

`TaskItem` is memoized so unchanged task components can avoid unnecessary re-renders when their props remain unchanged.

### Optimistic Updates

Task mutations update the UI immediately and synchronize with the backend afterward.

If the request fails, the UI rolls back to its previous state.

### Debounced Search

Search input remains responsive while backend requests are delayed until the user pauses typing.

### Request Cancellation

`AbortController` is used to prevent obsolete task-list requests from overwriting newer results.

## API Overview

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Tasks

```text
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Task queries support:

```text
page
limit
search
status
priority
sort
```

Example:

```text
/api/tasks?page=1&limit=10&search=react&status=active&priority=high&sort=dueDate
```

## Environment Variables

Create:

```text
server/.env
```

Use `server/.env.example` as the template.

Example:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
MONGO_URI=
JWT_SECRET=
```

Never commit real environment variables or secrets to GitHub.

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd devboard
```

### Frontend

```bash
cd client
npm install
```

### Backend

Open another terminal:

```bash
cd server
npm install
```

## Running the Application

### Start the Backend

```bash
cd server
npm run dev
```

The backend runs at:

```text
http://localhost:4000
```

### Start the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Development Approach

DevBoard is developed incrementally.

Each meaningful change is:

1. Implemented
2. Tested
3. Debugged
4. Refactored when necessary
5. Committed to Git
6. Pushed to GitHub

The goal is to keep the project compact while building features that demonstrate useful real-world concepts.

## Git Workflow

Check the repository:

```bash
git status
```

Stage changes:

```bash
git add .
```

Commit changes:

```bash
git commit -m "feat: describe the change"
```

Push changes:

```bash
git push origin main
```

### Example Commit Messages

```text
feat: add task editing
feat: add task pagination
feat: add authentication
fix: validate task object ids
fix: escape task search regex
perf: debounce server task search
refactor: extract task logic into custom hook
```

## Learning Goals

The main purpose of DevBoard is to build a realistic MERN application without unnecessary complexity.

The project focuses on:

- Modern React
- React hooks
- Custom hooks
- React Context
- Component design
- `useCallback`
- `useMemo`
- `React.memo`
- Optimistic UI
- Debounced search
- Request cancellation
- REST API design
- Express middleware
- MongoDB and Mongoose
- Authentication
- Authorization
- Validation
- Error handling
- Git and GitHub workflow

## Current Status

The project foundation, authentication system, task management, server-side filtering, sorting, and pagination are implemented.

The application is still being developed as a learning project, with additional improvements and experiments being added incrementally.

## License

This project is for learning and educational purposes.