DevBoard

DevBoard is a compact full-stack MERN application for managing personal development tasks.

The project is intentionally focused while demonstrating practical full-stack concepts including React, Node.js, Express, MongoDB, authentication, authorization, validation, REST APIs, custom hooks, optimistic UI updates, debounced search, pagination, URL-synchronized state, and layered backend architecture.

Tech Stack

Frontend

React

Vite

React Router

Tailwind CSS

Axios

Lucide React

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT

bcryptjs

cookie-parser

CORS

csrf-csrf

Project Structure

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
│   │   ├── services/
│   │   │   └── taskService.js
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
│   │   │   ├── csrf.js
│   │   │   ├── errorHandler.js
│   │   │   └── originCheck.js
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
│   │   ├── validators/
│   │   │   ├── authValidators.js
│   │   │   └── taskValidators.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md

Architecture

Frontend layers

The frontend uses a small, explicit separation of responsibilities:

Pages / Components
        ↓
      Hooks
        ↓
    Services
        ↓
       Lib
        ↓
    Backend API

components/ contains reusable UI components.

pages/ contains route-level screens.

hooks/ contains reusable React state and lifecycle logic.

context/ provides shared authentication state.

services/ contains application/API operations such as task requests.

lib/ contains lower-level reusable utilities and the configured Axios client.

services/taskService.js is the task API layer. It provides the task operations used by useTasks and TaskDetails, while lib/api.js owns the shared Axios configuration, credentials, and CSRF-token handling.

Backend layers

The backend follows a layered structure:

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

config/ manages environment and database configuration.

routes/ defines HTTP endpoints and route middleware.

middleware/ handles authentication, CSRF protection, origin validation, and centralized errors.

controllers/ handle HTTP input, validation results, service calls, status codes, and responses.

services/ contain database and application logic.

models/ define Mongoose models.

validators/ keep request validation separate from controllers.

Features

Authentication

User registration

User login

Cookie-based authentication

HttpOnly authentication cookie

JWT-based authentication state inside the cookie

Protected routes

Authenticated session validation

Logout with server-side cookie clearing

User-owned task data

Password hashing with bcryptjs

Task Management

Create tasks

Edit tasks

Complete and uncomplete tasks

Delete tasks

Task priorities

Due dates

Search

Status filtering

Priority filtering

Sorting

Pagination

Task details page

User Experience

Responsive layout

Mobile navigation

Loading states

Error states

Empty states

Optimistic task updates

Rollback after failed mutations

Request cancellation

Debounced search

URL-synchronized filters and pagination

Normalization of invalid pagination URLs

Security Architecture

DevBoard uses cookie-only browser authentication.

The browser does not store the authentication token in localStorage and does not send an Authorization: Bearer header.

The authentication flow is:

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

The authentication cookie is configured with:

HttpOnly
SameSite=Lax
Secure in production

The frontend Axios client uses credentialed requests so the browser can send the authentication cookie.

CSRF protection

State-changing requests use CSRF protection through csrf-csrf.

The protected methods are applied to authentication and task mutations, while GET, HEAD, and OPTIONS are treated as safe methods.

The frontend obtains the CSRF token from:

GET /api/auth/csrf-token

and sends it in the X-CSRF-Token request header for state-changing requests.

Origin validation

State-changing requests are also checked against the configured client origin. Requests without an origin header or with an unexpected origin are rejected.

Credentialed CORS is restricted to the configured frontend origin.

React Architecture

Custom Hooks

Authentication state and actions are accessed through:

useAuth

Task-list state, mutations, pagination, filtering, and request coordination are handled through:

useTasks

Debounced values are handled through:

useDebounce

React Context

Authentication state is provided through:

AuthProvider

and consumed through:

useAuth

The context exposes:

user
isAuthenticated
isCheckingAuth
login
signup
logout
refreshUser

Component Structure

Task editing is centralized in:

TaskEditor

Task creation is handled by:

TaskForm

Individual task rendering is handled by:

TaskItem

Task details are displayed through:

TaskDetails

Task Service Layer

Task API communication is centralized in:

client/src/services/taskService.js

It provides:

getTask()
createTask()
updateTask()
deleteTask()
fetchTaskList()

This keeps HTTP endpoint details out of useTasks, TaskDetails, and the UI components.

