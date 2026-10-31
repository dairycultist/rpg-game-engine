# simple RPG game engine

fixed screen resolution (16x12 tiles / 256x192 pixels)

The game engine allows you to:
- Easily edit a `game.js` file. This contains both the data (rooms, dialogue, etc etc) and code (functions triggered by performing actions) of your game.
- Export a `build.zip` containing the `game.js`, all relevant pngs, an `engine.js`, and an `index.html` file that reads the former and runs the game.

I wanna tell stories! I wanna make worlds! I wanna flesh out unique characters and write interpersonal interactions!

## Textures

| Texture      | Resolution |
| ------------ | ---------- |
| Talk sprites | 128x128    |
| Map tiles    | 16x16      |
| Map sprites  | Any        |

## Procedures

Whenever an action happens, it can trigger a procedure. Actions can be entering a room, interacting with an agent, moving, whatever.

Procedures have up to three methods:
- init: Run when the procedure is triggered.
- frame: Run every frame; if this returns true, the procedure is destroyed (removed from the list).
  A procedure is only added to the procedures list if it has this method.
- destroy: Run when the procedure is destroyed (removed from the procedures list).

Each method gets the arguments:
- GLOBAL: An object representing variables all procedures have access to.
- LOCAL: An object representing variables only this procedure has access to -- not automatically cleared when the procedure is destroyed.
**TODO make LOCAL automatically cleared when the procedure is destroyed (to make saving easier down the road; just use GLOBAL for cross-room persistent stuff!)**
- input: Inputs happening on the frame that the function is running.
- state: Info about the game state (whether or not the player can move in the map, the actors currently in the room, etc).
- func: An object containing every auxilliary function accessible to a procedure (for drawing, changing rooms, etc).

Room procedures: onEnter, onMapMove, onMapInteract