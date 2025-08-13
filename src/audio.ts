import * as Tone from "tone";
import * as fonts from "./fonts";
import { NoteMessageEvent } from "webmidi";

export let isToneStarted: boolean;

export const toneStarter = async () => {
    if (isToneStarted) return;
    await Tone.start();
    isToneStarted = true;
    console.log("Tone.js started");
};

export let click: Tone.Sampler;
export let synth: Tone.PolySynth;

export const setup = () => {
    window.addEventListener("click", toneStarter);

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
            const textBox = fonts.genzen.textBounds("画面をクリックして音声を有効にする", 0, 0) as {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            p.rectMode(p.CORNER);
            p.rect(textBox.x - 5, textBox.y - 5, textBox.w + 10, textBox.h + 10);
            p.fill(0);
            p.text("画面をクリックして音声を有効にする", 0, 0);
        }
        p.pop();
    }
};

export const onNoteMessage = (e: NoteMessageEvent) => {
    if (!isToneStarted) return;
    Tone.loaded().then(() => {
        if (e.type === "noteon") {
            click.triggerAttackRelease(e.note.identifier, 0.3, Tone.now(), 0.22);
            synth.triggerAttack(e.note.identifier, Tone.now(), 0.04);
        } else if (e.type === "noteoff") {
            synth.triggerRelease(e.note.identifier, Tone.now());
        }
    });
};
