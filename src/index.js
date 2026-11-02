import { TikTokLiveConnection, ControlEvent, WebcastEvent } from 'tiktok-live-connector';
import { queueSong } from './spotify.js';

const username = "username"; // tiktok username, do not include @

const tiktok = new TikTokLiveConnection(username, {});

// connect to tiktok live
tiktok.connect()
    .then(state => {
        console.log(`Connected to TikTok Live: @${username} (Room ID: ${state.roomId})`);
        console.log('Listening for "!play song - artist" commands in chat...\n');
    })
    .catch(err => {
        console.error('Failed to connect to TikTok Live:', err.message);
    });

// listen to chat comments
tiktok.on(WebcastEvent.CHAT, async data => {
    const comment = (data.content || data.comment || '').trim();

    if (comment.toLowerCase().startsWith('!play ')) {
        const query = comment.slice(6).trim();

        if (!query) return;

        const sender = data.user?.displayId || 'viewer';

        // parse song - artist
        const separatorIndex = query.indexOf('-');
        if (separatorIndex === -1) {
            console.log(`[Ignored] @${sender}: "${query}" (Format required: !play <song> - <artist>)`);
            return;
        }

        const song = query.slice(0, separatorIndex).trim();
        const artist = query.slice(separatorIndex + 1).trim();

        if (!song || !artist) {
            console.log(`[Ignored] @${sender}: "${query}" (Both song and artist are required: !play <song> - <artist>)`);
            return;
        }

        console.log(`[Request] @${sender}: "${song}" by "${artist}"`);

        try {
            const trackDetails = await queueSong(song, artist);
            console.log(`[Queued Successfully]: ${trackDetails}\n`);
        } catch (err) {
            console.error(`[Queue Failed]: ${err.message}\n`);
        }
    }
});

// handle stream disconnect
tiktok.on(ControlEvent.DISCONNECTED, () => {
    console.log('TikTok Live connection disconnected.');
});

// handle stream end
tiktok.on(WebcastEvent.STREAM_END, () => {
    console.log('TikTok Live stream ended.');
});
