const global_procvars = {};

let procedures = [];

let render;

let error = null;

const input = {
    left: false,
    right: false,
    up: false,
    justUp: false,
    down: false,
    justDown: false,
    continue: false
};

const func = {
    triggerProcedure,
    spawnActor,
    showDialogue,
    showChoice,
    showShop,
    changeRoom
};

const state = {
    roomID: "", // directly modifying the state.roomID variable is discouraged
    currAction: "map", // [map, chatting, menu1, menu2]
    menuPage: 0,
    playerActor: null,
    equipment: [],
    actors: []
};

// initialize state
state.playerActor = spawnActor(gamedata.init.playerCharacterID, 0.0, 0.0);
state.equipment = gamedata.init.equipment;
changeRoom(gamedata.init.room, gamedata.init.playerX, gamedata.init.playerY);

// TODO just needs an inventory menu, a party menu (not necessarily a full party system yet, but you should be able to
// equip stuff on your main guy), and a combat system and that's basically the engine done

// TODO add auxilliary function for adding + removing (errors on trying to remove sole member) partymembers (directly modifying the state.IDK variable is discouraged)
// TODO changing to a room should make a deep copy of its tile data so we can implement an aux function for setting tiles (all changes cleared when leaving!)
// maybe I should just trust the programmer to not modify stuff that probably shouldn't be modified, like inputs, the party (without a setter), etc

let anim_t = 0;

const DEFAULT_FONT = gamedata.fontSize + "px DefaultFont";

function start() {

    // gather all images from the DOM into the gamedata
    for (key of Object.keys(gamedata.sprites))
        gamedata.sprites[key] = document.getElementById(key);

    // initialize font
    new FontFace("DefaultFont", "url(res/" + gamedata.font + ")").load().then((font) => {
        document.fonts.add(font);
    }).catch((err) => {
        error = `Font ${ gamedata.font } is invalid!`;
        return;
    });

    // initialize renderer
    render = document.getElementById("canvas").getContext("2d");

    // start update loop
    setInterval(update, 1000 / 60);

    // initialize input
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
}

