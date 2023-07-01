import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js"
import backgroundImage from "../static/sky.jpeg";

import image1 from '../static/1.png';
import image2 from '../static/2.png';
import image3 from '../static/3.png';
import image4 from '../static/4.png';
import image5 from '../static/5.png';
import image6 from '../static/6.png';
import image7 from '../static/7.png';
import image8 from '../static/8.png';
import image9 from '../static/9.png';

const images = [
    image1, image2, image3, image4,
    image5, image6, image7, image8,
    image9
];

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

const loadAllImages = async (app) => {
    try {
        const imagePromises = images.map(image => loadImage(image));
        const textures = await Promise.all(imagePromises);

        for (let i = 0; i < textures.length; i++) {
            const sprite = new PIXI.Sprite(textures[i]);
            // Position each sprite according to your desired layout
            sprite.position.set(i * 100, 0);
            app.stage.addChild(sprite);
        }
    } catch (error) {
        console.error('Error loading images:', error);
    }
};

const PixiCanvas = () => {
    const pixiContainerRef = useRef(null);

    useEffect(() => {
        const app = new PIXI.Application({ resizeTo: window });

        const container = new PIXI.Container();

        const backgroundTexture = PIXI.Texture.from(backgroundImage);
        const backgroundSprite = new PIXI.Sprite(backgroundTexture);

        const resizeBackground = () => {
            backgroundSprite.width = window.innerWidth;
            backgroundSprite.height = window.innerHeight;
        };

        // set position of the background picture
        backgroundSprite.position.set(0, 0);
        resizeBackground();

        window.addEventListener('resize', resizeBackground);

        container.addChild(backgroundSprite);
        app.stage.addChild(container);

        pixiContainerRef.current.appendChild(app.view);


        loadAllImages(app);
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
