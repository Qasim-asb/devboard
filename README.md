# DevBoard

DevBoard is a compact full-stack MERN application for managing personal development tasks.

The project is intentionally kept focused while demonstrating practical full-stack concepts including React, Node.js, Express, MongoDB, authentication, authorization, validation, REST APIs, custom hooks, optimistic UI updates, debounced search, pagination, and clean backend architecture.

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* cookie-parser
* CORS

## Project Structure

```text
devboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── TaskEditor.jsx
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
│   │   │   ├── api.js
│   │   │   └── taskUtils.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── TaskDetails.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── models/
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── taskService.js
│   │   │
│   │   └── validators/
│   │       ├── authValidators.js
│   │       └── taskValidators.js
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Features

### Authentication

* User registration
* User login
* Cookie-based authentication
* HttpOnly authentication cookie
* Protected routes
* Authenticated session validation
* Logout with server-side cookie clearing
* User-owned task data
* Password hashing with bcryptjs
* JWT-based authentication state inside the secure cookie

### Task Management

* Create tasks
* Edit tasks
* Complete and uncomplete tasks
* Delete tasks
* Task priorities
* Due dates
* Search
* Status filtering
* Priority filtering
* Sorting
* Pagination
* Task details page

### User Experience

* Responsive layout
* Mobile navigation
* Loading states
* Error states
* Empty states
* Optimistic task updates
* Rollback after failed mutations
* Request cancellation
* Debounced search
* URL-synchronized filters and pagination
* Normalization of invalid pagination URLs

## Authentication Architecture

DevBoard uses cookie-only browser authentication.

The browser does not store the authentication token in `localStorage` and does not send an `Authorization: Bearer` header.

The authentication flow is:

```text
Login / Signup
      ↓
Server validates credentials
      ↓
Server creates JWT
      ↓
Server sets HttpOnly cookie
      ↓
Browser stores cookie
      ↓
Browser automatically sends cookie
      ↓
Protected API verifies JWT
```

The authentication cookie is configured with:

```text
HttpOnly
SameSite=Lax
Secure in production
```

The frontend Axios client uses credentialed requests so the browser can send the authentication cookie.

Logout is handled through:

```text
POST /api/auth/logout
```

which clears the authentication cookie on the server.

The current authenticated user is restored through:

```text
GET /api/auth/me
```

after a browser refresh.

## React Architecture

### Custom Hooks

Authentication logic is accessed through:

```text
useAuth
```

Task-list state and task mutations are handled through:

```text
useTasks
```

Debounced values are handled through:

```text
useDebounce
```

### React Context

Authentication state is provided through:

```text
AuthProvider
```

and consumed through:

```text
useAuth
```

The context exposes:

```text
user
isAuthenticated
isCheckingAuth
login
signup
logout
refreshUser
```

### Component Structure

Task editing is centralized in:

```text
TaskEditor
```

Task creation is handled by:

```text
TaskForm
```

Individual task rendering is handled by:

```text
TaskItem
```

Individual task details are displayed through:

```text
TaskDetails
```

## Optimistic Updates

Task mutations update the interface immediately.

The frontend synchronizes the operation with the backend and restores the previous state if the request fails.

This behavior is used for:

```text
Create
Update
Complete / Uncomplete
Delete
```

## Search and Request Cancellation

Search uses a debounce interval so the API is not called for every keystroke.

`AbortController` cancels obsolete task-list requests so an older request cannot overwrite newer results.

## Pagination and URL Synchronization

Dashboard filters and pagination are synchronized with the browser URL.

Example:

```text
/dashboard?search=react&status=active&priority=high&sort=dueDate&page=2
```

Page `1` is treated as the default and does not need to appear in the URL.

If the backend normalizes an invalid page to the last available page, the dashboard updates the browser URL to match the actual page.

## Backend Architecture

The backend follows a layered structure:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
MongoDB
```

### Config

`config/env.js`

* Loads environment variables
* Validates required environment variables
* Exposes normalized application configuration

`config/database.js`

* Connects to MongoDB
* Monitors MongoDB connection state
* Closes the database connection during shutdown

### Controllers

Controllers handle HTTP concerns such as:

```text
request input
validation results
service calls
status codes
responses
```

### Services

Services contain database and application logic for:

```text
authentication
tasks
```

### Middleware

Authentication middleware validates the JWT stored in the HttpOnly cookie.

The global error middleware handles:

```text
Mongoose validation errors
Mongoose cast errors
duplicate-key errors
application errors
unexpected server errors
```

### Validators

Validation logic is separated from controllers.

Authentication validators handle:

```text
name
email
password
```

Task validators handle:

```text
task IDs
task titles
completion state
priority
due dates
query parameters
sorting
filtering
pagination
```

## API Overview

### Health

```text
GET /api/health
```

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Tasks

```text
GET    /api/tasks
GET    /api/tasks/:id
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

### Frontend

Create:

```text
client/.env
```

using:

```text
client/.env.example
```

Example:

```env
VITE_API_URL=http://localhost:4000/api
```

### Backend

Create:

```text
server/.env
```

using:

```text
server/.env.example
```

Example:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
MONGO_URI=
MONGO_DB_NAME=devboard
JWT_SECRET=
NODE_ENV=development
```

The exact MongoDB connection string depends on whether MongoDB is running locally or through a hosted provider.

Never commit real environment variables or secrets to Git.

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

The backend normally runs at:

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

## Production Notes

For production deployment:

* Use HTTPS.
* Keep the authentication cookie `Secure`.
* Use a strong, private `JWT_SECRET`.
* Keep `MONGO_URI` and other secrets outside Git.
* Configure `CLIENT_URL` to the exact frontend origin.
* Keep credentialed CORS restricted to trusted origins.
* Do not store authentication tokens in browser `localStorage`.
* Do not expose the authentication cookie to JavaScript.

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
git commit -m "describe the change"
```

Push changes:

```bash
git push origin main
```

Example commit messages:

```text
feat: add task editing
feat: add task pagination
feat: add authentication
fix: validate task object ids
fix: escape task search regex
perf: debounce server task search
refactor: extract task service
refactor: improve server bootstrap and database configuration
```

## Validation

Frontend linting:

```bash
cd client
npm run lint
```

Frontend production build:

```bash
npm run build
```

Backend development server:

```bash
cd server
npm run dev
```

The backend package currently does not define an `npm run lint` script.

## Learning Goals

DevBoard is intended to remain a focused MERN learning project.

The project demonstrates:

* Modern React
* React hooks
* Custom hooks
* React Context
* Component design
* `useCallback`
* `useMemo`
* `React.memo`
* Optimistic UI
* Debounced search
* Request cancellation
* URL state synchronization
* REST API design
* Express middleware
* Layered backend architecture
* MongoDB and Mongoose
* JWT authentication
* HttpOnly cookie authentication
* Authorization
* Validation
* Error handling
* Git and GitHub workflow

## Current Status

The core DevBoard application is implemented and verified.

The project includes:

```text
✅ Authentication
✅ Cookie-only browser sessions
✅ Task management
✅ Task details
✅ Search and filtering
✅ Sorting
✅ Pagination
✅ URL synchronization
✅ Optimistic updates
✅ Backend validation
✅ Layered backend structure
✅ MongoDB connection management
✅ Graceful server shutdown
✅ Frontend lint
✅ Production build
```

The project is intentionally kept focused and does not require additional user-facing features to demonstrate its core MERN concepts.

## License

This project is for learning and educational purposes.
