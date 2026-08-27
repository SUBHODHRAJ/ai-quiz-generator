# QuizMind — AI-Powered Assessment Platform

QuizMind is an enterprise-grade AI Assessment & Quiz Generator that transforms documents (PDF, DOCX, TXT, MD) into verifiable tests with automated grading, AI confidence metrics, student leaderboards, and analytics.

---

## 🏗️ Architecture

- **Frontend**: React 19, TypeScript, Vite, React Router v7, Recharts, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express 5, TypeScript, JWT Authentication, Multer, Rate Limiting
- **Database**: MongoDB Atlas (Mongoose ODM)
- **AI Engine**: Google Gemini API / Groq LLaMA-3.3

---

## 🚀 Production Deployment on Railway (No Docker)

QuizMind is designed for seamless deployment on **Railway** as two independent Node.js services from the same GitHub repository:

```
Browser
   ↓ (HTTPS)
Railway Frontend (client)
   ↓ (HTTPS API calls)
Railway Backend (server)
   ↓
MongoDB Atlas
```

---

### 1. MongoDB Atlas Configuration

1. In MongoDB Atlas, go to **Network Access** > **Add IP Address**.
2. Add `0.0.0.0/0` (Allow access from anywhere) to ensure Railway's dynamic outbound IPs can connect.
3. In **Database Access**, create a user with read/write privileges.
4. Copy the connection string format:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?appName=QuizMind
   ```

---

### 2. Backend Railway Service

1. Create a new service in your Railway project connected to your GitHub repo.
2. In **Settings** > **Service**:
   - **Root Directory**: `server`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Healthcheck Path**: `/health`
3. In **Variables**, configure:

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Auto-provided by Railway | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `MONGO_URI` | MongoDB Atlas URI | `mongodb+srv://user:pass@cluster.mongodb.net/quizmind?appName=QuizMind` |
| `JWT_SECRET` | Secret key for JWTs | Strong random 32+ character string |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `GROQ_API_KEY` | (Optional) Groq API key | `gsk_...` |
| `FRONTEND_URL` | Frontend Railway URL | `https://<your-frontend-domain>.up.railway.app` |

---

### 3. Frontend Railway Service

1. Create a second service in your Railway project connected to the same GitHub repo.
2. In **Settings** > **Service**:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. In **Variables**, configure:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend Railway API URL | `https://miniquizgenerator-production.up.railway.app/api` |

> **Important**: Vite bakes `VITE_API_URL` into the static bundle during `npm run build`. Whenever you modify `VITE_API_URL`, trigger a redeploy so the build picks up the new URL.

---

### 4. Health Check Endpoint

- **URL**: `https://<backend-domain>/health`
- **Expected Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "message": "QuizMind API is running",
    "timestamp": "2026-08-27T09:53:16.941Z"
  }
  ```

---

## 💻 Local Development

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🛠️ Build & Verification Commands

```bash
# Verify Backend Build
cd server
npm run build
npm start

# Verify Frontend Build
cd client
npm run build
npm start
```
