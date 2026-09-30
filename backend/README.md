# Notes Nest — Backend

Minimal Express + MongoDB backend for Notes Nest. This README explains how to run locally and deploy.

Environment variables (create a `.env` file based on `.env.example`):

- `MONGO_URI` — MongoDB connection string
- `ADMIN_PASSWORD` — Admin password for simple login flow (use a secure secret)
- `JWT_SECRET` — Secret used to sign admin JWTs
- `PORT` — Optional, default `5000`
- `FRONTEND_URLS` or `FRONTEND_URL` — Comma-separated allowed frontend origins for CORS (e.g. `https://notesnest09.netlify.app`)

Quick local run

1. Copy `.env.example` to `.env` and fill values:

```powershell
copy .env.example .env
# then edit .env and fill real secrets
```

2. Install dependencies and start the server:

```powershell
npm install
npm start
```

Admin login (returns JWT)

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/notes/admin/login -ContentType 'application/json' -Body (@{ password = 'your_admin_password' } | ConvertTo-Json)
```

Protect admin endpoints by sending the token as an `Authorization: Bearer <token>` header.

Endpoints summary

- `POST /api/notes/upload` — submit a document via JSON body containing `title`, `subject`, `contributor`, `driveLink`, and `category` (file uploads removed)
- `POST /api/notes/admin/login` — admin login to get JWT
- `GET /api/notes/approved` — public list of approved documents
- `GET /api/notes/pending` — admin only
- `PATCH /api/notes/approve/:id` — admin only
- `DELETE /api/notes/delete/:id` — admin only

Important notes about `.env` and deployment

- Keep the real `.env` out of source control. Use `.env.example` as a template and commit that instead.
- If you have already committed `.env` with real secrets, rotate those credentials immediately (DB password, JWT secret).
- In production, set environment variables using your host's secret management (Render, Heroku config vars, Azure App Settings, GitHub Actions secrets, etc.). Do not store secrets in the repository.

**Configuring CORS for your deployed frontend**

- Set `FRONTEND_URLS` (comma-separated) in your production environment to include your deployed frontend origin(s), e.g.:

```
FRONTEND_URLS=https://notesnest09.netlify.app
```

- The server will whitelist only the origins listed in `FRONTEND_URLS`. If you see CORS errors in the browser showing the server allowed origin as `http://localhost:3000`, update the production environment to include your frontend domain and redeploy.

Quick emergency option (not recommended long-term): set `ALLOW_ALL_CORS=true` in your environment to allow any origin. Use this only temporarily while diagnosing problems — it relaxes security and should be removed once the real origins are configured.

Production checklist (minimal)

- Do not commit `.env`.
- Use strong `JWT_SECRET` and a secure `ADMIN_PASSWORD`.
- Run the app with a process manager (pm2) or containerize with Docker for reliability.
- Configure backups for MongoDB and monitor usage.

# notes-nest-backend


[for frontend](https://github.com/akhilreddy59/NotesNest)
