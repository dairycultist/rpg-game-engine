const gamedata = {
    init: {
        party: [ "john" ],
        room: "test",
        playerX: 3.0,
        playerY: 3.0
    },
    characters: {
        john: {
            display_name: "John",
            talk_sprites: {
                DEFAULT: "https://i0.wp.com/maepolzine.com/wp-content/uploads/2017/01/5cc1b-img.jpg"
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
                DEFAULT: "https://i0.wp.com/maepolzine.com/wp-content/uploads/2017/01/5cc1b-img.jpg"
            }
        }
    },
    sprites: {
        "https://i0.wp.com/maepolzine.com/wp-content/uploads/2017/01/5cc1b-img.jpg": null,
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
        { sprite: "exit_top.png", collidable: true },
        { sprite: "exit_bottom.png", collidable: true },
    ],
    rooms: {
        test: {
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
                -1,-1, 3, 6, 6, 6, 6, 8,10, 7, 6, 6, 6, 5,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
            ],
            onEnter: {
                init(GLOBAL, LOCAL, input, state, func) {

                    state.can_move_in_map = false;
                    LOCAL.i = 0;
                },
                frame(GLOBAL, LOCAL, input, state, func) {

                    switch (LOCAL.i) {
                        case 0: func.drawDialogue("Wow.", "john", null, "left"); break;
                        case 1: func.drawDialogue("What is this place?", "john", null, "left"); break;
                        case 2: func.drawDialogue("You scratch ur nuts", "john", null, "left"); break;
                    }

                    if (input.justUse)
                        if (++LOCAL.i == 3)
                            return true;

                    return false;
                },
                destroy(GLOBAL, LOCAL, input, state, func) {

                    state.can_move_in_map = true;
                }
            }
        }
    }
};