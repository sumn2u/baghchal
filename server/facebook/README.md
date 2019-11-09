Instant Games Backend Sample
=================

## Remix this project to get your own working Instant Games Backend.

This project demonstrates how to get a simple Instant Games backend service up and running.
- Verifies validity of requests (with `FBInstant.player.getSignedPlayerInfo`) 
- Persists context information on the backend with sqlite.

### Setup
0. If you haven't already, [setup your Instant Game app](https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup).
1. Follow the [Backend Communication Guide](https://developers.facebook.com/docs/games/instant-games/guides/bots-and-server-communication/). You can skip the part about bots. Here we're just interested on backend communication.
2. Copy your app's secret into the the .env file. Make sure to never share your secret with anyone else.
3. You can now check the backend communication example and change the URL to point to your Glitch project. 
4. Your data will be verified for authenticity and saved on the sqlite database.