function update() {

    if (error) {

        render.fillStyle = "red";
        render.font = DEFAULT_FONT;
        render.fillText(error, 0, 40);
        error = " ";
        return;
    }

    // player movement in map
    state.playerActor.animState = "idle";

    if (state.currAction == "map") {

        if (input.left != input.right) {

            if (input.left) {
                state.playerActor.x -= 0.05;
                if (playerColliding(0, 0) || playerColliding(0, 7)) {
                    state.playerActor.x = Math.ceil(state.playerActor.x) - 0.5;
                } else {
                    state.playerActor.direction = "w";
                    state.playerActor.animState = "walk";
                }
            } else {
                state.playerActor.x += 0.05;
                if (playerColliding(15, 0) || playerColliding(15, 7)) {
                    state.playerActor.x = Math.floor(state.playerActor.x) + 0.52;
                } else {
                    state.playerActor.direction = "e";
                    state.playerActor.animState = "walk";
                }
            }
        }

        if (input.up != input.down) {

            if (input.up) {
                state.playerActor.y -= 0.05;
                if (playerColliding(0, 0) || playerColliding(15, 0)) {
                    state.playerActor.y = Math.ceil(state.playerActor.y) - 0.5;
                } else {
                    state.playerActor.direction = "n";
                    state.playerActor.animState = "walk";
                }
            } else {
                state.playerActor.y += 0.05;
                if (playerColliding(0, 7) || playerColliding(15, 7)) {
                    state.playerActor.y = Math.ceil(state.playerActor.y) - 0.98;
                } else {
                    state.playerActor.direction = "s";
                    state.playerActor.animState = "walk";
                }
            }
        }

        if (gamedata.rooms[state.roomID].onMapMove && (input.left || input.right || input.up || input.down))
            triggerProcedure(gamedata.rooms[state.roomID].onMapMove);
    }

    // clear
    render.fillStyle = "black";
    render.fillRect(0, 0, 256, 192);

    // draw the map
    drawMap();

    // draw/process the menu
    if (state.currAction == "menu1" || state.currAction == "menu2") {

        // process
        if (state.currAction == "menu1")
            state.menuPage = upDownSelect(state.menuPage, 4);

        // draw
        const fontHeight = Math.floor(render.measureText("l").fontBoundingBoxAscent);

        drawUIBox(8, 8, 80, 176);
        // drawUIBox(92, 8, 156, 176);
        drawUIBox(92, 8, 156, 120);
        drawUIBox(92, 132, 156, 52);

        if (state.currAction == "menu1") {
            render.drawImage(gamedata.sprites["_pointer.png"], -4, 14 + state.menuPage * fontHeight);
        } else {
            render.drawImage(gamedata.sprites["_pointer.png"], 80, 14);
        }

        drawString("Items", 15, 26, state.menuPage == 0 ? "yellow" : "white");
        drawString("Key Items", 15, 26 + fontHeight, state.menuPage == 1 ? "yellow" : "white");
        drawString("Equipment", 15, 26 + fontHeight * 2, state.menuPage == 2 ? "yellow" : "white");
        drawString("YOU", 15, 26 + fontHeight * 3, state.menuPage == 3 ? "yellow" : "white");
        // TODO list all the party members, maybe separated slightly from the other pages?

        // draw page content
        switch (state.menuPage) {

            case 0:
                break;
            case 1:
                break;
            case 2:
                for (let i = 0; i < state.equipment.length; i++) {

                    switch (state.equipment[i].type) {
                        case "head":   render.drawImage(gamedata.sprites["_armor_head.png"], 99, 14 + i * 20); break;
                        case "body":   render.drawImage(gamedata.sprites["_armor_body.png"], 99, 14 + i * 20); break;
                        case "arm":    render.drawImage(gamedata.sprites["_armor_arm.png"],  99, 14 + i * 20); break;
                        case "weapon": render.drawImage(gamedata.sprites["_weapon.png"],     99, 14 + i * 20); break;
                    }
                    drawString(state.equipment[i].display_name, 120, 26 + i * 20);
                }
                break;
            case 3:
                render.drawImage(gamedata.sprites["_armor_head.png"], 99, 14);
                drawString("---", 120, 26, "gray");
                render.drawImage(gamedata.sprites["_armor_body.png"], 99, 34);
                drawString("---", 120, 46, "gray");
                render.drawImage(gamedata.sprites["_armor_arm.png"], 99, 54);
                drawString("---", 120, 66, "gray");
                render.drawImage(gamedata.sprites["_weapon.png"], 99, 74);
                drawString("---", 120, 86, "gray");
                break;
        }
    }

    // process all procedures
    for (let i = 0; i < procedures.length; i++) {

        if (procedures[i].frame(global_procvars, procedures[i].local_procvars, input, state, func))
            destroyProcedureAt(i);
    }

    input.continue = false;
    input.justDown = false;
    input.justUp = false;

    anim_t++;
}

function playerColliding(pixelOff_x, pixelOff_y) {

    const i = gamedata.rooms[state.roomID].tile_data[Math.floor(state.playerActor.x - 0.5 + pixelOff_x / 16.0) + Math.floor(state.playerActor.y - 0.5 + pixelOff_y / 16.0) * 16];

    if (i < 0)
        return false;

    return gamedata.tiles[i].collidable;
}

function onKeyUp(keyevent) {

    switch (keyevent.key) {
        case "ArrowUp": input.up = false; break;
        case "ArrowRight": input.right = false; break;
        case "ArrowDown": input.down = false; break;
        case "ArrowLeft": input.left = false; break;
    }
}

