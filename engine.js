/*
 * room procedures: onEnter, onMapMove, onMapInteract
 */
let curr_room;
let party     = gamedata.init.party;

const global_procvars = {};

const state = {
    can_move_in_map: true,
    playerActor: {
        // probably add an offsetX and offsetY for animation
        x: 0.0,
        y: 0.0,
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
    down: false,
    continue: false
};

const func = {
    triggerProcedure,
    drawDialogue,
    drawChoice,
    changeRoom
};

// TODO add auxilliary function for adding, removing (errors on trying to remove sole member), and peeping party members
// TODO add auxilliary function for changing rooms (including where to place the player)

/*
 * Whenever an action happens, it can trigger a procedure.
 * Actions can be entering a room, interacting with an agent, moving, whatever.
 * 
 * Procedures have up to three methods:
 *   init: Run when the procedure is triggered.
 *   frame: Run every frame; if this returns true, the procedure is destroyed (removed from the list)
 *          A procedure is only added to the procedures list if it has this method.
 *   destroy: Run when the procedure is destroyed (removed from the procedures list).
 * 
 * Each method gets the arguments:
 *   GLOBAL: An object representing variables all procedures have access to
 *   LOCAL: An object representing variables only this procedure has access to -- not automatically cleared when the procedure is destroyed
 *   input: Inputs happening on the frame that the function is running
 *   state: Info on whether or not the player can move in the map, the actors currently in the room, etc
 *   func: An object containing every auxilliary function accessible to a procedure (for drawing, changing rooms, etc).
*/
let procedures = [];

let anim_t = 0;

let render;

let error = null;

changeRoom(gamedata.init.room, gamedata.init.playerX, gamedata.init.playerY);

function triggerProcedure(procedure) {

    if (!procedure.local_procvars)
        procedure.local_procvars = {};

    if (procedure.init)
        procedure.init(global_procvars, procedure.local_procvars, input, state, func);

    if (procedure.frame)
        procedures.push(procedure);
}

function start() {

    // gather all images from the DOM into the gamedata
    for (key of Object.keys(gamedata.sprites))
        gamedata.sprites[key] = document.getElementById(key);

    // initialize renderer
    render = document.getElementById("canvas").getContext("2d");

    setInterval(update, 1000 / 60);

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
                    state.playerActor.x = Math.floor(state.playerActor.x) + 0.5;
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

        if (gamedata.rooms[curr_room].onMapMove && (input.left || input.right || input.up || input.down))
            triggerProcedure(gamedata.rooms[curr_room].onMapMove);
    }

    // clear
    render.fillStyle = "black";
    render.fillRect(0, 0, 256, 192);

    // draw the map
    drawMap();

    // process all procedures
    for (let i = 0; i < procedures.length; i++) {

        if (procedures[i].frame(global_procvars, procedures[i].local_procvars, input, state, func)) {

            if (procedures[i].destroy)
                procedures[i].destroy(global_procvars, procedures[i].local_procvars, input, state, func);
            procedures.splice(i--, 1);
        }
    }

    input.continue = false;

    anim_t++;
}

function playerColliding(pixelOff_x, pixelOff_y) {

    const i = gamedata.rooms[curr_room].tile_data[Math.floor(state.playerActor.x - 0.5 + pixelOff_x / 16.0) + Math.floor(state.playerActor.y - 0.5 + pixelOff_y / 16.0) * 16];

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
            case "ArrowUp": input.up = true; break;
            case "ArrowRight": input.right = true; break;
            case "ArrowDown": input.down = true; break;
            case "ArrowLeft": input.left = true; break;
            case " ":
                if (state.can_move_in_map) {
                    if (gamedata.rooms[curr_room].onMapInteract)
                        triggerProcedure(gamedata.rooms[curr_room].onMapInteract);
                } else {
                    input.continue = true;
                }
                break;
        }
}

function changeRoom(roomID, newPlayerX, newPlayerY) {

    // TODO im not sure what we should do with active procedures
    // TODO also remember to clear the actors array except for the player

    curr_room = roomID;
    state.playerActor.x = newPlayerX;
    state.playerActor.y = newPlayerY;

    if (gamedata.rooms[curr_room].onEnter)
        triggerProcedure(gamedata.rooms[curr_room].onEnter);
}

function drawMap() {

    const tile_data = gamedata.rooms[curr_room].tile_data;

    for (let i = 0; i < 16 * 12; i++) {
        if (tile_data[i] == -1)
            continue;
        render.drawImage(gamedata.sprites[gamedata.tiles[tile_data[i]].sprite], (i % 16) * 16, Math.floor(i / 16) * 16);
    }

    const player_anim = gamedata.characters[party[0]].map_sprites[state.playerActor.direction + "_" + state.playerActor.animState];
    const player_image = gamedata.sprites[player_anim[Math.floor(anim_t / 15.0) % player_anim.length]];

    render.drawImage(
        player_image,
        Math.floor(state.playerActor.x * 16.0 - player_image.width / 2.0),
        Math.floor(state.playerActor.y * 16.0) - player_image.height
    );
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
        render.fillText(choices[i].text, 10, 156 + 12 * i);
    }
}