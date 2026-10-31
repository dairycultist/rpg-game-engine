const global_procvars = {};

const state = {
    roomID: "",
    can_move_in_map: true,
    playerActor: {
        characterID: gamedata.init.playerCharacterID,
        x: 0.0,
        y: 0.0,
        // probably add an offsetX and offsetY for animation
        direction: "s",
        animState: "idle"
    },
    actors: []
};
state.actors.push(state.playerActor);

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
    drawDialogue,
    drawChoice,
    changeRoom
};

// TODO add auxilliary function for adding + removing (errors on trying to remove sole member) partymembers (directly modifying the state.IDK variable is discouraged)
// TODO add auxilliary function for changing rooms (including where to place the player) (directly modifying the state.room variable is discouraged)
// TODO changing to a room should make a deep copy of its tile data so we can implement an aux function for setting tiles (all changes cleared when leaving!)
// maybe I should just trust the programmer to not modify stuff that probably shouldn't be modified, like inputs, the party (without a setter), etc

let procedures = [];

let anim_t = 0;

let render;

let error = null;

changeRoom(gamedata.init.room, gamedata.init.playerX, gamedata.init.playerY);

function triggerProcedure(procedure) {

    if (procedure.frame)
        procedure.local_procvars = {};

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

function start() {

    // gather all images from the DOM into the gamedata
    for (key of Object.keys(gamedata.sprites))
        gamedata.sprites[key] = document.getElementById(key);

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
        render.font = "12px monospace";
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

                    // TODO first check if we're close enough to any actor to interact with THEM instead of just generically with the map

                    if (gamedata.rooms[state.roomID].onMapInteract)
                        triggerProcedure(gamedata.rooms[state.roomID].onMapInteract);
                } else {
                    input.continue = true;
                }
                break;
        }
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
    render.fillStyle = "black";
    render.lineWidth = "2";
    render.strokeStyle = "white";
    render.font = "12px monospace";

    render.fillRect(4, 138, 248, 50);
    render.strokeRect(4, 138, 248, 50);

    render.fillStyle = "white";
    render.fillText(text, 10, 156);

    if (speaker == "left") {

        const nameplate_width = gamedata.characters[leftCharacterID].display_name.length * 5 + 20;

        render.fillStyle = "black";
        render.fillRect(4, 113, nameplate_width, 25);
        render.strokeRect(4, 113, nameplate_width, 25);

        render.fillStyle = "white";
        render.fillText(gamedata.characters[leftCharacterID].display_name, 10, 130);

    } else if (speaker == "right") {

        const nameplate_width = gamedata.characters[rightCharacterID].display_name.length * 5 + 20;

        render.fillStyle = "black";
        render.fillRect(252 - nameplate_width, 113, nameplate_width, 25);
        render.strokeRect(252 - nameplate_width, 113, nameplate_width, 25);

        render.fillStyle = "white";
        render.fillText(gamedata.characters[rightCharacterID].display_name, 258 - nameplate_width, 130);
    }
}

function drawChoice(choices = ["a", "b"], selected_i = 0) {

    render.fillStyle = "black";
    render.lineWidth = "2";
    render.strokeStyle = "white";
    render.font = "12px monospace";

    render.fillRect(4, 138, 248, 50);
    render.strokeRect(4, 138, 248, 50);

    for (let i = 0; i < choices.length; i++) {

        render.fillStyle = i == selected_i ? "yellow" : "white";
        render.fillText(choices[i], 10, 156 + 12 * i);
    }
}