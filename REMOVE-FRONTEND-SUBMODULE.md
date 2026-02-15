# Fix: Frontend folder not opening on GitHub (submodule)

## What’s going on

The **frontend** folder came from another repo (e.g. shaikdanish33’s). When it was added to **truthlens-ai**, Git treated it as a **submodule**: it only stores a link to that other repo and commit, not the real files. So on GitHub:

- You see **frontend** as a single link, not a normal folder.
- You can’t open it and browse files.
- Vercel may log: *"Failed to fetch one or more git submodules"*.

The actual app you use is already at the **repo root** (`app/`, `components/`, `package.json`, etc.), so you don’t need the **frontend** submodule for the project to work.

---

## How to remove the frontend submodule (so GitHub and Vercel are clean)

Run these in **PowerShell** or **Git Bash** from the project root:

```powershell
cd c:\Hackathon\truthlens-ai

# 1. Remove the submodule (deinit and delete from Git)
git submodule deinit -f frontend
git rm -f frontend

# 2. If Git created a modules folder for it, remove that too
Remove-Item -Recurse -Force .git\modules\frontend -ErrorAction SilentlyContinue

# 3. Commit the change
git add -A
git commit -m "Remove frontend submodule; app lives at repo root"

# 4. Push to GitHub
git push origin main
```

After this:

- On GitHub, the **frontend** entry will be gone.
- Your app is unchanged (it’s at the root: `app/`, `components/`, etc.).
- Vercel will stop trying to fetch the submodule.

---

## Optional: delete the local frontend folder

If you no longer need the **frontend** folder on your PC (because everything is at the root), you can delete it:

```powershell
Remove-Item -Recurse -Force frontend
```

Then commit and push if anything is left to commit:

```powershell
git status
git add -A
git commit -m "Remove local frontend folder"
git push origin main
```

You can delete **REMOVE-FRONTEND-SUBMODULE.md** after you’re done.
