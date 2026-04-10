# 🎉 Asiri Laboratories — Avurudu Lucky Pot
## Complete Netlify Deployment Guide

---

## 📁 Project Structure

```
asiri-lucky-pot/
├── index.html                    ← The game (login + game + admin)
├── package.json                  ← Lists @netlify/blobs dependency
├── netlify.toml                  ← Netlify build & function config
├── DEPLOY_INSTRUCTIONS.md        ← This file
└── netlify/
    └── functions/
        ├── save-player.js        ← Saves a player + prize to Blobs
        ├── check-player.js       ← Checks if EPF already played
        ├── admin-data.js         ← Returns all data (admin only)
        └── admin-reset.js        ← Wipes all data (admin only)
```

---

## 🚀 Step-by-Step Deployment

### Step 1 — Create a Netlify Account
Go to https://netlify.com and sign up (free).

### Step 2 — Deploy via Drag & Drop (Easiest)
1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Deploy manually"**
3. **Drag the entire `asiri-lucky-pot` folder** onto the upload area
4. Wait ~30 seconds for deploy to complete
5. Netlify gives you a URL like `https://amazing-name-123.netlify.app`

> ✅ That's it! The game is live.

### Step 3 — (Optional) Set Custom Admin Password via Environment Variable
By default the password is `Pasiya@2003`. To change it:
1. In Netlify Dashboard → your site → **Site configuration → Environment variables**
2. Add a variable: `ADMIN_PASSWORD` = `your-new-password`
3. Redeploy the site

---

## ✅ How It Works (Multi-Device)

- **All players** on any phone/laptop/tablet go to your Netlify URL
- **When they log in**, the game calls `/api/check-player` — this hits a Netlify Function that checks Netlify Blobs (shared cloud storage)
- **When they click a pot**, their result is saved via `/api/save-player` to Netlify Blobs
- **Admin dashboard** (one device) calls `/api/admin-data` to get ALL players' data from Blobs
- Because all data is in Netlify Blobs (not localStorage), every device sees the same data

---

## 🔑 Admin Access

1. On the game's login page, click **"Admin Portal"** (bottom right)
2. Enter password: `Pasiya@2003` (or your custom ADMIN_PASSWORD env var)
3. View all participants, export CSV/Excel, reset data

---

## ⚙️ Prize Configuration

Edit `index.html` — find this near the top of the `<script>` section:

```js
const PRIZE_LIMITS = { 5000: 2, 1000: 20, 500: 40 };
const TOTAL_PLAYERS = 1000;
```

Also update the same values in `netlify/functions/save-player.js`:
```js
const PRIZE_LIMITS = { 5000: 2, 1000: 20, 500: 40 };
```

---

## ⚠️ Important Notes

1. **Netlify Blobs is free** on all plans including the free Starter plan
2. **No database setup needed** — Blobs are zero-config
3. **Data persists** across all devices and redeploys
4. **Prize limits are enforced server-side** — even if a player manipulates the browser, the server double-checks and overrides
5. **Each EPF can only play once** — enforced server-side

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| "Connection error" on login | Make sure you deployed the whole folder (not just index.html) |
| Functions not working | Check Netlify dashboard → Functions tab for error logs |
| Admin shows no data | Click the Refresh button; Blobs may take a few seconds |
| Want to change password | Set `ADMIN_PASSWORD` environment variable in Netlify |

---

## 📊 After the Event

1. Log into admin dashboard
2. Click **⬇ Export CSV** or **⬇ Export Excel**
3. You'll get a full list of all participants with their prizes and timestamps