function onKeyDown(keyevent) {

    switch (keyevent.key) {
        case "ArrowUp": input.up = true; input.justUp = true; break;
        case "ArrowRight": input.right = true; break;
        case "ArrowDown": input.down = true; input.justDown = true; break;
        case "ArrowLeft": input.left = true; break;
        case " ":
            switch (state.currAction) {
                case "map":

                    // first check if we're close enough to any actor to interact with them
                    for (const actor of state.actors) {

                        if (actor == state.playerActor)
                            continue;

                        if (Math.abs(actor.x - state.playerActor.x) < 1.5 && Math.abs(actor.y - state.playerActor.y) < 1.5) {

                            triggerProcedure(actor.onInteract, { _actor: actor });
                            break;
                        }
                    }

                    // just interact generically with the map
                    if (gamedata.rooms[state.roomID].onMapInteract)
                        triggerProcedure(gamedata.rooms[state.roomID].onMapInteract);
                    break;
                case "menu1":
                    state.currAction = "menu2";
                    break;
                default:
                    input.continue = true;
                    break;
            }
            break;
        case "Escape":
            switch (state.currAction) {
                case "map":
                    state.currAction = "menu1";
                    state.menuPage = 0;
                    break;
                case "menu1":
                    state.currAction = "map";
                    break;
                case "menu2":
                    state.currAction = "menu1";
                    break;
            }
            break;
    }
}

function triggerProcedure(procedure, local_init = {}) {

    procedure.local_procvars = local_init;

    procedure.local_procvars._i = 0; // this is an engine variable, it's used for dialogue trees (and automatically incremented by showDialogue)

    if (procedure.init)
        procedure.init(global_procvars, procedure.local_procvars, input, state, func);

    if (procedure.frame)
        procedures.push(procedure);
}

function destroyProcedureAt(i) {

    if (procedures[i].destroy)
        procedures[i].destroy(global_procvars, procedures[i].local_procvars, input, state, func);
    procedures[i].local_procvars = null;
    procedures.splice(i--, 1);
}

function destroyAllProcedures() {

    for (let i = 0; i < procedures.length; i++) {

        if (procedures[i].destroy)
            procedures[i].destroy(global_procvars, procedures[i].local_procvars, input, state, func);
        procedures[i].local_procvars = null;
    }

    procedures = [];
}

function lookAt(toActor) {

    let dx = toActor.x - this.x;
    let dy = toActor.y - this.y;

    if (Math.abs(dy * 1.5) > Math.abs(dx)) {
        this.direction = dy > 0 ? "s" : "n";
    } else {
        this.direction = dx > 0 ? "e" : "w";
    }
}

function spawnActor(characterID, x, y) {

    const actor = {
        characterID,
        x,
        y,
        // probably add an offsetX and offsetY for animation
        direction: "s",
        animState: "idle",
        // methods
        lookAt
    };

    state.actors.push(actor);

    return actor;
}

function changeRoom(roomID, newPlayerX, newPlayerY) {

    // destroy all active procedures
    destroyAllProcedures();

    // clear the actors array except for the player
    state.actors = [ state.playerActor ];

    // change the room and move the player
    state.roomID = roomID;
    state.playerActor.x = newPlayerX;
    state.playerActor.y = newPlayerY;

    // trigger the room's onEnter procedure
    if (gamedata.rooms[state.roomID].onEnter)
        triggerProcedure(gamedata.rooms[state.roomID].onEnter);
}

function drawMap() {

    // draw room
    const tile_data = gamedata.rooms[state.roomID].tile_data;

    for (let i = 0; i < 16 * 12; i++) {
        if (tile_data[i] == -1)
            continue;
        render.drawImage(gamedata.sprites[gamedata.tiles[tile_data[i]].sprite], (i % 16) * 16, Math.floor(i / 16) * 16);
    }

    // draw all actors in order of y value
    state.actors.sort((a, b) => a.y - b.y);
    for (const actor of state.actors) {

        const anim = gamedata.characters[actor.characterID].map_sprites[actor.direction + "_" + actor.animState];
        const image = gamedata.sprites[anim[Math.floor(anim_t / 15.0) % anim.length]];

        render.drawImage(
            image,
            Math.floor(actor.x * 16.0 - image.width / 2.0),
            Math.floor(actor.y * 16.0) - image.height
        );
    }
}

