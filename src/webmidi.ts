import { Note, NoteMessageEvent, WebMidi } from "webmidi";
import { Decoder } from "./decode";
import * as audio from "./audio";
import * as pixelDraw from "./pixelDraw";

export let midiHandler: MidiHandler;

export const setup = () => {
    midiHandler = new MidiHandler();

    WebMidi.enable().then((midi) => {
        console.log("WebMIDI Enabled");

        let triggered = false;

        midi.inputs.length !== 0 && console.log("Available inputs:");
        midi.inputs.forEach((input) => {
            console.log(`${input.id}: ${input.name} / ${input.manufacturer}`);

            const handler = (e: NoteMessageEvent) => {
                if (!triggered) {
                    triggered = true;
                    midi.inputs.forEach((otherInput) => {
                        if (otherInput.id !== input.id) {
                            otherInput.removeListener();
                            console.log("Listener removed: ", `${otherInput.name} / ${otherInput.manufacturer}`);
                        }
                    });
                    console.log("Locked input: ", `${input.name} / ${input.manufacturer}`);
                }
                onNoteMessageHandlers(e);
            };

            input.addListener("noteon", handler);
            input.addListener("noteoff", handler);
        });
    });
};

const onNoteMessageHandlers = (e: NoteMessageEvent) => {
    audio.onNoteMessage(e);
    midiHandler.onNoteMessage(e);
    pixelDraw.onNoteMessage(e);
};

export class MidiHandler {
    notes: Map<string, Note>;
    decoder: Decoder;

    constructor() {
        this.notes = new Map();
        this.decoder = new Decoder();
    }

    onNoteMessage = (e: NoteMessageEvent) => {
        if (e.type === "noteon") {
            this.notes.set(e.note.identifier, e.note);
            // console.log(e.note.identifier + " on"); //, e.note);
            this.decoder.onNoteOn(e.note.number);
        } else if (e.type === "noteoff") {
            this.notes.delete(e.note.identifier);
            // console.log(e.note.identifier + " off");
        }
    };
}
