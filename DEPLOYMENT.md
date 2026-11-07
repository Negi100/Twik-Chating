# Deploying TWIK CHAT

**Architecture**

| Part | Tech | Where it goes (free tier) |
|---|---|---|
| Database | MongoDB | **MongoDB Atlas** (you already have a cluster) |
| Backend | Spring Boot 4 + WebSocket (STOMP/SockJS), Java 21 | **Render** (Docker web service) |
| Frontend | React + Vite + Tailwind | **Vercel** |

You'll deploy in this order: **Database → Backend → Frontend → connect them together.**

---

## What was changed in the code (and why)

| # | Change | Why it was needed |
|---|---|---|
| 1 | **Removed `Backend/.env`** and added `.env` to `.gitignore`, with `.env.example` templates in its place | The file held your real MongoDB password. Anything pushed to GitHub is public. |
| 2 | Backend CORS/WebSocket origins now come from the `CORS_ALLOWED_ORIGINS` env var (new `CorsConfig.java`, `WebSocketConfig.java`). Deleted `AppConstants.java` | `http://localhost:5173` was hard-coded, so the live frontend would have been blocked by CORS. |
| 3 | Frontend API URL now comes from `VITE_API_BASE_URL` (`AxiosHelper.js`) | `http://localhost:8080` was hard-coded, so the deployed site would try to reach your own laptop. |
| 4 | New **multi-stage `Dockerfile`** (Maven build → `eclipse-temurin:21-jre-alpine`) | The old image `openjdk:21-jdk-slim` is deprecated and removed from Docker Hub. The old Dockerfile also needed a pre-built jar on your machine, which doesn't exist on Render. |
| 5 | Message timestamps now use `Instant` instead of `LocalDateTime` | Render servers run in UTC. With `LocalDateTime`, India users would see "5 hours ago" on brand-new messages. `Instant` is timezone-safe. Old messages still load. |
| 6 | Added `vercel.json` and `public/_redirects` | Refreshing `/chat` on a static host would otherwise show a 404. |
| 7 | Added a `/health` endpoint plus `render.yaml` | Render uses it to check the app is up. It's also a quick test URL. |
| 8 | `ChatPage.jsx`: the WebSocket only connects when you're in a room, closes when you leave, and shows an error if the connection drops | The old version leaked connections and could connect with an empty room ID. |
| 9 | `ChatController` uses the room ID from the URL; `RoomController` trims and validates the room ID | Small correctness fixes. |
| 10 | Removed `target/`, `.idea/`, `HELP.md`, unused imports and debug `console.log`s | Build output and IDE files don't belong in the repo. |

---

## Step 0: Secure your database (do this first)

Your old MongoDB password was stored in plain text in the project, so treat it as leaked.

1. Go to <https://cloud.mongodb.com> and open your project.
2. **Security → Database Access**, find `chatappuser`, click **Edit → Edit Password**, and set a new strong password. Save it somewhere safe.
3. **Security → Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)**.
   Render's free tier has no fixed IP, so Atlas has to accept connections from any IP. The password is what protects the database.
4. **Database → Connect → Drivers** and copy the connection string. It looks like:
   ```
   mongodb+srv://chatappuser:<NEW_PASSWORD>@chatbox.cqovkgf.mongodb.net/?appName=ChatBox
   ```
   Replace `<NEW_PASSWORD>` with your new password. If the password has special characters like `@ : / ? #`, URL-encode them (for example, `@` becomes `%40`).

> **About the database name:** your original URI has no database name after `.net/`, so Spring has been saving rooms in a database called `test`. Use the URI exactly as shown above to keep your existing chats. If you want a clean, properly named database, use `...mongodb.net/chatapp?appName=ChatBox` instead (it starts empty).

---

## Step 1: Push the project to GitHub

1. Create a new **empty** repository on GitHub, for example `twik-chat`. Don't add a README.
2. In a terminal, inside the `chat-app-backend` folder (the one containing `Backend/`, `Frontend/` and this file):
   ```bash
   git init
   git add .
   git commit -m "Prepare for deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/twik-chat.git
   git push -u origin main
   ```
3. Check on GitHub that **no `.env` file** was uploaded. Only `.env.example` files should be there.

> If you previously pushed this project with the old `.env` to any GitHub repo, the old password is in that repo's history. Step 0 (changing the password) is what fixes that.

---

## Step 2: Deploy the backend on Render

