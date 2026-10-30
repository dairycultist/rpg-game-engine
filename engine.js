let player_direction = "s";
let player_anim_state = "idle";

const global_procvars = {};

const state = {
    can_move_in_map: true
};

const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    justUse: false
};

/*
Whenever an action happens, it can add a "procedure" to this list.

Procedures have three methods:
  init: Run when the procedure is first added
  frame: Run every frame; if this returns true, the procedure is destroyed (removed from the list)
  destroy: Run when the procedure is destroyed

Each function gets the arguments:
  GLOBAL: An object representing variables all procedures have access to
  LOCAL: An object representing variables only this procedure has access to -- not automatically cleared when the procedure is destroyed
  input: Inputs happening on the frame that the function is running
  state: Info on whether or not the player can move in the map, the actors currently in the room, etc
*/
let procedures = [];

let anim_t = 0;

let render;

addProcedure({
    init: (GLOBAL, LOCAL, input, state) => {

        state.can_move_in_map = false;
        LOCAL.i = 0;
    },
    frame: (GLOBAL, LOCAL, input, state) => {

        switch (LOCAL.i) {
            case 0: drawDialogue("Hi"); break;
            case 1: drawDialogue("im john"); break;
            case 2: drawDialogue("I like potatoes"); break;
        }

        if (input.justUse) {

            LOCAL.i++;

            if (LOCAL.i == 3)
                return true;
        }

        return false;
    },
    destroy: (GLOBAL, LOCAL, input, state) => {

        state.can_move_in_map = true;
    }
});

function addProcedure(procedure) {

    if (!procedure.local_procvars)
        procedure.local_procvars = {};

    procedure.init(global_procvars, procedure.local_procvars, input, state);
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

    // player movement in map
    player_anim_state = "idle";

    if (state.can_move_in_map) {

        if (input.left != input.right) {

            if (input.left) {
                gamedata.state.player_x -= 0.05;
                if (playerColliding(0, 0) || playerColliding(0, 7)) {
                    gamedata.state.player_x = Math.ceil(gamedata.state.player_x);
                } else {
                    player_direction = "w";
                    player_anim_state = "walk";
                }
            } else {
                gamedata.state.player_x += 0.05;
                if (playerColliding(15, 0) || playerColliding(15, 7)) {
                    gamedata.state.player_x = Math.floor(gamedata.state.player_x);
                } else {
                    player_direction = "e";
                    player_anim_state = "walk";
                }
            }
        }

        if (input.up != input.down) {

            if (input.up) {
                gamedata.state.player_y -= 0.05;
                if (playerColliding(0, 0) || playerColliding(15, 0)) {
                    gamedata.state.player_y = Math.ceil(gamedata.state.player_y);
                } else {
                    player_direction = "n";
                    player_anim_state = "walk";
                }
            } else {
                gamedata.state.player_y += 0.05;
                if (playerColliding(0, 7) || playerColliding(15, 7)) {
                    gamedata.state.player_y = Math.ceil(gamedata.state.player_y) - 0.48;
                } else {
                    player_direction = "s";
                    player_anim_state = "walk";
                }
            }
        }

    }

    // clear
    render.fillStyle = "black";
    render.fillRect(0, 0, 256, 192);

    // draw the map
    drawMap();

    // process all procedures
    for (let i = 0; i < procedures.length; i++) {

        if (procedures[i].frame(global_procvars, procedures[i].local_procvars, input, state)) {

            procedures[i].destroy(global_procvars, procedures[i].local_procvars, input, state);
            procedures.splice(i--, 1);
        }
    }

    input.justUse = false;

    anim_t++;
}

function playerColliding(pixelOff_x, pixelOff_y) {

    const i = gamedata.rooms[gamedata.state.curr_room].tile_data[Math.floor(gamedata.state.player_x + pixelOff_x / 16.0) + Math.floor(gamedata.state.player_y + pixelOff_y / 16.0) * 16];

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
            case " ": input.justUse = true; break;
        }
}

function drawMap() {

    const tile_data = gamedata.rooms[gamedata.state.curr_room].tile_data;

    for (let i = 0; i < 16 * 12; i++) {
        if (tile_data[i] == -1)
            continue;
        render.drawImage(gamedata.sprites[gamedata.tiles[tile_data[i]].sprite], (i % 16) * 16, Math.floor(i / 16) * 16);
    }

    const player_anim = gamedata.player_map_sprites[player_direction + "_" + player_anim_state];
    const player_image = gamedata.sprites[player_anim[Math.floor(anim_t / 15.0) % player_anim.length]];

    render.drawImage(
        player_image,
        Math.floor(gamedata.state.player_x * 16.0 - player_image.width / 2.0) + 8,
        Math.floor(gamedata.state.player_y * 16.0) - player_image.height + 8
    );
}

function drawDialogue(text, leftCharacterID = "", rightCharacterID = "", speaker = "none") {

    // draw characters
    if (leftCharacterID) {

        if (speaker == "left")
            render.filter = "none";
        else
            render.filter = "brightness(80%)";

        const image = gamedata.sprites[gamedata.characters[leftCharacterID].talk_sprites["DEFAULT"]];
        render.drawImage(image, 0, 0, image.width, image.height, 3, 9, 128, 128);
    }

    if (rightCharacterID) {

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