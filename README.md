# FinAura

FinAura is an educational personal-finance learning platform with financial assessments, goals, a virtual investment sandbox, mentoring, and a Groq-powered assistant. It does not provide investment advice or execute real trades.

## Development

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`, `JWT_SECRET`, and `GROQ_API_KEY`.
2. Run `npm install` from the repository root.
3. Run `npm run dev`.

The client runs at `http://localhost:5173` and the API at `http://localhost:5001`.

## Production

1. Set `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL`, and `CLIENT_URL` in the deployment environment.
2. Run `npm install` and `npm run build`.
3. Run `npm start`.

In production, Express serves `client/dist`, including client-side routes such as `/dashboard` and `/assistant`. Use `GET /health` for deployment checks.

Keep all secrets out of source control. Set `CLIENT_URL` to the exact deployed frontend URL (or a comma-separated list of allowed URLs when using a separate frontend deployment).
