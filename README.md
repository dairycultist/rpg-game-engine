# simple RPG game engine

fixed screen resolution (16x12 tiles / 256x192 pixels)

The game engine will allow you to:
- Easily edit a `game.js` file. This contains both the data and code of your game.
- Export a `build.zip` containing the `game.js`, all relevant resources (images, fonts, sounds, etc), an `engine.js`, and an `index.html` file that runs the game.

I wanna tell stories! I wanna make worlds! I wanna flesh out unique characters and write interpersonal interactions!

# Using this thing

## Textures

| Texture                | Resolution |
| ---------------------- | ---------- |
| Talk sprites           | 128x128    |
| Map tiles              | 16x16      |
| Map sprites            | Any        |
| Pointer `_pointer.png` | 16x16      |

## Procedures

Whenever an action happens, it can trigger a procedure. Actions can be entering a room, interacting with an agent, moving, whatever.

Procedures have up to three methods:
- init: Run when the procedure is triggered.
- frame: Run every frame; if this returns true, the procedure is destroyed (removed from the list).
  A procedure is only added to the procedures list if it has this method.
- destroy: Run when the procedure is destroyed (removed from the procedures list).

Each method gets the arguments:
- `GLOBAL`: An object representing variables all procedures have access to.
- `LOCAL`: An object representing variables only this procedure has access to
  - Automatically cleared when the procedure is destroyed (to make saving easier down the road; just use GLOBAL for cross-procedure persistent stuff!).
  - The engine creates local engine variables (prefixed with `_`) for certain functions; for example, `_i` should be used in a `switch` statement for creating a dialogue tree, and it is automatically incremented by the function `showDialogue` when the user presses space.
- `input`: Inputs happening on the frame that the function is running.
- `state`: Info about the game state (whether or not the player can move in the map, the actors currently in the room, etc).
- `func`: An object containing every auxilliary function accessible to a procedure (for drawing, changing rooms, etc).

### Room procedures
onEnter, onMapMove, onMapInteract

### Actor procedures
(all of these have the actor object passed as `LOCAL._actor`)

onInteract