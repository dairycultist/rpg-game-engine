const gamedata = {
    init: {
        playerCharacterID: "john",
        room: "bedroom",
        playerX: 4.0,
        playerY: 4.0
    },
    characters: {
        john: {
            display_name: "John",
            talk_sprites: {
                DEFAULT: "player_talksprite.png"
            },
            map_sprites: {
                n_idle: [ "player_north.png" ],
                e_idle: [ "player_east.png" ],
                s_idle: [ "player_south.png" ],
                w_idle: [ "player_west.png" ],
                n_walk: [ "player_north.png", "player_north_walk1.png", "player_north.png", "player_north_walk2.png" ],
                e_walk: [ "player_east.png", "player_east_walk.png" ],
                s_walk: [ "player_south.png", "player_south_walk1.png", "player_south.png", "player_south_walk2.png" ],
                w_walk: [ "player_west.png", "player_west_walk.png" ],
            }
        },
        mary: {
            display_name: "Mary",
            talk_sprites: {
                DEFAULT: "player_talksprite.png"
            }
        }
    },
    font: "GrapeSoda.ttf", // https://www.dafont.com/grapesoda-2.font
    fontSize: 16,
    sprites: {
        "player_talksprite.png": null,
        "floor.png": null,
        "wall_top.png": null,
        "wall_bottom.png": null,
        "wall_left.png": null,
        "wall_left_outer.png": null,
        "wall_left_inner.png": null,
        "wall_right.png": null,
        "wall_right_outer.png": null,
        "wall_right_inner.png": null,
        "exit_top.png": null,
        "exit_bottom.png": null,
        "player_north.png": null,
        "player_east.png": null,
        "player_south.png": null,
        "player_west.png": null,
        "player_north_walk1.png": null,
        "player_north_walk2.png": null,
        "player_east_walk.png": null,
        "player_south_walk1.png": null,
        "player_south_walk2.png": null,
        "player_west_walk.png": null
    },
    tiles: [
        { sprite: "wall_top.png", collidable: true },
        { sprite: "floor.png", collidable: false },
        { sprite: "wall_left.png", collidable: true },
        { sprite: "wall_left_outer.png", collidable: true },
        { sprite: "wall_right.png", collidable: true },
        { sprite: "wall_right_outer.png", collidable: true },
        { sprite: "wall_bottom.png", collidable: true },
        { sprite: "wall_left_inner.png", collidable: true },
        { sprite: "wall_right_inner.png", collidable: true },
        { sprite: "exit_top.png", collidable: false },
        { sprite: "exit_bottom.png", collidable: false },
    ],
    rooms: {
        closet: {
            tile_data: [
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1, 2, 0, 0, 4,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1, 2, 1, 1, 4,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1, 2, 1, 1, 4,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1, 3, 8,10, 4,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
            ],
            onMapMove: {
                init(GLOBAL, LOCAL, input, state, func) {

                    if (Math.floor(state.playerActor.y) == 8) {

                        func.changeRoom("bedroom", 5.5, 3.0);
                    }
                },
            },
        },
        bedroom: {
            tile_data: [
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1, 2, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 4,-1,-1,
                -1,-1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4,-1,-1,
                -1,-1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4,-1,-1,
                -1,-1, 2, 1, 1, 1, 1, 1, 1, 7, 8, 1, 1, 4,-1,-1,
                -1,-1, 2, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 4,-1,-1,
                -1,-1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4,-1,-1,
                -1,-1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4,-1,-1,
                -1,-1, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
            ],
            onMapInteract: {
                init(GLOBAL, LOCAL, input, state, func) {

                    if (Math.floor(state.playerActor.x) == 12) {

                        func.triggerProcedure({
                            init(GLOBAL, LOCAL, input, state, func) {
                                state.can_move_in_map = false;
                            },
                            frame(GLOBAL, LOCAL, input, state, func) {

                                func.showDialogue(LOCAL, "This right wall sure is nice.");

                                return input.continue;
                            },
                            destroy(GLOBAL, LOCAL, input, state, func) {
                                state.can_move_in_map = true;
                            }
                        });
                    }
                }
            },
            onMapMove: {
                init(GLOBAL, LOCAL, input, state, func) {

                    if (Math.floor(state.playerActor.y) == 2) {

                        func.changeRoom("closet", 8.5, 7.5);
                    }
                },
            },
            onEnter: {
                init(GLOBAL, LOCAL, input, state, func) {

                    func.spawnActor("john", 10.0, 4.5).onInteract = {

                        init(GLOBAL, LOCAL, input, state, func) {
                            
                            state.can_move_in_map = false;
                            LOCAL._actor.lookAt(state.playerActor);
                            state.playerActor.lookAt(LOCAL._actor);
                        },
                        frame(GLOBAL, LOCAL, input, state, func) {

                            switch (LOCAL._i) {
                                case 0: func.showDialogue(LOCAL, "Hi I'm John. In case you didn't know, I sell things.", null, "john", "right"); break;
                                case 1:
                                    switch (func.showShop(LOCAL, [ "Apple", "Orange" ], "john")) {
                                        case null: break;
                                        case -1: LOCAL._i = 2; break;
                                        default: LOCAL._i = 4; break;
                                    }
                                    break;
                                case 2: func.showDialogue(LOCAL, "Toodles.", null, "john", "right"); break;
                                case 4:
                                    if (func.showDialogue(LOCAL, "I don't actually have that in stock right now...", null, "john", "right"))
                                        LOCAL._i = 1;
                                    break;
                                default: return true;
                            }

                            return false;
                        },
                        destroy(GLOBAL, LOCAL, input, state, func) {

                            state.can_move_in_map = true;
                            LOCAL._actor.direction = "s";
                        }
                    };

                    if (GLOBAL.didIntro) {
                        LOCAL._i = 7;
                        return;
                    }

                    state.can_move_in_map = false;
                },
                frame(GLOBAL, LOCAL, input, state, func) {

                    switch (LOCAL._i) {
                        case 0: func.showDialogue(LOCAL, "Wow.", "john", null, "left"); break;
                        case 1: func.showDialogue(LOCAL, "What is this place?", "john", null, "left"); break;
                        case 2: func.showDialogue(LOCAL, "You scratch ur nuts", "john", null, "none"); break;
                        case 3:
                            switch (func.showChoice(LOCAL, ["Based", "Ew gross", "No what", "Blegh", "NUTS??"])) {
                                case null: break; // nothing has been selected yet
                                case 0: LOCAL._i = 4; break;
                                default: LOCAL._i = 6; break; // anything besides "Based"
                            }
                        break;
                        case 4: func.showDialogue(LOCAL, "Based", "john", null, "left"); break;
                        case 6: func.showDialogue(LOCAL, "Scratchie scratch", "john", null, "left"); break;
                        default: return true;
                    }

                    return false;
                },
                destroy(GLOBAL, LOCAL, input, state, func) {

                    state.can_move_in_map = true;
                    GLOBAL.didIntro = true;
                }
            }
        }
    }
};