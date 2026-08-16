# CampusConnect Technical Design

## 1. Project Overview
CampusConnect is a lightweight, frontend-only web application designed to serve as an event portal for college campuses. It allows students to browse upcoming events and register for them, while providing an interface to post new events using an interactive calendar.

The project was built to simplify event discovery by providing a unified calendar view where events are categorized (Workshops, Seminars, Social Gatherings) and accessible in a single place.

## 2. Problem Statement
On college campuses, discovering events often requires checking multiple notice boards, group chats, or emails. CampusConnect centralizes this by providing an interactive calendar interface, improving visibility and making it easier for students to register and remember events.

## 3. Users and Core Workflows
Currently, the application does not have a formal authentication system, so all users have access to all features. However, conceptually, it serves two roles:

### 3.1 Students / Participants
- Browse the home page for event categories.
- View the interactive event calendar.
- Click on an event to initiate registration.
- Experience seamless registration with auto-filled event details.
- Receive browser notifications on the day of the event.

### 3.2 Organizers
- Add new events to the calendar via a modal form (specifying name, date, and type).

## 4. System Architecture
### 4.1 High-level Architecture
The application follows a **Client-Side Rendered (CSR)** architecture without a backend server. 
- **Frontend Core:** HTML5, CSS3, Vanilla JavaScript.
- **Styling:** Tailwind CSS (utility-first CSS framework).
- **State Management & Persistence:** Browser `localStorage` (No external database).

### 4.2 Project Structure
The repository is structured to separate concerns (HTML, JS, CSS, Assets):
```text
CampusConnect/
├── index.html             # Landing page
├── package.json           # npm dependencies (for Tailwind)
├── tailwind.config.js     # Tailwind configuration
├── public/                # Additional HTML pages
│   ├── calendar.html      # Interactive calendar view
│   ├── register.html      # Registration form
│   └── confirmation.html  # Registration success page
├── scripts/               # JavaScript modules
│   ├── calendar.js        # Core calendar logic and event management
│   ├── register.js        # Registration form handling
│   └── confirmation.js    # Confirmation display logic
├── styles/                # CSS styling
│   ├── input.css          # Tailwind directives
│   └── output.css         # Compiled CSS
└── assets/                # Images and icons
```

## 5. State Management & Data Flow
Because there is no backend API, `localStorage` is used as a lightweight key-value store to share state across different HTML pages and sessions.

### 5.1 Event Registration Flow
The application implements a multi-page registration flow while preserving context:
1. **Selection (`calendar.js`):** When a user clicks an event on the calendar, the `selectedEvent` (title) and `selectedDate` are written to `localStorage`. The user is then redirected to `register.html`.
2. **Form Pre-fill (`register.js`):** Upon loading `register.html`, the script reads `selectedEvent` from `localStorage` and automatically populates the "Event Name" input field, enhancing UX.
3. **Submission (`register.js`):** Form submission is intercepted via `event.preventDefault()`. In this frontend-only mockup, data isn't sent to a server; instead, the user is redirected to `confirmation.html`.
4. **Confirmation (`confirmation.js`):** Reads `selectedEvent` and `selectedDate` from `localStorage` to display a personalized success message. It then removes these keys from `localStorage` to clean up the state.

### 5.2 Event Creation Flow
1. **Modal Trigger (`calendar.js`):** Clicking "Add Event" opens a modal.
2. **Save (`calendar.js`):** Submitting the form pushes the new event into an in-memory `events` array. The updated array is serialized using `JSON.stringify()` and stored in `localStorage` under the key `events`.
3. **Render (`calendar.js`):** The calendar grid and category lists are dynamically re-rendered to reflect the new event.

> **Note on Current Logic:** Currently, when an event is created, it is also added to the `registeredEvents` array in `localStorage`. This conflates event *creation* with event *registration*, which means the person creating the event automatically gets notifications for it.

## 6. Key Features and Logic
### 6.1 Dynamic Calendar Generation
- The calendar is entirely generated on the client side using JavaScript's `Date` object.
- `generateCalendar(month, year)` calculates the first day of the month and the total number of days.
- It iterates to create a 6-row by 7-column HTML table grid.
- As it populates the days, it checks if any event in the `events` array matches the current date.
- Events are **color-coded** based on their `type` using a switch statement:
  - `workshop`: Blue (`#5ac2fc`)
  - `social`: Teal (`#0affe2`)
  - `seminar`: Pink (`#fbcaef`)

### 6.2 Browser Notifications (Reminders)
- The application requests the HTML5 Web Notification API permission on load.
- `checkReminders()` evaluates `registeredEvents` from `localStorage`.
- If an event's date matches the current system date, a browser notification is triggered.
- Once notified, the event is filtered out of `registeredEvents` to prevent duplicate notifications.
- This check runs immediately on page load and on a 1-hour interval using `setInterval`.

## 7. Security & Limitations
As a client-side prototype, the application has deliberate constraints:
- **No Authentication:** There is no distinction between a standard user and an administrator. Anyone can add events.
- **Volatile Storage:** Data (events) is tied to the specific browser and device (via `localStorage`). Clearing the browser cache will delete all newly added events.
- **No Global State:** A user on Device A cannot see an event added by a user on Device B, as there is no central server sharing the database.
- **Data Capture:** The registration form currently acts as a UX mockup. It does not actually collect or save the attendee's name or email to a database.

## 8. Proposed Improvements
To transition this project from a frontend prototype to a production-ready full-stack application, the following steps are recommended:

1. **Backend Integration:** 
   - Introduce a Node.js/Express or Python/Django backend.
   - Replace `localStorage` with a robust database (e.g., MongoDB, PostgreSQL) so events are visible to all users globally.
2. **Authentication & Authorization:** 
   - Implement user accounts (e.g., JWT-based auth).
   - Create Role-Based Access Control (RBAC) so that only verified Organizers/Admins can post events, while standard users can only register.
3. **Database Schema Design:**
   - Create tables/collections for `Users`, `Events`, and `Registrations` (a join table mapping Users to Events).
4. **Form Handling Validation:** 
   - Ensure the registration form POSTs data to a backend endpoint to officially log the attendee's RSVP.
5. **Robust Notifications:**
   - Move from client-side polling (`setInterval`) to server-side scheduled jobs (e.g., cron jobs, Celery, or Node-cron) that send reminder emails or SMS to registered users.