/* Draws the dialoguebox containing the string stored in "text", displaying left and right characters (if present).
 * "speaker" may be one of ["left", "right", "none"], which determines which of the characters is represented as the
 * current speaker.
 * 
 * Internally, uses "LOCAL._typewriter_i" and "LOCAL._typewriter_timer" to create a typewriter effect, which is
 * deleted upon continuing.
 * 
 * Handles input (that is, when "input.continue" is true, "LOCAL._i" is incremented by one).
 * 
 * Returns true on continue, false otherwise (to accomodate logic that needs to happen between instances of dialogue).
 */
function showDialogue(LOCAL, text, leftCharacterID = "", rightCharacterID = "", speaker = "none") {

    if (LOCAL._typewriter_i == undefined) {
        LOCAL._typewriter_i = 0;
        LOCAL._typewriter_timer = 0;
    }

    // draw characters
    if (leftCharacterID) {

        if (!gamedata.characters[leftCharacterID]) {

            error = `"${ leftCharacterID }" is not a valid character ID!`;
            return;
        }

        drawCharacterTalkSprite(leftCharacterID, false, speaker == "left");
    }

    if (rightCharacterID) {

        if (!gamedata.characters[rightCharacterID]) {

            error = `"${ rightCharacterID }" is not a valid character ID!`;
            return;
        }

        drawCharacterTalkSprite(rightCharacterID, true, speaker == "right");
    }

    render.filter = "none";

    // the dialoguebox stuff
    if (LOCAL._typewriter_i < text.length) {

        LOCAL._typewriter_timer--;

        if (LOCAL._typewriter_timer <= 0) {

            LOCAL._typewriter_timer = text[LOCAL._typewriter_i] == "." ? 20 : 2;
            LOCAL._typewriter_i++;
        }
    }
    drawUIBox(3, 137, 250, 52, text.substring(0, LOCAL._typewriter_i));

    // pointer indicating the dialogue is done
    if (LOCAL._typewriter_i == text.length) {

        render.drawImage(gamedata.sprites["_pointer.png"], 232 + Math.floor(Math.sin(anim_t * 0.2) + 0.5), 170);
    }

    // speaker title
    if (speaker == "left") {

        render.font = DEFAULT_FONT;
        const nameplate_width = Math.floor(render.measureText(gamedata.characters[leftCharacterID].display_name).width + 13);

        drawUIBox(3, 114, nameplate_width, 25);
        drawString(gamedata.characters[leftCharacterID].display_name, 9, 131);

    } else if (speaker == "right") {

        const nameplate_width = Math.floor(render.measureText(gamedata.characters[rightCharacterID].display_name).width + 13);

        drawUIBox(253 - nameplate_width, 114, nameplate_width, 25);
        drawString(gamedata.characters[rightCharacterID].display_name, 259 - nameplate_width, 131);
    }

    if (input.continue) {

        if (LOCAL._typewriter_i == text.length) {

            // progress dialogue tree
            LOCAL._i++;
            delete LOCAL._typewriter_i;
            delete LOCAL._typewriter_timer;

            return true;

        } else {

            // finish typewriter effect early but don't progress dialogue tree
            LOCAL._typewriter_i = text.length;
        }
    }

    return false;
}

/* Draws a choicebox with the string elements in "choices" as the choices, storing the selected choice's index in LOCAL._selected_i.
 * 
 * Handles input for selecting between choices (that is, modifying LOCAL._selected_i).
 * 
 * Returns the selected choice's index on continue (in which case it deletes LOCAL._selected_i) and null otherwise. The programmer
 * should switch on the return value as follows:
 * 
 * switch (showChoice(...)) {
 *   case null: break;
 *   case 0: LOCAL._i = <dialogue position of first choice>; break;
 *   case 1: LOCAL._i = <dialogue position of second choice>; break;
 *   ...
 * }
 */
