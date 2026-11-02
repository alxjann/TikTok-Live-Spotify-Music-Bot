# TikTok LIVE to Spotify Music Bot

Connect to any TikTok LIVE chat in real-time and allows viewers to request and queue songs directly to your active Spotify player using the `!play <song> - <artist>` command.

---

## Features

- **Real-Time Chat Listener**: Connects to TikTok LIVE streams using `tiktok-live-connector` without requiring login credentials.
- **Direct Spotify Queueing**: Automatically searches and adds requested songs to your active Spotify queue.
- **Automatic Token Refresh**: Uses OAuth refresh tokens so you don't have to re-authenticate every hour.

---

## Prerequisites

1. **Node.js**: Version 20.0.0 or higher.
2. **Spotify Premium**: Required by Spotify's Web API to control playback and add songs to the queue.
3. **Spotify App**: Must be open with playback active or paused.

---

## Installation

1. **Clone or download this repository** to your machine.
2. Open a terminal in the project root directory and install dependencies:

```bash
npm install
```

---

## Spotify API Setup

To allow search and queue tracks on your Spotify account:

### 1. Create a Spotify Developer App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in with your Spotify account.
2. Click **Create app**.
3. Fill in the app details:
   - **App name**: `TikTok Music Bot` (or any name you prefer)
   - **App description**: `Queues songs from TikTok LIVE chat`
   - **Redirect URI**: Add `http://127.0.0.1:8888/callback`
   - Check the **Web API** box under "Which API/SDKs are you planning to use?".
4. Accept the terms and click **Save**.
5. In your new app's settings, click **View client secret** and copy both your **Client ID** and **Client Secret**.

---

### 2. Configure Environment Variables (`.env`)

Create a file named `.env` in the root directory of the project (next to `package.json`):

```env
SPOTIFY_CLIENT_ID="your_spotify_client_id_here"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret_here"
SPOTIFY_REFRESH_TOKEN="your_spotify_refresh_token"
```

---

### 3. Generate Your Spotify Refresh Token

Run the built-in authentication script:

```bash
node get-token.js
```

1. The terminal will print a Spotify authorization URL.
2. Copy and paste the URL into your browser.
3. Click **Agree** to authorize your app with the required playback permissions (`user-modify-playback-state`, `user-read-playback-state`).
4. Once authorized, the browser will redirect and display a success message.
5. Return to your terminal, copy the printed **Refresh Token**, and paste it into your `.env` file:

```env
SPOTIFY_REFRESH_TOKEN="your_generated_refresh_token_here"
```

---

## TikTok Configuration

Open `src/index.js` and set your TikTok username (the streamer whose LIVE chat you want to read, without the `@` symbol):

```javascript
const username = "your_tiktok_username";
```

---

## How to Run

1. **Open Spotify** and start playing a track (you can pause it; Spotify just needs an active session registered).
2. Start from your terminal:

```bash
node src/index.js
```

3. When successful, you will see:

```
Connected to TikTok Live: @your_username (Room ID: 7703446867564808980)
Listening for "!play song - artist" commands in chat...
```

4. Viewers can now send song requests in chat
---

## Chat Command Format

| Command | Example | Result |
| :--- | :--- | :--- |
| `!play <song> - <artist>` | `!play Heavy - The Marias` | Adds track to Spotify queue |