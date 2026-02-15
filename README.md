# TruthLens AI

AI-powered scam & fake message analyzer. Paste a message and get a risk score (0–100%), reasoning, and recommended actions.

- **Stack:** Next.js 16, React 19, Tailwind CSS, Groq (Llama)
- **Deploy:** Optimized for [Vercel](https://vercel.com) (single app: frontend + API route).

---

## 1. Create a new GitHub repo (from this folder)

Your GitHub username: [MDS2025-dev](https://github.com/MDS2025-dev)

**Option A – GitHub CLI (if installed)**

```bash
cd c:\Hackathon\truthlens-ai
git init
git add .
git commit -m "Initial commit: TruthLens AI"
gh repo create truthlens-ai --private --source=. --remote=origin --push
```

**Option B – GitHub website**

1. Go to [github.com/new](https://github.com/new).
2. Repository name: `truthlens-ai` (or any name you like).
3. Choose **Private** or **Public**.
4. Do **not** add a README, .gitignore, or license (this repo already has them).
5. Create repository.
6. In your project folder:

```bash
cd c:\Hackathon\truthlens-ai
git init
git add .
git commit -m "Initial commit: TruthLens AI"
git remote add origin https://github.com/MDS2025-dev/truthlens-ai.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use your GitHub account).
2. **Add New** → **Project** → **Import** the repo `MDS2025-dev/truthlens-ai`.
3. **Leave Root Directory as `.`** (the Next.js app is at the repo root — no need to select a subfolder).
4. **Environment Variables** → add:
   - **Name:** `GROQ_API_KEY`  
   - **Value:** your [Groq API key](https://console.groq.com/)  
   (Do **not** add `NEXT_PUBLIC_API_URL`; the app uses the built-in `/api/analyze` route.)
5. Click **Deploy**. The app will be live at `https://your-project.vercel.app`.

After deploy, analysis runs on Vercel serverless functions; no separate backend server is required.

---

## 3. Run locally (Vercel-style: single app)

```bash
cd c:\Hackathon\truthlens-ai
copy .env.example .env.local
# Edit .env.local and set GROQ_API_KEY=your_key
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Analyze uses `/api/analyze` (no separate backend).

---

## 4. Run locally with separate backend (optional)

If you want to run the Express backend on port 5000:

```bash
# Terminal 1 – backend
cd backend
npm install
echo "GROQ_API_KEY=your_key" > .env
node server.js

# Terminal 2 – from repo root
cd c:\Hackathon\truthlens-ai
echo NEXT_PUBLIC_API_URL=http://localhost:5000 >> .env.local
pnpm install
pnpm dev
```

---

## Security notes for deployment

- **Never** commit `.env` or `.env.local` (they are in `.gitignore`).
- Set `GROQ_API_KEY` only in Vercel **Environment Variables** (or in `.env.local` locally).
- The app does not expose the API key to the browser; the key is used only in the Next.js API route (server-side).

---

## Repo structure

```
truthlens-ai/
├── app/               ← Next.js App Router (Vercel builds from repo root)
│   ├── api/analyze/route.ts   ← Serverless analyze API
│   ├── page.tsx
│   └── ...
├── components/
├── package.json
├── .env.example
├── backend/           ← Optional; for local Express server
│   └── server.js
├── .gitignore
└── README.md
```
