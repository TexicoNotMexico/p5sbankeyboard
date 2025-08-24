import * as Tone from "tone";
import * as fonts from "./fonts";
import * as state from "./state";
import { NoteMessageEvent } from "webmidi";

export let isToneStarted: boolean;

let isKeyboardAnimating: boolean = false;
let keyboardAnimationF: number = 0;
export let keyboardScale: number = 10;
export let keyboardHeight: number = 1700;

export const toneStarter = async () => {
    if (isToneStarted) return;
    await Tone.start();
    isToneStarted = true;
    !isKeyboardAnimating && (isKeyboardAnimating = true);
    console.log("Tone.js started");
};

export let click: Tone.Sampler;
export let synth: Tone.PolySynth;

export const setup = () => {
    window.addEventListener("click", toneStarter);

    Tone.getContext().lookAhead = 0.005;

    const urls = Object.fromEntries(Array.from({ length: 128 }, (_, i) => [i, "click.wav"]));
    click = new Tone.Sampler(urls).toDestination();
    synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: "sine",
        },
        envelope: { attack: 0.005, decay: 0.1, sustain: 1, release: 0.02 },
    }).toDestination();
    synth.maxPolyphony = 128;
};

export const draw = () => {
    if (!isToneStarted) {
        p.push();
        {
            p.fill(255);
            p.textFont(fonts.genzen);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(80);
            const textBox = fonts.genzen.textBounds("画面をクリックして音声を有効にする。", 0, 0) as {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            p.rectMode(p.CORNER);
            p.rect(textBox.x - 10, textBox.y - 6, textBox.w + 10, textBox.h + 10);
            p.fill(0);
            p.text("画面をクリックして音声を有効にする。", 0, 0);
        }
        p.pop();
    }
    isKeyboardAnimating && keyboardAnimation();
};

const keyboardAnimationDuration = 120;
const keyboardAnimation = () => {
    if (keyboardAnimationF > keyboardAnimationDuration) {
        isKeyboardAnimating = false;
        return;
    }
    const elapsed = keyboardAnimationF / keyboardAnimationDuration;
    keyboardScale = p.lerp(10, 1, 1 - Math.pow(1 - elapsed, 3));
    keyboardHeight = p.lerp(1700, state.isDecoding ? 300 : 0, 1 - Math.pow(1 - elapsed, 3));
    keyboardAnimationF++;
};

export const onNoteMessage = (e: NoteMessageEvent) => {
    if (!isToneStarted) return;
    Tone.loaded().then(() => {
        if (e.type === "noteon") {
            click.triggerAttackRelease(e.note.identifier, 0.3, Tone.now(), 0.17);
            synth.triggerAttack(e.note.identifier, Tone.now(), 0.07);
        } else if (e.type === "noteoff") {
            synth.triggerRelease(e.note.identifier, Tone.now());
        }
    });
};
