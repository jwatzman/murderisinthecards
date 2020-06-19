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

## Game Rules

The object of the game is to figure out, by process of elimination, the details of a murder: who committed the murder, with what weapon, and where. At the beginning of the game, a murderer, weapon, and location are picked in secret; the other suspects, weapons, and locations are passed out secretly as cards to each of the other players.

Play proceeds with players rolling a die and moving around the board. When you enter a room (via one of the doors), you may make a "suggestion", picking a suspect and weapon (and using the current room as the location). Play proceeds around, with each player trying to "disprove" the suggestion by showing one of the named cards to the person who made the suggestion (thus proving that card is *not* part of the murder). This ends once the suggestion is disproved, or once everyone announces that they cannot disprove the suggestion.

Only one suggestion can be made after entering a room. A secret passage exists between the pairs of corner rooms, which a player can use instead of rolling the die. Any player named in a suggestion is moved into the room where the suggestion was made, and may themself make a suggestion on their next turn as if they had just entered the room.

Finally, at any point on their turn, if a player thinks they know how the murder was committed, a player may make an "accusation", and name any suspect, weapon, and room. If they are correct, they win the game; if they are incorrect, they lose and are eliminated from the game, serving only to disprove further suggestions by other players.

For a detailed explanation, consult the rules of Clue/Cluedo.

## Tech

[Colyseus](https://colyseus.io/) for game state sync, websockets, etc. NodeJS on the server, React on the client, all TypeScript.

This is my first Node project, first React project, and in general the largest body of Javascript I've written. It's an experiment and for fun with my family during the Covid-19 lockdown --- it's not supposed to be, and likely isn't, a fantastic example of how to organise these projects, or of great code style, or really of anything at all.
