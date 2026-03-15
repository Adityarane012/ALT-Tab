MPSTME Internal Network — Private Organizational Messaging Platform
============================================================

Welcome to **MPSTME Internal Network**, a private, real time collaboration platform inspired by Discord and Slack, purpose built for engineering clubs and internal technical communities.

This project is optimized for **MPSTME** with a dark, developer-tool aesthetic and role-based controls for admins, moderators, and members.

Project Description
-------------------

**Internal Network** is a real-time messaging platform where users collaborate in rooms such as `#general`, `#engineering`, `#design`, and `#marketing`. The system is designed for **private organizational use**, with strict role-based permissions and a modern, professional dark-themed UI.

Core capabilities:

- **Real-time chat** with Socket.io
- **Room-based communication** with message history
- **Role-based permissions** for Admin, Moderator, and User
- **Command system** (`/kick`, `/ban`, `/clear`, `/create-room`)
- **Typing indicators** (animated) and **message reactions**
- **Strict role-hierarchy** for moderation commands and panel actions

Features
--------

- **Real-time messaging** using Socket.io
- **Room based communication** with MongoDB-backed history
- **Typing indicators** for active collaborators
- **Message reactions** (e.g. 👍 🔥 🎯)
- **Role badges** for Admin, Moderator, User
- **Real-time role updates** (permissions apply instantly without refresh)
- **Strict Role Hierarchy** (Admin > Moderator > User)
- **Graceful Error Handling** via animated UI modals
- **Admin dashboard experience** within the main interface
- **Command system** starting with `/`, including auto-complete
- **JWT-based authentication**
- **MongoDB persistence** for users, rooms, and messages

Tech Stack
----------

- **Frontend**: Next.js (React), TailwindCSS, Socket.io client, Axios
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (MongoDB Atlas), Mongoose

High-Level Architecture
-----------------------

Client (Next.js / React)
→ WebSocket (Socket.io client)
→ Node.js + Express + Socket.io
→ MongoDB (Mongoose)

- The **client** handles UI, authentication state, room navigation, message rendering, commands input, typing indicators, and reactions.
- The **backend** exposes REST APIs for auth, rooms, and messages, and a Socket.io server for real-time events and commands.
- **MongoDB** stores users, rooms, and messages with timestamps and reactions.

Command System
--------------

Commands start with `/` in the message input:

- `/kick username`
  - Roles: `admin`, `moderator`
  - Kicks user from the current room (socket leaves the room).
- `/ban username`
  - Roles: `admin`
  - Bans the user globally and disconnects active sockets.
- `/clear`
  - Roles: `admin`, `moderator`
  - Clears message history in the current room.
- `/create-room roomName`
  - Roles: `admin`, `moderator`
  - Creates a new room and broadcasts `roomCreated`.

UI / Branding
-------------

The UI is designed with:

- **Modern dark theme** using `acmDark`, gradients, and neon accents
- **Developer-tool aesthetic** with panel-style layouts and subtle borders
- **Tech conference style**: gradient glows, brand blue and teal accents
- **Minimal, professional layout**: three-column dashboard (rooms, chat, users)
- **Subtle geometric/blurred patterns** in the welcome screen background
- **Role badges** styled per role (Admin, Moderator, User)

Installation & Local Setup
--------------------------

Prerequisites:

- Node.js (>= 18 recommended)
- npm or yarn
- MongoDB Atlas connection string

### 1. Clone the repository

```bash
git clone <your-repo-url> internal-network-chat
cd internal-network-chat
```

> If this is in a monorepo, ensure you are inside `internal-network-chat/`.

### 2. Install dependencies

Install backend:

```bash
cd server
npm install
```

Install frontend:

```bash
cd ../client
npm install
```

Environment Variables
---------------------

Create `.env` files:

### Server `.env` (in `server/`)

```bash
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-secure-jwt-secret>
CLIENT_ORIGIN=http://localhost:3000
```

### Client `.env.local` (in `client/`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Running the Project Locally
---------------------------

From the `internal-network-chat` root:

1. **Install all dependencies**:

   ```bash
   npm install
   ```

   This runs `install:all` to install both `server` and `client` dependencies.

2. **Seed the database (optional but recommended)**:

   ```bash
   cd server
   npm run seed
   ```

   or from the root:

   ```bash
   npm run seed
   ```

   This will create:

   - Default rooms: `#general`, `#engineering`, `#design`, `#marketing`
   - Default admin user: `admin` / `admin123`

3. **Run the full stack with one command**:

   From the **root**:

   ```bash
   npm run dev
   ```

   This starts:

   - Express + Socket.io backend on `http://localhost:5000`
   - Next.js frontend on `http://localhost:3000`

Judges / Reviewers Workflow
---------------------------

To run the project:

1. Clone the repository.
2. Populate `.env` files as described above.
3. From `server/`: `npm install && npm run dev`.
4. From `client/`: `npm install && npm run dev`.
5. Open `http://localhost:3000` in a browser.

Deployment Instructions
-----------------------

### Backend on Render

1. Push the repository to GitHub.
2. On Render, create a **Web Service**:
   - Connect your GitHub repo.
   - Root directory: `internal-network-chat/server` (if applicable).
   - Build command: `npm install`
   - Start command: `npm start`
3. Set environment variables:
   - `PORT` (Render usually sets this automatically)
   - `MONGO_URI` (MongoDB Atlas URI)
   - `JWT_SECRET`
   - `CLIENT_ORIGIN` (e.g. your Vercel frontend URL)

### Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set project root to `internal-network-chat/client` (if not auto-detected).
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` – your Render backend URL
   - `NEXT_PUBLIC_SOCKET_URL` – your Render backend URL (Socket.io endpoint)
4. Deploy; Vercel will run `npm install`, `npm run build`, and `npm start` automatically.

### Database on MongoDB Atlas

1. Create a new **cluster** in MongoDB Atlas.
2. Create a database user and allow access from your deployment IPs.
3. Grab the connection string (e.g. `mongodb+srv://...`) and use it as `MONGO_URI` on Render.

Admin / Moderator / User Roles
------------------------------
- **Admin**
  - Create/delete rooms
  - Ban/unban users and moderators (Hierarchy: Admin > Moderator > User)
  - Change user roles
  - Bypass moderator settings
  - Access admin dashboard
- **Moderator**
  - Create rooms
  - Delete messages (`/clear`)
  - Kick users from rooms (`/kick`)
  - Ban users (Cannot ban Admins or other Moderators)
- **User**
  - Join rooms
  - Send messages
  - View message history
  - React to messages

Admin Dashboard & Panel
-----------------------

- Admins can access a dedicated **Admin Panel** at `/AdminPanel`
- Admin-only UI includes:
  - **RoomManager**: create/delete rooms, see current list.
  - **UserManager**: view users, change roles (admin/moderator/user), ban/unban users.
  - **ActivityMonitor**: see recent messages and command usage for quick moderation.
- Non-admin users attempting to access `/AdminPanel` are redirected back to the main `Dashboard`.

Database Seeding
----------------

- To create demo content and an initial admin:

  ```bash
  cd server
  npm run seed
  ```

  or from the root:

  ```bash
  npm run seed
  ```

- This will create:
  - **Admin user**: `username: admin`, `password: admin123`, `role: admin`
  - **Rooms**:
    - `#general`
    - `#engineering`
    - `#design`
    - `#marketing`

Example Credentials
-------------------

After running the seed script, you can log in with:

- **Username**: `admin`
- **Password**: `admin123`