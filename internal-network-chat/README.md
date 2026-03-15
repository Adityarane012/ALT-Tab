# MPSTME Internal Network — Organizational Messaging Platform

A real-time collaboration platform purpose-built for technical communities. Dark-themed, high-performance, and secure with professional moderation controls.

---

## 🚀 Core Features
- **Real-time Chat**: Powered by Socket.io with typing indicators and emojis.
- **Micro-Teams Access**: Every channel is private by default. Users must "Request to Join"; Admins/Mods approve or reject in real-time.
- **Strict Role Hierarchy**: Admin > Moderator > User. Permissions apply instantly.
- **Moderation Tools**: Full command system (`/kick`, `/ban`, `/mute`, `/warn`, `/clear`).
- **Admin Panel**: Dedicated dashboard for user management, room control, and activity monitoring.
- **Presence**: Real-time "Online" sidebar showing active participants and their roles.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (Mongoose)

---

## 📦 Local Setup

1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd internal-network-chat
   npm run install:all
   ```

2. **Environment Configuration**:
   - `server/.env`:
     `PORT=5000 | MONGO_URI=... | JWT_SECRET=... | CLIENT_ORIGIN=http://localhost:3000`
   - `client/.env.local`:
     `NEXT_PUBLIC_API_URL=http://localhost:5000 | NEXT_PUBLIC_SOCKET_URL=http://localhost:5000`

3. **Run (Local)**:
   ```bash
   npm run dev
   ```
   *Access: http://localhost:3000*

4. **Seed Database** (Optional):
   `npm run seed` (Admin: `admin` / `admin123`)

---

## ☁️ Deployment (Split Strategy)

### 1. Backend (Render / Railway)
- **Repo**: `internal-network-chat/server`
- **Build**: `npm install`
- **Start**: `npm start`
- **Env**: Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` (to your frontend URL).

### 2. Frontend (Vercel)
- **Root Directory**: `internal-network-chat/client`
- **Env**: Set `NEXT_PUBLIC_API_URL` to your live Backend URL.

---

## 🛡️ Moderation Commands
- `/kick username` - Remove user from current room.
- `/ban username` - Global permanent ban.
- `/mute username` - Prevent user from sending messages.
- `/clear` - Wipe current room's history.
- `/warn username` - Issues a formal warning.

---

Built with ❤️ by **MPSTME ACM**