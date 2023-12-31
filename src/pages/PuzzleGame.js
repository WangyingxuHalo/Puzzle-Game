import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js"
import backgroundImage from "../static/sky.jpeg";
import sound from "pixi-sound";

import image1 from '../static/1.png';
import image2 from '../static/2.png';
import image3 from '../static/3.png';
import image4 from '../static/4.png';
import image5 from '../static/5.png';
import image6 from '../static/6.png';
import image7 from '../static/7.png';
import image8 from '../static/8.png';
import image9 from '../static/9.png';
import clickSound from "../sound/click.mp3";

import { PuzzleGameConfig } from "../config/PuzzleGridConfig";
import { getTop, getBottom, getLeft, getRight, onMouseDragStart, onMouseMove } from "../utils";

const images = [
    image1, image2, image3, image4,
    image5, image6, image7, image8,
    image9
];

const spriteList = [];
var globalPuzzleContainer;

function onMouseDragEnd(e) {
    this.dragging = false;
    this.zIndex = 0;

    // check if current position is within any sprites or not
    const currId = this.id;

    var foundProperPuzzle = false;
    for (const sprite of spriteList) {
        if (sprite.id === currId) {
            continue;
        }
        const index = sprite.id - 1;
        const currPositionX = PuzzleGameConfig[index].x;
        const currPositionY = PuzzleGameConfig[index].y;
        const width = this.width;
        const height = this.height;
        const localPosition = globalPuzzleContainer.toLocal(new PIXI.Point(e.data.global.x, e.data.global.y));
        
        // within the rectangle
        if (localPosition.x >= getLeft(currPositionX, width) &&
            localPosition.x <= getRight(currPositionX, width) &&
            localPosition.y >= getTop(currPositionY, height) &&
            localPosition.y <= getBottom(currPositionY, height)) {
                foundProperPuzzle = true;
                // exchange the fields of two puzzles
                const replaceField = sprite.field;
                sprite.field = this.field;
                this.field = replaceField;

                // exchange the id of two puzzles
                const replaceId = sprite.id;
                sprite.id = this.id;
                this.id = replaceId;
                // set position
                this.position.set(this.field.x, this.field.y);
                sprite.position.set(sprite.field.x, sprite.field.y);
        }
    }
    // If cannot find puzzle to exchange, put it back to original place
    if (!foundProperPuzzle) {
        this.position.set(this.field.x, this.field.y);
    }

    e.stopPropagation();
}

const loadImage = (imageName) => {
    return new Promise((resolve, reject) => {
        const texture = PIXI.Texture.from(imageName);
        if (texture.baseTexture.valid) {
            resolve(texture);
        } else {
            texture.baseTexture.once('loaded', () => {
                resolve(texture);
            });
            texture.baseTexture.once('error', (err) => {
                reject(err);
            });
        }
    });
};

const attachAllImages = async (puzzleContainer) => {
    try {
        // init sound object
        sound.add('clickSound', clickSound);

        const imagePromises = images.map(image => loadImage(image));
        const textures = await Promise.all(imagePromises);

        // shuffle all the images and add to puzzle container
        var ids = PuzzleGameConfig.map(field => field.id);
        PuzzleGameConfig.forEach((_, i) => {
            const randomId = Math.floor(Math.random() * ids.length);
            const id = ids[randomId];
            ids = ids.filter(field => field !== id);

            const sprite = new PIXI.Sprite(textures[i]);
            // Position each sprite randomly
            const originalX = PuzzleGameConfig[id - 1].x;
            const originalY = PuzzleGameConfig[id - 1].y;
            sprite.id = id;
            sprite.field = { x: originalX, y: originalY };
            sprite.position.set(originalX, originalY);
            sprite.anchor.set(0.5);
            sprite.sound = sound;

            // set interactive property of sprite
            sprite.interactive = true;

            sprite.dragging = false;
            sprite.on("mousedown", onMouseDragStart.bind(sprite));
            sprite.on("touchstart", onMouseDragStart.bind(sprite));
            sprite.on("mousemove", onMouseMove.bind(sprite));
            sprite.on("touchmove", onMouseMove.bind(sprite));
            sprite.on("mouseup", onMouseDragEnd.bind(sprite));
            sprite.on("mouseupoutside", onMouseDragEnd.bind(sprite));
            sprite.on("touchend", onMouseDragEnd.bind(sprite));
            sprite.on("touchendoutside", onMouseDragEnd.bind(sprite));

            puzzleContainer.addChild(sprite);
            spriteList.push(sprite);
        })
    } catch (error) {
        console.error('Error loading images:', error);
    }
};

const createBackgroundSprite = () => {

    // background image
    const backgroundTexture = PIXI.Texture.from(backgroundImage);
    const backgroundSprite = new PIXI.Sprite(backgroundTexture);

    // set position of the background picture
    backgroundSprite.position.set(0, 0);

    return backgroundSprite;
}

const PixiCanvas = () => {
    const pixiContainerRef = useRef(null);

    useEffect(() => {
        const app = new PIXI.Application({ resizeTo: window });

        // container of the background image
        const bgContainer = new PIXI.Container();
        const bgSprite = createBackgroundSprite();
        bgContainer.addChild(bgSprite);

        // auto resize when window size changes
        const resizeBackground = () => {
            bgSprite.width = window.innerWidth;
            bgSprite.height = window.innerHeight;
        };

        resizeBackground();
        window.addEventListener('resize', resizeBackground);

        // container of the puzzle image
        const puzzleContainer = new PIXI.Container();
        globalPuzzleContainer = puzzleContainer;
        puzzleContainer.sortableChildren = true

        puzzleContainer.x = window.innerWidth / 2;
        puzzleContainer.y = window.innerHeight / 2;

        // attach puzzle container to background container
        bgContainer.addChild(puzzleContainer);
        attachAllImages(puzzleContainer);

        // attach to app
        app.stage.addChild(bgContainer);
        pixiContainerRef.current.appendChild(app.view);
        // remove when detach
        return () => {
            window.removeEventListener('resize', resizeBackground);
            app.destroy(true);
        }
    }, []);

    return <div ref={pixiContainerRef} />;
}

const PuzzleGame = () => {

    return (
        <div>
            <PixiCanvas />
        </div>
    );
}

export default PuzzleGame;
