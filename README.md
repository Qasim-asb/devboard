# DevBoard

DevBoard is a compact full-stack MERN application built for learning and practicing modern React and Node.js development.

The project is intentionally kept small while introducing real-world concepts such as reusable components, custom hooks, authentication, REST APIs, MongoDB, and React performance optimization.

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Project Structure

    devboard/
    ├── client/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── package.json
    │   └── vite.config.js
    │
    ├── server/
    │   ├── src/
    │   │   └── server.js
    │   ├── package.json
    │   └── .env.example
    │
    ├── .gitignore
    └── README.md

## Planned Features

The application will be developed incrementally.

- User authentication
- Protected routes
- User dashboard
- Task creation
- Task editing
- Task deletion
- Search and filtering
- Sorting
- Pagination
- REST API
- MongoDB persistence
- Server-side validation
- Error handling
- Loading states
- Empty states
- Custom React hooks
- React performance optimization
- `useMemo`
- `useCallback`
- `React.memo`

## React Performance

Performance optimization will be introduced when it provides a real benefit.

### `useMemo`

Used to avoid repeating expensive calculations such as filtering or sorting.

### `useCallback`

Used to preserve function references when passing handlers to memoized child components.

### `React.memo`

Used to prevent unnecessary re-renders when a component receives unchanged props.

These features will be added gradually so the project demonstrates not only how they work, but also when they should and should not be used.

## Installation

Clone the repository:

    git clone <your-repository-url>
    cd devboard

### Install Frontend Dependencies

    cd client
    npm install

### Install Backend Dependencies

Open another terminal:

    cd server
    npm install

## Environment Variables

Create a local environment file:

    server/.env

Use `server/.env.example` as the template.

Example:

    PORT=4000
    MONGO_URI=your-mongodb-connection-string
    JWT_SECRET=your-secret

Never commit `.env` to GitHub.

## Running the Application

### Start the Backend

    cd server
    npm run dev

The backend will run at:

    http://localhost:4000

### Start the Frontend

Open another terminal:

    cd client
    npm run dev

The frontend will normally run at:

    http://localhost:5173

## Development Approach

DevBoard is intentionally developed in small milestones.

For each milestone:

1. Build one meaningful feature.
2. Test the feature.
3. Fix bugs.
4. Refactor where necessary.
5. Commit the changes.
6. Push the commit to GitHub.

This keeps the project compact and makes the Git history useful as a learning record.

## Git Workflow

Check the current status:

    git status

Stage changes:

    git add .

Create a commit:

    git commit -m "feat: add task creation"

Push the changes:

    git push origin main

### Example Commit Messages

    feat: add task creation
    feat: add task filtering
    feat: add protected routes
    fix: handle invalid task id
    fix: handle authentication error
    refactor: extract task item component
    perf: memoize filtered tasks

## Learning Goals

The main goal of DevBoard is to build a realistic MERN application without unnecessary complexity.

The project focuses on:

- Modern React
- React hooks
- Component design
- Custom hooks
- Performance optimization
- REST API design
- Express middleware
- MongoDB and Mongoose
- Authentication
- Authorization
- Validation
- Error handling
- Git and GitHub workflow

## Current Status

### Milestone 1 — Project Foundation

- React/Vite frontend initialized
- Express backend initialized
- MongoDB integration planned
- Git repository initialized
- Root project structure established

More features will be added step by step.

## License

This project is for learning and educational purposes.