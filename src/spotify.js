import dotenv from 'dotenv';
dotenv.config();

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

let cachedAccessToken = null;
let tokenExpiresAt = 0;

// refresh or retrieve the OAuth access token
async function getAccessToken() {
    if (cachedAccessToken && Date.now() < tokenExpiresAt) {
        return cachedAccessToken;
    }

    const basicAuth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: SPOTIFY_REFRESH_TOKEN,
        }),
    });

    if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    cachedAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // expire 1 minute early
    return cachedAccessToken;
}

// fetch active desktop player device ID
async function getDesktopDeviceId(token) {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error(`Failed to get devices: ${response.statusText}`);
    }

    const data = await response.json();
    const desktop = data.devices.find(d => d.type.toLowerCase() === 'computer') || data.devices.find(d => d.is_active);

    if (!desktop) {
        throw new Error('No active Spotify player found. Open Spotify on your PC and play a track.');
    }

    return desktop.id;
}

// search and queue song
export async function queueSong(song, artist) {
    const token = await getAccessToken();
    const deviceId = await getDesktopDeviceId(token);

    let track = null;

    if (artist) {
        // try searching with track and artist field filters first for higher accuracy
        const primaryQuery = `track:${song} artist:${artist}`;
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(primaryQuery)}&type=track&limit=1`;
        const searchRes = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const searchData = await searchRes.json();
        track = searchData.tracks?.items?.[0];
    }

    // fallback or general query search
    if (!track) {
        const fallbackQuery = artist ? `${song} ${artist}` : song;
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(fallbackQuery)}&type=track&limit=1`;
        const searchRes = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const searchData = await searchRes.json();
        track = searchData.tracks?.items?.[0];
    }

    if (!track) {
        const queryLabel = artist ? `"${song}" by "${artist}"` : `"${song}"`;
        throw new Error(`No match found for: ${queryLabel}`);
    }

    // queue track
    const queueUrl = `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(track.uri)}&device_id=${deviceId}`;
    const queueRes = await fetch(queueUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!queueRes.ok)
        throw new Error(`Failed to queue track: ${queueRes.statusText}`);


    return `${track.name} by ${track.artists.map(a => a.name).join(', ')}`;
}
