import * as state from "./state";
import * as webmidi from "./webmidi";

export const setup = () => {
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
            state.setOctaveOffset(Math.min(state.octaveOffset + 1, 9));
        } else if (e.key === "ArrowLeft") {
            state.setOctaveOffset(Math.max(state.octaveOffset - 1, 0));
        } else if (e.key === "r") {
            webmidi.midiHandler.decoder.reset();
        } else if (e.key === "f") {
            state.toggleIsFullKeyboard();
        } else if (e.key === "d") {
            state.toggleIsDecoding();
        }
    });
    // window.addEventListener("click", () => {});
};

