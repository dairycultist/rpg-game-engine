const global_procvars = {};

const state = {
    roomID: "", // directly modifying the state.roomID variable is discouraged
    can_move_in_map: true,
    playerActor: null,
    actors: []
};

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
    drawDialogue,
    drawChoice,
    changeRoom
};

// TODO add auxilliary function for adding + removing (errors on trying to remove sole member) partymembers (directly modifying the state.IDK variable is discouraged)
// TODO changing to a room should make a deep copy of its tile data so we can implement an aux function for setting tiles (all changes cleared when leaving!)
// maybe I should just trust the programmer to not modify stuff that probably shouldn't be modified, like inputs, the party (without a setter), etc

let procedures = [];

let anim_t = 0;

let render;

let error = null;

const DEFAULT_FONT = gamedata.fontSize + "px DefaultFont";

// initialize state
state.playerActor = spawnActor(gamedata.init.playerCharacterID, 0.0, 0.0);
changeRoom(gamedata.init.room, gamedata.init.playerX, gamedata.init.playerY);

function start() {

    // gather all images from the DOM into the gamedata
    for (key of Object.keys(gamedata.sprites))
        gamedata.sprites[key] = document.getElementById(key);

    // initialize font
    new FontFace("DefaultFont", "url(" + gamedata.font + ")").load().then((font) => {
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

    if (state.can_move_in_map) {

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
                if (state.can_move_in_map) {

                    // first check if we're close enough to any actor to interact with them
                    for (const actor of state.actors) {

                        if (actor == state.playerActor)
                            continue;

                        if (Math.abs(actor.x - state.playerActor.x) < 1.5 && Math.abs(actor.y - state.playerActor.y) < 1.5) {

                            triggerProcedure(actor.onInteract, { actor });
                            break;
                        }
                    }

                    // just interact generically with the map
                    if (gamedata.rooms[state.roomID].onMapInteract)
                        triggerProcedure(gamedata.rooms[state.roomID].onMapInteract);

                } else {
                    input.continue = true;
                }
                break;
        }
}

function triggerProcedure(procedure, local_init = {}) {

    procedure.local_procvars = local_init;

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

function drawDialogue(text, leftCharacterID = "", rightCharacterID = "", speaker = "none") {

    // draw characters
    if (leftCharacterID) {

        if (!gamedata.characters[leftCharacterID]) {

            error = `"${ leftCharacterID }" is not a valid character ID!`;
            return;
        }

        if (speaker == "left")
            render.filter = "none";
        else
            render.filter = "brightness(80%)";

        const image = gamedata.sprites[gamedata.characters[leftCharacterID].talk_sprites["DEFAULT"]];
        render.drawImage(image, 0, 0, image.width, image.height, 3, 9, 128, 128);
    }

    if (rightCharacterID) {

        if (!gamedata.characters[rightCharacterID]) {

            error = `"${ rightCharacterID }" is not a valid character ID!`;
            return;
        }

        if (speaker == "right")
            render.filter = "none";
        else
            render.filter = "brightness(80%)";

        render.save();
        render.translate(256, 0);
        render.scale(-1, 1);
        const image = gamedata.sprites[gamedata.characters[rightCharacterID].talk_sprites["DEFAULT"]];
        render.drawImage(image, 0, 0, image.width, image.height, 3, 9, 128, 128);
        render.restore();
    }

    render.filter = "none";

    // the dialogue box stuff
    drawUIBox(3, 137, 250, 52, text);

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
}

function drawChoice(choices = ["a", "b"], selected_i = 0) {

    const fontHeight = Math.floor(render.measureText("l").fontBoundingBoxAscent);

    drawUIBox(3, 137, 250, 52);

    if (selected_i > 0)
        drawString(choices[selected_i - 1], 10, 155);
    drawString(choices[selected_i], 10, 155 + fontHeight, "yellow");
    if (selected_i < choices.length - 1)
        drawString(choices[selected_i + 1], 10, 155 + fontHeight * 2);
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