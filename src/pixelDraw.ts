import * as constants from "./constants";
import * as webmidi from "./webmidi";
import * as animation from "./animation";
import * as state from "./state";
import { Color, Graphics } from "p5";
import { NoteMessageEvent } from "webmidi";

export let kg: Graphics;

let ripples: animation.AnimationManager;

export class RippleAnimation extends animation.Animation {
    constructor(private x: number, private y: number, private radii: number[], durationFrames: number) {
        super(durationFrames);
    }

    protected animate(canvas: Graphics, f: number) {
        canvas.push();
        {
            const cx = this.x;
            const cy = this.y;
            const r = this.radii[f - 1];

            if (r === 1) {
                jaggyLine(cx - 1, cy - 1, cx + 1, cy - 1, canvas.color(255));
                jaggyLine(cx - 1, cy + 1, cx + 1, cy + 1, canvas.color(255));
                jaggyLine(cx - 1, cy + 1, cx - 1, cy - 1, canvas.color(255));
                jaggyLine(cx + 1, cy + 1, cx + 1, cy - 1, canvas.color(255));
            } else {
                canvas.randomSeed(r + (this.startFrame ?? 0) + this.x * 128);

                const numPoints = r * 2 + 3;
                const baseStep = canvas.TWO_PI / numPoints;
                const jitter = canvas.radians(baseStep * 1.5);

                const angles: number[] = [];
                for (let i = 0; i < numPoints; i++) {
                    const baseAngle = i * baseStep;
                    const offset = canvas.random(-jitter, jitter);
                    angles.push(baseAngle + offset);
                }
                angles.sort();

                const points = angles.map((a) => ({
                    x: Math.round(cx + r * Math.cos(a)),
                    y: Math.round(cy + r * Math.sin(a)),
                }));

                for (let i = 0; i < points.length; i++) {
                    const current = points[i];
                    const next = points[(i + 1) % points.length];
                    jaggyLine(current.x, current.y, next.x, next.y, canvas.color(canvas.random() < 1 / 4 ? 0 : 255));
                }
            }
        }
        canvas.pop();
    }
}

export const setup = () => {
    kg = p.createGraphics(300, 45); // keyboard: 33 * 15
    kg.noSmooth();
    ripples = new animation.AnimationManager();
};

export const draw = () => {
    kg.clear();
    ripples.draw(kg);
    keyboard();
};

const kbOrigin = { x: 150 - 16, y: 45 - 15 };

const keyboard = () => {
    kg.push();
    {
        kg.noStroke();
        kg.translate(kbOrigin.x, kbOrigin.y);

        if (!state.isFullKeyboard) {
            // background
            kg.fill(constants.keyboardColors.base);
            kg.rect(0, 0, 33, 15);

            // white keys
            kg.fill(constants.keyboardColors.whiteKeyOff);
            for (let i = 0; i < 8; i++) {
                kg.rect(i * 4 + 1, 1, 3, 13);
            }
            kg.fill(constants.keyboardColors.whiteKeyOn);
            for (let [_, note] of webmidi.midiHandler.notes) {
                if (!note.accidental) {
                    kg.push();
                    !(note.number in constants.decodeMapping) && kg.fill(constants.keyboardColors.whiteKeyError);
                    kg.rect(
                        (constants.keyPositions[note.name as keyof typeof constants.keyPositions] +
                            (note.octave - state.octaveOffset) * 7) *
                            4 +
                            1,
                        1,
                        3,
                        13
                    );
                    kg.pop();
                }
            }

            // black keys
            kg.fill(constants.keyboardColors.blackKeyOff);
            for (let i = 0; i < 6; i++) {
                i !== 2 && kg.rect(i * 4 + 3, 1, 3, 9);
            }
            kg.fill(constants.keyboardColors.blackKeyOn);
            for (let [_, note] of webmidi.midiHandler.notes) {
                if (note.accidental) {
                    kg.push();
                    !(note.number in constants.decodeMapping) && kg.fill(constants.keyboardColors.blackKeyError);
                    kg.rect(
                        (constants.keyPositions[note.name as keyof typeof constants.keyPositions] +
                            (note.octave - state.octaveOffset) * 7) *
                            4 +
                            3,
                        1,
                        3,
                        9
                    );
                    kg.pop();
                }
            }
        } else {
            fullKeyboard();
        }
    }
    kg.pop();
};

