<div align="center">

# 💬 TWIK CHAT

### Real-time room-based chat. Pick a name, pick a room, start talking.

<a href="https://twik-chating.vercel.app/">
  <img src="https://img.shields.io/badge/🚀_LIVE_DEMO-twik--chating.vercel.app-22d3ee?style=for-the-badge&labelColor=0a0a0a" alt="Live Demo"/>
</a>

<br/><br/>

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP_+_SockJS-010101?style=flat-square&logo=socketdotio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=black)

<br/>

[**✨ Features**](#-features) •
[**🏗️ Architecture**](#️-architecture) •
[**⚡ Quick Start**](#-quick-start) •
[**🔌 API**](#-api-reference) •
[**🚀 Deploy**](#-deployment)

</div>

<!--
  📸 Add a screenshot here:
  1. Take a screenshot of the chat page
  2. Save it as docs/screenshot.png in this repo
  3. Replace this comment with:
     <div align="center"><img src="docs/screenshot.png" width="800" alt="TWIK CHAT screenshot"/></div>
-->

---

## 🎯 Try it in 30 seconds

> 1. Open **[twik-chating.vercel.app](https://twik-chating.vercel.app/)**
> 2. Type a name and a room ID, then click **New Room ✨**
> 3. Open the same link on your phone or in another browser, enter **the same room ID**, and click **Enter Room 🚀**
> 4. Chat. Messages appear on both screens instantly ⚡

> [!NOTE]
> The backend runs on Render's free tier, which sleeps after ~15 minutes of inactivity.
> If the first request fails, **wait 30–60 seconds** and try again while the server wakes up ☕

---

## ✨ Features

| | Feature | Details |
|:-:|---|---|
| ⚡ | **Real-time messaging** | WebSocket over STOMP + SockJS. No refresh, no polling. |
| 🏠 | **Chat rooms** | Create a room with any ID, share it, and others join instantly |
| 💾 | **Persistent history** | Messages are stored in MongoDB and load when you join |
| 🕒 | **Relative timestamps** | "Just now", "5 minutes ago"… correct in every timezone |
| 🎨 | **Dark neon UI** | Built with Tailwind CSS 4. Your messages on the right, others on the left |
| 🔔 | **Toasts** | Instant feedback for joins, errors and connection status |
| 🐳 | **Dockerized backend** | Multi-stage build, runs anywhere |
| 🔐 | **Env-based config** | No secrets in code. CORS and DB set via environment variables |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    U1["👤 User A<br/>(Browser)"]
    U2["👤 User B<br/>(Phone)"]

    subgraph Vercel["▲ Vercel"]
        FE["⚛️ React + Vite<br/>Frontend"]
    end

    subgraph Render["☁️ Render (Docker)"]
        API["🌐 REST API<br/>/api/rooms"]
        WS["🔌 WebSocket<br/>/chat (STOMP)"]
        BR["📡 Message Broker<br/>/topic/room/{id}"]
    end

    DB[("🍃 MongoDB Atlas")]

    U1 & U2 --> FE
    FE -- "HTTP: create / join / history" --> API
    FE <-- "WebSocket: send / receive" --> WS
    WS --> BR
    API --> DB
    WS --> DB
```

<details>
<summary><b>📨 How a message travels (click to expand)</b></summary>
<br/>

```mermaid
sequenceDiagram
    participant A as 👤 User A
    participant S as ☁️ Spring Boot
    participant M as 🍃 MongoDB
    participant B as 👤 User B

    A->>S: SUBSCRIBE /topic/room/abc
    B->>S: SUBSCRIBE /topic/room/abc
    A->>S: SEND /app/sendMessage/abc  { sender, content }
    S->>M: Save message to room "abc"
    S-->>A: Broadcast message
    S-->>B: Broadcast message
    Note over A,B: Both screens update instantly ⚡
```

</details>

---

## 🧰 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### 🎨 Frontend
- **React 19** with React Router 7
- **Vite** for dev server and builds
- **Tailwind CSS 4** for styling
- **Axios** for REST calls
- **@stomp/stompjs + SockJS** for WebSocket
- **react-hot-toast** and **react-icons**

</td>
<td valign="top" width="50%">

### ⚙️ Backend
- **Spring Boot 4** (Java 21)
- **Spring WebSocket** with a STOMP message broker
- **Spring Data MongoDB**
- **Lombok**
- **Docker** (multi-stage, JRE Alpine)

</td>
</tr>
</table>

---

## 📁 Project Structure

<details>
<summary><b>📂 Click to view the folder tree</b></summary>

```
.
├── Backend/                         # Spring Boot API + WebSocket server
│   ├── src/main/java/com/chat/chat_app_backend/
│   │   ├── config/
│   │   │   ├── WebSocketConfig.java # STOMP endpoint + broker
│   │   │   └── CorsConfig.java      # CORS from env variable
│   │   ├── controllers/
│   │   │   ├── RoomController.java  # REST: create/join/messages
│   │   │   ├── ChatController.java  # WebSocket: send message
│   │   │   └── HealthController.java# GET /health
│   │   ├── entities/                # Room, Message (MongoDB docs)
│   │   ├── PayLoad/                 # MessageRequest DTO
│   │   └── repo/                    # RoomRepository
│   ├── src/main/resources/application.properties
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
│
├── Frontend/                        # React + Vite client
│   ├── src/
│   │   ├── components/              # JoinCreateChat, ChatPage
│   │   ├── config/                  # Axios client, routes, helpers
│   │   ├── context/                 # ChatContext (room, user, status)
│   │   └── services/                # RoomService (API calls)
│   ├── vercel.json                  # SPA routing
│   └── .env.example
│
├── render.yaml                      # Render blueprint
└── DEPLOYMENT.md                    # Full deployment guide
```

</details>

---

## ⚡ Quick Start

### Prerequisites

![Java](https://img.shields.io/badge/Java-21+-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_or_local-47A248?style=flat-square&logo=mongodb&logoColor=white)

```bash
git clone https://github.com/Negi100/Twik-Chating.git
cd Twik-Chating
```

<details>
<summary><b>⚙️ 1. Run the backend</b></summary>
<br/>

```bash
cd Backend
cp .env.example .env
# edit .env and set your MONGODB_URI
```

**Option A: Docker** 🐳
```bash
docker compose up --build
```

**Option B: Maven**
```bash
# macOS / Linux
export $(grep -v '^#' .env | xargs) && ./mvnw spring-boot:run

# Windows (PowerShell)
Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ } | ForEach-Object { $k,$v = $_ -split '=',2; Set-Item "env:$k" $v }
.\mvnw spring-boot:run
```

✅ Check: open <http://localhost:8080/health> and you should see `{"status":"UP"}`

</details>

<details>
<summary><b>🎨 2. Run the frontend</b></summary>
<br/>

```bash
cd Frontend
cp .env.example .env.local     # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

✅ Open <http://localhost:5173>

</details>

---

## 🔐 Environment Variables

| Where | Variable | Example | Purpose |
|---|---|---|---|
| ⚙️ Backend | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/chatapp` | MongoDB connection string |
| ⚙️ Backend | `CORS_ALLOWED_ORIGINS` | `https://twik-chating.vercel.app` | Allowed frontend URL(s), comma-separated |
| ⚙️ Backend | `PORT` | `8080` | Set automatically by Render |
| 🎨 Frontend | `VITE_API_BASE_URL` | `https://twik-chating.onrender.com` | Backend URL (no trailing `/`) |

> [!WARNING]
> Never commit `.env` files. They're already in `.gitignore`. Use `.env.example` as the template.

---

## 🔌 API Reference

### REST

| Method | Endpoint | Body | Response |
|:-:|---|---|---|
| ![POST](https://img.shields.io/badge/POST-49cc90?style=flat-square) | `/api/rooms` | room ID (plain text) | `201` room · `400` if it already exists |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square) | `/api/rooms/{roomId}` | none | `200` room · `400` if not found |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square) | `/api/rooms/{roomId}/messages?page=0&size=50` | none | `200` list of messages |
| ![GET](https://img.shields.io/badge/GET-61affe?style=flat-square) | `/health` | none | `{"status":"UP"}` |

### WebSocket (STOMP over SockJS)

| Type | Destination | Payload |
|---|---|---|
| 🔗 Connect | `/chat` | none |
| 📤 Send | `/app/sendMessage/{roomId}` | `{ "sender": "sonu", "content": "hi", "roomId": "123" }` |
| 📥 Subscribe | `/topic/room/{roomId}` | `{ "sender", "content", "timeStamp" }` |

<details>
<summary><b>🧪 Try the API with curl</b></summary>
<br/>

```bash
# Create a room
curl -X POST https://twik-chating.onrender.com/api/rooms \
     -H "Content-Type: text/plain" -d "my-room"

# Get the room
curl https://twik-chating.onrender.com/api/rooms/my-room

# Get the last 20 messages
curl "https://twik-chating.onrender.com/api/rooms/my-room/messages?size=20"
```

</details>

---

## 🚀 Deployment

| Layer | Platform | Notes |
|---|---|---|
| 🎨 Frontend | [![Vercel](https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel)](https://vercel.com) | Root dir `Frontend`, set `VITE_API_BASE_URL` |
| ⚙️ Backend | [![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)](https://render.com) | Docker, root dir `Backend`, set `MONGODB_URI` and `CORS_ALLOWED_ORIGINS` |
| 🍃 Database | [![MongoDB Atlas](https://img.shields.io/badge/Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://cloud.mongodb.com) | Free M0 cluster, allow `0.0.0.0/0` |

📖 The full step-by-step guide is in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## 🗺️ Roadmap

- [x] Create and join rooms
- [x] Real-time messaging
- [x] Message history
- [x] Docker and cloud deployment
- [ ] 📎 File and image sharing
- [ ] ⌨️ "User is typing…" indicator
- [ ] 👥 Online users list
- [ ] 🔒 Password-protected rooms
- [ ] 🌗 Light/dark theme toggle

---

## 🤝 Contributing

1. 🍴 Fork the repo
2. 🌿 Create a branch: `git checkout -b feature/amazing-feature`
3. 💾 Commit: `git commit -m "Add amazing feature"`
4. 📤 Push: `git push origin feature/amazing-feature`
5. 🔃 Open a Pull Request

---

<div align="center">

### 👨‍💻 Author

**Prashant Negi**

[![GitHub](https://img.shields.io/badge/GitHub-Negi100-181717?style=for-the-badge&logo=github)](https://github.com/Negi100)

<br/>

⭐ **If you like this project, give it a star!** ⭐

<sub>Built with ☕, ⚛️ and 🍃</sub>

</div>
