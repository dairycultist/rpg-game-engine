const Renderer = {

    render: null,
    fontHeight: 0,
    defaultFont: null,

    init(fontPath, fontSize) {

        render = document.getElementById("canvas").getContext("2d");

        defaultFont = fontSize + "px DefaultFont";

        // load font
        new FontFace("DefaultFont", "url(res/" + fontPath + ")").load().then((font) => {

            document.fonts.add(font);

            render.font = defaultFont;
            fontHeight = Math.floor(render.measureText("l").fontBoundingBoxAscent);

        }).catch((err) => {
            error = `Font ${ fontPath } is invalid!`;
            return;
        });
    },
    
    clearScreen() {

        render.fillStyle = "black";
        render.fillRect(0, 0, 256, 192);
    },

    drawUIBox(x, y, w, h, string = "") {

        render.fillStyle = "black";
        render.lineWidth = "2";
        render.strokeStyle = "white";

        render.fillRect(x, y, w, h);
        render.strokeRect(x + 1, y + 1, w - 2, h - 2);

        if (string)
            Renderer.drawString(string, x + 7, y + 18, "white", w - 14);
    },

    drawUIBoxFitText(x, y, text, isRightJustified = false) {

        render.font = defaultFont;
        const width = Math.floor(render.measureText(text).width) + 15;

        if (isRightJustified)
            x -= width;

        Renderer.drawUIBox(x, y, width, 25, text);
    },

    drawString(string, x, y, color = "white", maxWidth = Infinity) {

        const spaceWidth = Math.floor(render.measureText(" ").width);

        render.fillStyle = color;
        render.font = defaultFont;

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
    },

    drawCharacterTalkSprite(characterID, isOnRight = false, isActive = true) {

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

        render.filter = "none";
    }
};