function showChoice(LOCAL, choices = ["a", "b"]) {

    // initialize temp variable for holding selected index if not already initialized
    if (LOCAL._selected_i == undefined)
        LOCAL._selected_i = 0;

    // selection logic
    LOCAL._selected_i = upDownSelect(LOCAL._selected_i, choices.length);

    // draw choice box
    const fontHeight = Math.floor(render.measureText("l").fontBoundingBoxAscent);

    drawUIBox(3, 137, 250, 52);

    render.drawImage(gamedata.sprites["_pointer.png"], 11, 156);

    if (LOCAL._selected_i > 0)
        drawString(choices[LOCAL._selected_i - 1], 30, 155);
    drawString(choices[LOCAL._selected_i], 30, 155 + fontHeight, "yellow");
    if (LOCAL._selected_i < choices.length - 1)
        drawString(choices[LOCAL._selected_i + 1], 30, 155 + fontHeight * 2);

    // progress dialogue tree
    if (input.continue) {
        const hold = LOCAL._selected_i;
        delete LOCAL._selected_i; // delete temp variable
        return hold;
    } else {
        return null;
    }
}

/* Draws the shopkeep talk sprite (if provided), your current money, and the drawing of showChoice(LOCAL, choices). This
 * drawing will also include "<back>" as a choice.
 * 
 * Handles input the same way as showChoice(...).
 * 
 * Returns the same way as showChoice(...), except will return -1 if "<back>" is chosen.
 */
function showShop(LOCAL, choices = ["a", "b"], shopkeepCharacterID = null) {

    // TODO shows your current money
    // TODO takes in item objects instead of strings
    // TODO show item description + price

    render.font = DEFAULT_FONT;
    const nameplate_width = Math.floor(render.measureText("$67").width + 13);

    drawUIBox(3, 114, nameplate_width, 25);
    drawString("$67", 9, 131);

    if (shopkeepCharacterID)
        drawCharacterTalkSprite(shopkeepCharacterID, true);

    choices.unshift("<back>");

    const hold = showChoice(LOCAL, choices);
    return Number.isInteger(hold) ? hold - 1 : null;
}

function drawUIBox(x, y, w, h, string = "") {

    render.fillStyle = "black";
    render.lineWidth = "2";
    render.strokeStyle = "white";

    render.fillRect(x, y, w, h);
    render.strokeRect(x + 1, y + 1, w - 2, h - 2);

    if (string)
        drawString(string, x + 7, y + 18, "white", w - 14);
}

function drawString(string, x, y, color = "white", maxWidth = Infinity) {

    const fontHeight = Math.floor(render.measureText("l").fontBoundingBoxAscent);
    const spaceWidth = Math.floor(render.measureText(" ").width);

    render.fillStyle = color;
    render.font = DEFAULT_FONT;

    let charX = x;
    let charY = y;

    let words = string.split(" ");

    for (let word of words) {

        if (charX - x + render.measureText(word).width > maxWidth) {
            charX = x;
            charY += fontHeight;
        }

        for (const char of word) {
            render.fillText(char, charX, charY);
            charX += Math.floor(render.measureText(char).width);
        }

        charX += spaceWidth;
    }
}

function drawCharacterTalkSprite(characterID, isOnRight = false, isActive = true) {

    render.filter = isActive ? "none" : "brightness(80%)";

    const image = gamedata.sprites[gamedata.characters[characterID].talk_sprites["DEFAULT"]];

    if (isOnRight) {

        render.save();
        render.translate(256, 0);
        render.scale(-1, 1);
        render.drawImage(image, 0, 0, image.width, image.height, 3, 9, 128, 128);
        render.restore();

    } else {

        render.drawImage(image, 0, 0, image.width, image.height, 3, 9, 128, 128);
    }
}

// takes in the index you want to use for selecting, and returns the new value based on input
function upDownSelect(index, count) {

    if (input.justUp != input.justDown) {

        if (input.justUp)
            index--;
        else
            index++;

        if (index < 0)
            index = count - 1;
        else if (index >= count)
            index = 0;
    }

    return index;
}