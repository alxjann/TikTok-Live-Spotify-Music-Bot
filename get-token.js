import http from 'http';
import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';
dotenv.config();

const port = 8888;
const redirectUri = `http://127.0.0.1:${port}/callback`;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: redirectUri,
});

const scopes = [
    'user-modify-playback-state',
    'user-read-playback-state'
];

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/callback')) {
        const url = new URL(req.url, `http://127.0.0.1:${port}`);
        const code = url.searchParams.get('code');

        if (code) {
            try {
                const data = await spotifyApi.authorizationCodeGrant(code);
                const refreshToken = data.body['refresh_token'];

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1>Success!</h1><p>You can close this window and check your terminal.</p>');

                console.log('YOUR REFRESH TOKEN (copy everything below):');
                console.log(refreshToken);

                server.close();
                process.exit(0);
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error retrieving token: ' + err.message);
                console.error('Error:', err);
            }
        }
    }
});

server.listen(port, () => {
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');
    console.log('\n1. Open this link in your browser:\n');
    console.log(authorizeURL);
    console.log(`\nWaiting for authentication callback...\n`);
});