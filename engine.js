let moving_north = false, moving_east = false, moving_south = false, moving_west = false;
let player_direction = "s";
let player_anim_state = "idle";
let can_move_in_map = true;

// whenever an action happens, it adds its corresponding function call to this list
// (if it exists). all the functions here return false if they want to stay in the
// list for another frame, or true if they want to be removed.
let action_functions = [
    (GLOBAL, UNIQUIFIER, action_argument) => {

        return false;
    };
];

let anim_t = 0;

let render;

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

    // clear
    render.fillStyle = "black";
    render.fillRect(0, 0, 256, 192);

    // temp, draw the map
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

    player_anim_state = "idle";

    if (can_move_in_map) {

        if (moving_west != moving_east) {

            if (moving_west) {
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

        if (moving_north != moving_south) {

            if (moving_north) {
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
        case "ArrowUp": moving_north = false; break;
        case "ArrowRight": moving_east = false; break;
        case "ArrowDown": moving_south = false; break;
        case "ArrowLeft": moving_west = false; break;
    }
}

function onKeyDown(keyevent) {

    if (can_move_in_map) {

        // an empty event queue means we're in "map navigation" mode
        switch (keyevent.key) {
            case "ArrowUp": moving_north = true; break;
            case "ArrowRight": moving_east = true; break;
            case "ArrowDown": moving_south = true; break;
            case "ArrowLeft": moving_west = true; break;
        }

    }
    // else {

    //     const curr_event = gamedata.state.event_queue[0];

    //     if (curr_event.type == "choice") {

    //         if (keyevent.key == "ArrowUp") {
                
    //             curr_event.selected_i--;

    //             if (curr_event.selected_i < 0)
    //                 curr_event.selected_i = curr_event.choices.length - 1;
    //         }

    //         if (keyevent.key == "ArrowDown") {
                
    //             curr_event.selected_i++;

    //             if (curr_event.selected_i >= curr_event.choices.length)
    //                 curr_event.selected_i = 0;
    //         }
    //     }
        
    //     if (keyevent.key === ' ') {

    //         progressEventQueue();
    //     }
    // }
}

function drawDialogue(event) {

    // draw characters
    if (event.left) {

        if (event.speaker == "left")
            render.filter = "none";
        else
            render.filter = "brightness(80%)";

        const image = gamedata.sprites[gamedata.characters[event.left].talk_sprites["DEFAULT"]];
        render.drawImage(image, 0, 0, image.width, image.height, 3, 9, 128, 128);
    }

    if (event.right) {

        if (event.speaker == "right")
            render.filter = "none";
        else
            render.filter = "brightness(80%)";

        render.save();
        render.translate(256, 0);
        render.scale(-1, 1);
        const image = gamedata.sprites[gamedata.characters[event.right].talk_sprites["DEFAULT"]];
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
    render.fillText(event.text, 10, 156);

    if (event.speaker == "left") {

        const nameplate_width = event.left.length * 5 + 20;

        render.fillStyle = "black";
        render.fillRect(4, 113, nameplate_width, 25);
        render.strokeRect(4, 113, nameplate_width, 25);

        render.fillStyle = "white";
        render.fillText(gamedata.characters[event.left].display_name, 10, 130);

    } else if (event.speaker == "right") {

        const nameplate_width = event.right.length * 5 + 20;

        render.fillStyle = "black";
        render.fillRect(252 - nameplate_width, 113, nameplate_width, 25);
        render.strokeRect(252 - nameplate_width, 113, nameplate_width, 25);

        render.fillStyle = "white";
        render.fillText(gamedata.characters[event.right].display_name, 258 - nameplate_width, 130);
    }
}

function drawChoice(event) {

    render.fillStyle = "black";
    render.lineWidth = "2";
    render.strokeStyle = "white";
    render.font = "12px monospace";

    render.fillRect(4, 138, 248, 50);
    render.strokeRect(4, 138, 248, 50);

    for (let i = 0; i < event.choices.length; i++) {

        render.fillStyle = i == event.selected_i ? "yellow" : "white";
        render.fillText(event.choices[i].text, 10, 156 + 12 * i);
    }
}