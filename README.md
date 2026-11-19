# Pawn Stars Chess

A chess website you can play with friends. One person makes a game and sends the link. The other person opens it and the game starts. Nobody needs an account.

**What's included**
- Online games by link or 4-number code, plus a list of open games on the home page
- Clocks (3+2, 5 min, 10 min, 15+10 or no clock), draw offers, resign, rematch and chat
- Spectators: anyone else who opens the link can watch
- Play the computer (4 levels), or pass and play on one laptop
- 10 website themes (Classic, Fire, Starry Night, Water, Forest, Snow, Candy, Synthwave, Storm, Paper) with animated backgrounds and matching boards and pieces
- 12 board colour presets, or your own square colours
- 16 piece styles, any piece colours, a "Make your own set" maker (shape, finish, decoration, outline, glow), or upload your own piece pictures
- Dark/light site theme, accent colour, sounds, move animations and coordinates
- Everyone's look is saved in their own browser, so your friend can use pink neon while you use wood

---

## Test it on your laptop first

1. Install **Node.js** (free) from https://nodejs.org. Choose the **LTS** version and keep all the default options. You only need to do this once.
2. Unzip `PawnStars.zip` and open the `PawnStars` folder.
3. Double-click the start file:
   - **Windows:** `Start test (Windows).bat`. If a blue "Windows protected your PC" box appears, click **More info** → **Run anyway**.
   - **Mac:** `Start test (Mac).command`. If the Mac says it can't be opened, right-click the file → **Open** → **Open**.
4. A black window opens with the server. Leave it open. Your browser then opens the **self-test page**, which runs 40 automatic checks covering the chess rules, the computer player, the piece sets and the online server. They should all go green.
5. Follow the **"Now try it yourself"** checklist at the bottom of that page. You'll play yourself in two browser tabs as if you were two different people.
6. When you're done, close the black window to stop the test server.

If anything goes red, send Claude a screenshot of the self-test page.

## Put it online (free, about 10 minutes, one time only)

You need a free **GitHub** account (to store the files) and a free **Render** account (to run the site).

### 1. Upload the files to GitHub
1. Go to https://github.com and sign up or log in.
2. Click **+** (top right) → **New repository**. Name it `pawn-stars`, leave it **Public**, and click **Create repository**.
3. On the next page, click the **uploading an existing file** link.
4. Unzip `PawnStars.zip` on your laptop. Open the `PawnStars` folder and drag **everything inside it** into the GitHub page. That's 15 files in total.
5. Click **Commit changes**.

Check that all 15 files show up on GitHub, including `chess-engine.js`, `pieces.js`, `ai.js`, `ai-worker.js` and `effects.js`.

### 2. Run it on Render
1. Go to https://render.com and sign up using **Sign in with GitHub**.
2. Click **New +** → **Web Service**, then pick your `pawn-stars` repository. You may have to allow Render to see it first.
3. Use these settings:
   - **Language / Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Click **Create Web Service** and wait a couple of minutes until it says **Live**.
5. Your site's address is at the top. It looks like `https://pawn-stars.onrender.com`. That's the link you give your class.

### Good to know
- **First visit can be slow.** On the free plan the site goes to sleep after about 15 minutes with nobody on it. The next person to open it waits up to a minute while it wakes up. After that it's fast. Open it a minute before class starts.
- **Games are wiped when it sleeps or restarts.** That's fine for quick games. Just start a new one.
- **Making changes later:** upload the new files to the same GitHub repository (same steps as above, replacing the old files). Render updates the site by itself within a few minutes.

---

## Running it on your own laptop (optional)
Install Node.js 18 or newer from https://nodejs.org, then in this folder run:

```
node server.js
```

Open http://localhost:3000. Other laptops on the same Wi-Fi can join using your laptop's local address (for example `http://192.168.1.20:3000`), although uni Wi-Fi often blocks this. That's why the Render option above is the easy way.

## What each file does
| File | What it does |
|---|---|
| `server.js` | The small server: games, moves, clocks and chat. It checks every move so nobody can cheat by editing the page. |
| `index.html` | The page layout |
| `style.css` | How it looks |
| `app.js` | The board, buttons, customise panel and online connection |
| `chess-engine.js` | The chess rules (used by both the page and the server) |
| `pieces.js` | The piece styles and the set maker, all drawn in code |
| `effects.js` | The animated theme backgrounds |
| `ai.js`, `ai-worker.js` | The computer opponent |
