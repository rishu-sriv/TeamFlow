# Deploying TeamFlow to Railway

## 1. Prerequisites
- Railway account at railway.app
- GitHub repo with TeamFlow code pushed

## 2. Create Railway Project
1. Go to railway.app → New Project
2. Select "Deploy from GitHub repo"
3. Select your teamflow repository

## 3. Add PostgreSQL
1. In your Railway project → New Service → Database → PostgreSQL
2. Copy the DATABASE_URL from the Variables tab

## 4. Backend Service
Railway auto-detects the server/ folder. Set these environment variables:
```
DATABASE_URL = (from PostgreSQL service — Railway auto-links this)
JWT_SECRET = (generate: openssl rand -base64 64)
GEMINI_API_KEY = (your Gemini API key from Google AI Studio)
CLIENT_URL = (your frontend Railway URL — set after deploying frontend)
NODE_ENV = production
PORT = 8080
```
Start command: `npm run migrate && npm run seed && npm start`

## 5. Frontend Service
Add second service from same repo, set root to client/.
Environment variables:
```
VITE_API_URL = (your backend Railway URL)
```
Build command: `npm run build`
Start command: `npx serve -s dist -p $PORT`

## 6. Update CLIENT_URL
Once frontend is deployed, copy its URL and update the backend's CLIENT_URL variable.

## 7. Verify
- Visit frontend URL → login with admin@teamflow.com / Admin@123
- Check backend health: YOUR_BACKEND_URL/api/v1/health