1. Sign up at <https://render.com> with your GitHub account.
2. Click **New + → Web Service → Build and deploy from a Git repository**, then pick your `twik-chat` repo.
3. Fill in the settings:

   | Setting | Value |
   |---|---|
   | Name | `chat-app-backend` (this becomes part of the URL) |
   | Region | **Singapore** (closest to India) |
   | Branch | `main` |
   | **Root Directory** | `Backend` |
   | **Runtime / Language** | **Docker** |
   | Dockerfile Path | `./Dockerfile` |
   | Instance Type | **Free** |

4. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your full connection string from Step 0 |
   | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` for now. You'll change this in Step 4. |

5. Under **Advanced**, set **Health Check Path** to `/health`.
6. Click **Create Web Service**. The first build takes about 5–10 minutes because Maven downloads everything.
7. When the log shows `Started ChatAppBackendApplication`, copy your URL from the top of the page, e.g.
   `https://chat-app-backend-xxxx.onrender.com`
8. **Test it:** open `https://chat-app-backend-xxxx.onrender.com/health` in your browser. You should see:
   ```json
   {"status":"UP"}
   ```

> *Shortcut:* instead of steps 2–5, you can use **New + → Blueprint**, pick the repo, and Render reads `render.yaml`. It will then ask you for the two environment variables.

---

## Step 3: Deploy the frontend on Vercel

1. Sign up at <https://vercel.com> with GitHub.
2. Click **Add New… → Project**, then **Import** your `twik-chat` repo.
3. Configure it:

   | Setting | Value |
   |---|---|
   | Framework Preset | **Vite** (auto-detected) |
   | **Root Directory** | click **Edit** and choose `Frontend` |
   | Build Command | `npm run build` (default) |
   | Output Directory | `dist` (default) |

4. Open **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://chat-app-backend-xxxx.onrender.com` (your Render URL, **no trailing slash**) |

5. Click **Deploy**. It takes about a minute. Copy your site URL, e.g. `https://twik-chat.vercel.app`.

> `VITE_` variables are baked in **at build time**. If you ever change `VITE_API_BASE_URL`, you must **redeploy** the frontend: Deployments → ⋯ → Redeploy.

---

## Step 4: Connect the backend to the frontend (CORS)

1. In Render, open your service, then **Environment**.
2. Edit `CORS_ALLOWED_ORIGINS` and set it to your Vercel URL:
   ```
   https://twik-chat.vercel.app
   ```
   To allow several origins, separate them with commas and no spaces:
   ```
   https://twik-chat.vercel.app,http://localhost:5173
   ```
   Wildcards work too, e.g. `https://*.vercel.app` to also allow Vercel preview URLs.
3. Click **Save Changes**. Render restarts the service automatically, which takes about a minute.

---

## Step 5: Test the live app

1. Open your Vercel URL.
2. Enter a name and a room ID, then click **New Room ✨**. You should see "Room created Successfully", then a "Connected" toast.
3. Open the same URL in another browser or on your phone, use a different name and the **same room ID**, and click **Enter Room 🚀**.
4. Send messages from both. They should appear instantly on both screens with a "Just now" timestamp.
5. Refresh the page while on `/chat`. It should send you back to the join screen, not a 404.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| First request takes 30–60 s or "Error in joining room" right after opening | Render's free tier **sleeps after ~15 min of no traffic**. The first request wakes it up. Wait and retry. Upgrade the plan or use an uptime pinger on `/health` to avoid this. |
| Browser console: `blocked by CORS policy` | `CORS_ALLOWED_ORIGINS` on Render doesn't exactly match your Vercel URL. It must start with `https://` and have no trailing `/`. |
| Requests go to `localhost:8080` in production | `VITE_API_BASE_URL` wasn't set on Vercel, or you didn't redeploy after setting it. |
| Render log: `MongoTimeoutException` / `Timed out after 30000 ms` | Atlas Network Access doesn't include `0.0.0.0/0`, or the cluster is paused. |
| Render log: `Authentication failed` | Wrong password in `MONGODB_URI`, or special characters aren't URL-encoded. |
| Render log: `Could not resolve placeholder 'MONGODB_URI'` | The env var is missing or misspelled on Render. |
| Build fails with out-of-memory | Rare on the free tier. Retry the deploy; if it keeps happening, move up one instance size. |
| Messages show "5 hours ago" | Those are old messages saved before this fix. New messages are correct. |

---

## Running locally (after these changes)

**Backend**
```bash
cd Backend
cp .env.example .env        # then put your real MONGODB_URI in .env
# Option A: Docker
docker compose up --build
# Option B: Maven (export the variables first)
export $(grep -v '^#' .env | xargs) && ./mvnw spring-boot:run
```

**Frontend**
```bash
cd Frontend
cp .env.example .env.local   # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev                  # http://localhost:5173
```

---

## Updating the app later

Just `git push` to `main`. Render and Vercel both redeploy automatically.
