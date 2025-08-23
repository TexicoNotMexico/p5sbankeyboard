import * as webmidi from "./webmidi";
import * as constants from "./constants";
import * as pixelDraw from "./pixelDraw";
import * as audio from "./audio";
import * as fonts from "./fonts";
import * as control from "./control";
import * as state from "./state";

export const preload = () => {
    fonts.preload();
};

export const resize = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    canvas.style.position = "absolute";
    canvas.style.top = "50%";
    canvas.style.left = "50%";
    const scale = Math.min(window.innerWidth / constants.canvasWidth, window.innerHeight / constants.canvasHeight);
    canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
};

export const setup = () => {
    p.createCanvas(constants.canvasWidth, constants.canvasHeight, p.P2D);
    p.pixelDensity(1);
    p.frameRate(constants.frameRate);

    resize();

    webmidi.setup();
    audio.setup();
    pixelDraw.setup();
    state.setup();
    control.setup();
};

let scale = 64;

export const draw = () => {
    audio.isToneStarted && (scale = Math.max(scale - 1, 8));

    p.clear();

    p.fill(0);
    p.rect(0, 0, constants.canvasWidth, constants.canvasHeight);

    p.translate(constants.canvasWidth / 2, constants.canvasHeight / 2);

    if (audio.isToneStarted) {
        pixelDraw.draw();

        p.push();
        {
            p.translate(0, state.isDecoding ? 200 : 0);
            p.noSmooth();
            p.image(
                pixelDraw.kg,
                -(pixelDraw.kg.width * scale) / 2,
                -(pixelDraw.kg.height * scale) / 2,
                pixelDraw.kg.width * scale,
                pixelDraw.kg.height * scale
            );
        }
        p.pop();

        if (state.isDecoding) {
            p.push();
            {
                p.fill(255);
                p.textFont(fonts.k8x12);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(32);
                p.text(webmidi.midiHandler.decoder.base7, 0, -400);
                p.textSize(32 * 1.45);
                p.text(webmidi.midiHandler.decoder.base16, 0, -350);

                p.textFont(fonts.gennokaku);
                p.textSize(80);
                p.rectMode(p.CENTER);
                p.textWrap(p.CHAR);
                p.text(webmidi.midiHandler.decoder.plaintext, 0, 0, 1800);
            }
            p.pop();
        }

        state.draw();
    }

    audio.draw();
};
