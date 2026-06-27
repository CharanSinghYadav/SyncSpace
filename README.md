# SyncSpace PRO 🚀

SyncSpace PRO is an enterprise-grade, real-time collaborative developer workspace. It empowers remote teams to write code, execute it live, map out system architectures, and chat asynchronously within isolated workspaces.

🔗 **Live Application**
* **Frontend (App UI):** https://sync-space-orcin-one.vercel.app
* **Backend (API Server):** https://syncspace-1fjm.onrender.com

---

### 🛠 Tech Stack

**Frontend**
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS
* **Code Engine:** Monaco Editor
* **Canvas Engine:** Excalidraw
* **Real-time Client:** Socket.io-client

**Backend**
* **Runtime:** Node.js & Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **In-Memory Cache:** Redis (Upstash)
* **Real-time Engine:** Socket.io
* **Code Execution:** JDoodle Compiler API

---

### 🚀 Key Features

* **Live Remote Execution:** Integrated JDoodle API to compile and execute JS, Python, C++, and Java directly in the browser with real-time output broadcasting.
* **Zero-Lag Collaboration:** Engineered full-duplex WebSockets architecture for instant keystroke synchronization and live online/offline presence telemetry.
* **Asynchronous Persistence:** Configured MongoDB alongside Redis caching. If a user joins a room hours later, the database intelligently hydrates their screen with the past chat history and code state.
* **Zen Mode UI:** A responsive, VS Code-like Monaco Editor experience featuring a collapsible chat sidebar and silent "Unread Cyber-Ping" alerts for optimal screen real estate.
* **Integrated Whiteboard:** Instant toggle to an Excalidraw canvas for system design, flowcharting, and architecture mapping.

---

### 🏗 System Design & Security

* **Write-Load Optimization:** Implemented debouncing and Redis caching to reduce database write-overhead by nearly 90%, preventing database bottlenecks during high-frequency keystrokes.
* **Automated Garbage Collection:** Utilized MongoDB TTL (Time-To-Live) indexes to automatically purge inactive workspace sessions and chat histories after 7 days to optimize cloud storage.
* **Smart Database Hydration:** Engineered a precise Socket emitter that prevents duplicate document creation and selectively broadcasts past messages *only* to the newly joined client upon connection.
* **Dynamic Environment Routing:** Smart frontend routing that auto-detects the environment (`localhost` vs. Production) and securely routes WebSocket connections and API endpoints without manual intervention.

---

### 📂 Project Structure

```text
/Backend
  ├── config/           # Redis & MongoDB Connection Logic
  ├── models/           # Mongoose Data Schemas (Room, Session)
  ├── socket/           # WebSocket Event Handlers & Persistence Logic
  ├── routes/           # REST API Endpoints (Code Execution Proxy)
  └── server.js         # Entry Point & Express/Socket Server Initialization

/Frontend
  ├── assets/           # UI Resources & Branding
  ├── components/       # Reusable UI (CodeEditor, Header)
  ├── pages/            # View Layer (HomePage, RoomPage)
  ├── socket.js         # Dynamic Socket Client Initialization
  └── App.jsx           # Main Router Configuration
```

🛡️ Telemetry & Performance
Cluster Dashboard: Built-in hidden admin modal to track real-time cluster health, total code execution runs, memory usage, and server uptime.

State Synchronization: Ensures the UI strictly reflects the server state, actively pushing offline UI fallbacks if the WebSocket connection drops.

👨‍💻 Developed By:
Charan Singh Yadav
Full Stack Developer | Software Engineer
