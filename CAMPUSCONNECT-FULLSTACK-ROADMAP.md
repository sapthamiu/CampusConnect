# CampusConnect Full-Stack Implementation Roadmap

## 1. Goal
Transition CampusConnect from a frontend-only prototype (relying on `localStorage`) to a production-ready, full-stack application capable of handling multiple concurrent users, persistent data, and role-based permissions.

## 2. Tech Stack Selection
While the frontend will remain largely the same, we need to introduce a backend server and a database.
- **Frontend:** HTML, CSS (Tailwind), Vanilla JavaScript.
- **Backend:** Node.js with Express.js (keeps the whole stack in JavaScript, making it easier to manage).
- **Database:** PostgreSQL (Relational DB is a good fit since Users, Events, and Registrations have clear relational structures).
- **Authentication:** JSON Web Tokens (JWT).

## 3. Database Schema Design (PostgreSQL)

To properly normalize the data and prevent the logical bugs present in the `localStorage` version, the database should be split into three core tables:

### `Users` Table
Stores authentication and profile information.
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `password_hash` (String)
- `role` (Enum: `'STUDENT'`, `'ORGANIZER'`, `'ADMIN'`)
- `created_at` (Timestamp)

### `Events` Table
Stores the actual event details.
- `id` (UUID, Primary Key)
- `title` (String)
- `date` (Date)
- `type` (Enum: `'workshop'`, `'seminar'`, `'social'`)
- `organizer_id` (UUID, Foreign Key to `Users.id`)
- `created_at` (Timestamp)

### `Registrations` Table
A join table linking Users to the Events they plan to attend.
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key to `Events.id`)
- `user_id` (UUID, Foreign Key to `Users.id`)
- `registered_at` (Timestamp)

## 4. RESTful API Design

The frontend will communicate with the backend via the `fetch` API using these endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - Create a new user account.
- `POST /api/auth/login` - Authenticate and receive a JWT.

### Event Endpoints
- `GET /api/events` - Fetch all upcoming events (replaces reading `events` from `localStorage`).
- `POST /api/events` - Create a new event. **(Protected: Requires JWT and `role='ORGANIZER'`)**.
- `DELETE /api/events/:id` - Cancel an event. **(Protected: Organizer only)**.

### Registration Endpoints
- `POST /api/events/:id/register` - Register the logged-in user for the event. **(Protected: Requires JWT)**.
- `GET /api/users/me/registrations` - Fetch all events the current user is registered for.

## 5. Step-by-Step Implementation Plan

### Phase 1: Backend Setup & Database
1. Initialize a new Node.js project (`npm init`) inside a new `server/` directory.
2. Install dependencies: `express`, `pg` (PostgreSQL client), `cors`, `dotenv`, `jsonwebtoken`, `bcrypt`.
3. Set up the database connection and run SQL scripts to create the tables.
4. Create the REST API endpoints returning dummy JSON data to test the routing.
5. Connect the endpoints to the database using SQL queries.

### Phase 2: Authentication Integration
1. Create `login.html` and `signup.html` pages on the frontend.
2. Wire up the login form to send a POST request to `/api/auth/login`.
3. On successful login, store the received JWT in `localStorage` (e.g., `localStorage.setItem('token', token)`).
4. Create a utility function in JS to attach the JWT to the `Authorization: Bearer <token>` header for all future API calls.
5. Update the UI to hide the "Add Event" button if the logged-in user does not have the `ORGANIZER` role.

### Phase 3: Migrating Events (Replacing LocalStorage)
1. **Modify `calendar.js`:**
   - Remove the hardcoded `events` array and the `loadEvents()` function that reads from `localStorage`.
   - Create an async function `fetchEvents()` that calls `GET /api/events`. 
   - Wait for the API response, update the local `events` array, and call `generateCalendar()`.
2. **Modify the "Add Event" Modal:**
   - Change the form submission logic. Instead of `events.push(event)`, make a `fetch('POST', '/api/events')` request with the event data.
   - Upon a successful `201 Created` response, close the modal and re-call `fetchEvents()` to re-render the calendar.

### Phase 4: Migrating Registrations
1. **Modify `register.js`:**
   - Change the form submission to make a `fetch('POST', '/api/events/:id/register')` request.
   - Wait for a `200 OK` response before redirecting the user to `confirmation.html`.
   - Remove the logic that saves registrations to `localStorage`.
2. **Update UI State:**
   - If a user clicks on an event they are already registered for, the UI should indicate "Already Registered" instead of taking them to the registration form.

### Phase 5: Server-Side Notifications
The current system relies on the browser being open to trigger a local notification. This should be moved to the backend.
1. Remove `checkReminders()` and the HTML5 Notification logic from `calendar.js`.
2. Set up a background job runner on the backend (e.g., using `node-cron`).
3. Schedule a job to run daily at 8:00 AM.
4. The job will execute a SQL query to find all `Registrations` linked to `Events` happening "today".
5. For each registered user, dispatch an automated email (using an API like Resend, SendGrid, or Nodemailer).

## 6. Security Considerations
- **Password Hashing:** Always hash passwords with `bcrypt` before saving to the database. Never store plaintext passwords.
- **Route Protection:** Use an Express middleware to verify the JWT signature on protected routes before executing the business logic.
- **CORS Configuration:** Configure Cross-Origin Resource Sharing (CORS) in Express to only accept requests from your frontend domain (or `localhost` during development).
- **Input Validation:** Validate all incoming data payloads (e.g., ensure date strings are valid dates, titles aren't empty) using a library like `zod` or `joi` to prevent malicious inputs.