const fullKeyboard = () => {
    kg.push();
    {
        kg.fill(constants.keyboardColors.base);
        for (let j = 0; j < 127; j += 12) {
            kg.push();
            kg.translate(7 * 4 * (Math.floor(j / 12) - state.octaveOffset), 0);
            for (let i = 0; i < 7; i++) {
                kg.rect(i * 4, 0, 5, 15);
                if (j >= 120 && i === 4) break;
            }
            kg.pop();
        }

        kg.fill(constants.keyboardColors.whiteKeyOff);
        for (let j = 0; j < 127; j += 12) {
            kg.push();
            kg.translate(7 * 4 * (Math.floor(j / 12) - state.octaveOffset), 0);
            for (let i = 0; i < 7; i++) {
                kg.rect(i * 4 + 1, 1, 3, 13);
                if (j >= 120 && i === 4) break;
            }
            kg.pop();
        }
        kg.fill(constants.keyboardColors.whiteKeyOn);
        for (let [_, note] of webmidi.midiHandler.notes) {
            if (!note.accidental) {
                kg.push();
                kg.rect(
                    (constants.keyPositions[note.name as keyof typeof constants.keyPositions] +
                        (note.octave - state.octaveOffset) * 7) *
                        4 +
                        1,
                    1,
                    3,
                    13
                );
                kg.pop();
            }
        }

        kg.fill(constants.keyboardColors.blackKeyOff);
        for (let j = 0; j < 127; j += 12) {
            kg.push();
            kg.translate(7 * 4 * (Math.floor(j / 12) - state.octaveOffset), 0);
            for (let i = 0; i < 6; i++) {
                i !== 2 && kg.rect(i * 4 + 3, 1, 3, 9);
                if (j >= 120 && i === 3) break;
            }
            kg.pop();
        }
        kg.fill(constants.keyboardColors.blackKeyOn);
        for (let [_, note] of webmidi.midiHandler.notes) {
            if (note.accidental) {
                kg.push();
                kg.rect(
                    (constants.keyPositions[note.name as keyof typeof constants.keyPositions] +
                        (note.octave - state.octaveOffset) * 7) *
                        4 +
                        3,
                    1,
                    3,
                    9
                );
                kg.pop();
            }
        }
    }
    kg.pop();
};

const jaggyLine = (x0: number, y0: number, x1: number, y1: number, col: Color, tx = 0, ty = 0) => {
    x0 = x0 + tx;
    x1 = x1 + tx;
    y0 = y0 + ty;
    y1 = y1 + ty;

    kg.loadPixels();

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
        setPixel(x0, y0, col);

        if (x0 === x1 && y0 === y1) break;
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }

    kg.updatePixels();
};

const setPixel = (x: number, y: number, col: Color) => {
    x = Math.max(x, 0);
    y = Math.max(y, 0);
    const index = 4 * (y * kg.width + x);
    kg.pixels[index] = kg.red(col);
    kg.pixels[index + 1] = kg.green(col);
    kg.pixels[index + 2] = kg.blue(col);
    kg.pixels[index + 3] = kg.alpha(col);
};

const radiusList = [1, 3, 3, 3, 6, 6, 6, 10, 10, 10, 11, 11, 13, 13, 13, 14];

export const onNoteMessage = (e: NoteMessageEvent) => {
    if (e.type === "noteon") {
        {
            if (!e.note.accidental) {
                ripples.add(
                    new RippleAnimation(
                        kbOrigin.x +
                            2 +
                            (constants.keyPositions[e.note.name as keyof typeof constants.keyPositions] +
                                (e.note.octave - state.octaveOffset) * 7) *
                                4,
                        kbOrigin.y,
                        radiusList,
                        radiusList.length - 1
                    )
                );
            } else {
                ripples.add(
                    new RippleAnimation(
                        kbOrigin.x +
                            2 +
                            (constants.keyPositions[e.note.name as keyof typeof constants.keyPositions] +
                                (e.note.octave - state.octaveOffset) * 7) *
                                4 +
                            3,
                        kbOrigin.y,
                        radiusList,
                        radiusList.length - 1
                    )
                );
            }
        }
    }
};
