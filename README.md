# Murder Is In The Cards

A deductive board game for 3-6 players, in the style of Clue/Cluedo. Played with human opponents, in real-time over the internet.

The game is deeply inspired by Clue/Cluedo --- anyone who has played that will feel right at home --- though it is not officially affiliated with it.

## Installation

```
yarn install
yarn build
yarn run
```

will set up a server on `$PORT` (default 2567).

## Development

`yarn install`, then in one window, `cd murderisinthecards-server && yarn run`, and in another window, `cd murderisinthecards-client && yarn run`. This starts a webpack development server on port 3000; the client served there will automatically connect to the game server on port 2567. (The game server on port 2567 will only serve the production client.)

## Tech

[Colyseus](https://colyseus.io/) for game state sync, websockets, etc. NodeJS on the server, React on the client, all TypeScript.

This is my first Node project, first React project, and in general the largest body of Javascript I've written. It's an experiment and for fun with my family during the Covid-19 lockdown --- it's not supposed to be, and likely isn't, a fantastic example of how to organise these projects, or of great code style, or really of anything at all.