The lower-level Axios client remains in:

client/src/lib/api.js

Optimistic Updates

Task mutations update the interface immediately.

The frontend synchronizes the operation with the backend and restores the previous state if the request fails.

This behavior is used for:

Create
Update
Complete / Uncomplete
Delete

Search and Request Cancellation

Search uses a debounce interval so the API is not called for every keystroke.

AbortController cancels obsolete task-list requests so an older request cannot overwrite newer results.

Pagination and URL Synchronization

Dashboard filters and pagination are synchronized with the browser URL.

Example:

/dashboard?search=react&status=active&priority=high&sort=dueDate&page=2

Page 1 is treated as the default and does not need to appear in the URL.

If the backend normalizes an invalid page to the last available page, the dashboard updates the browser URL to match the actual page.

API Overview

Health

GET /api/health

Authentication

POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/csrf-token
GET  /api/auth/me

Tasks

GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

Task queries support:

page
limit
search
status
priority
sort

Example:

/api/tasks?page=1&limit=10&search=react&status=active&priority=high&sort=dueDate

Environment Variables

Frontend

Create:

client/.env

using:

client/.env.example

Example:

VITE_API_URL=http://localhost:4000/api

Backend

Create:

server/.env

using:

server/.env.example

Example:

PORT=4000
CLIENT_URL=http://localhost:5173
MONGO_URI=
MONGO_DB_NAME=devboard
JWT_SECRET=
NODE_ENV=development

The exact MongoDB connection string depends on whether MongoDB is running locally or through a hosted provider.

Never commit real environment variables or secrets to Git.

Installation

Clone the repository:

git clone <your-repository-url>
cd devboard

Frontend

cd client
npm install

Backend

Open another terminal:

cd server
npm install

Running the Application

Start the Backend

cd server
npm run dev

The backend normally runs at:

http://localhost:4000

Start the Frontend

Open another terminal:

cd client
npm run dev

The frontend normally runs at:

http://localhost:5173

Production Notes

For production deployment:

Use HTTPS.

Keep the authentication cookie Secure.

Use a strong, private JWT_SECRET.

Keep MONGO_URI and other secrets outside Git.

Configure CLIENT_URL to the exact frontend origin.

Keep credentialed CORS restricted to trusted origins.

Do not store authentication tokens in browser localStorage.

Do not expose the authentication cookie to JavaScript.

Git Workflow

Check the repository:

git status

Stage changes:

git add .

Commit changes:

git commit -m "describe the change"

Push changes:

git push origin main

Example commit messages:

feat: add task editing
feat: add task pagination
feat: add authentication
fix: validate task object ids
fix: escape task search regex
perf: debounce server task search
refactor: extract task service
refactor: organize client services

Validation

Frontend linting

cd client
npm run lint

Frontend production build

cd client
npm run build

Backend syntax checks

The backend package currently does not define an npm run lint script. Individual server files can be checked with Node's syntax checker:

node --check src/services/taskService.js

Backend development server

cd server
npm run dev

The server should connect to MongoDB and start on the configured port. The application also supports graceful shutdown of the HTTP server and MongoDB connection.

Learning Goals

DevBoard is intended to remain a focused MERN learning project.

The project demonstrates:

Modern React

React hooks

Custom hooks

React Context

Component design

useCallback

useMemo

React.memo

Optimistic UI

Debounced search

Request cancellation

URL state synchronization

REST API design

Express middleware

Layered backend architecture

MongoDB and Mongoose

JWT authentication

HttpOnly cookie authentication

CSRF protection

Origin validation

Authorization

Validation

Error handling

Git and GitHub workflow

Client-side service-layer organization

Current Status

The core DevBoard application is implemented and the current refactored codebase has been verified with:

✅ Authentication
✅ Cookie-only browser sessions
✅ CSRF protection
✅ Origin validation
✅ Task management
✅ Task details
✅ Search and filtering
✅ Sorting
✅ Pagination
✅ URL synchronization
✅ Optimistic updates
✅ Backend validation
✅ Layered backend structure
✅ Client service layer
✅ MongoDB connection management
✅ Graceful server shutdown
✅ Frontend lint
✅ Frontend production build
✅ Backend startup verification

The project is intentionally kept focused so the core MERN concepts remain easy to study and understand.

License

This project is for learning and educational purposes.
