import Encoding from "encoding-japanese";
import * as constants from "./constants";
import { BigNumber } from "bignumber.js";

export class Decoder {
    rawNoteInputs: number[];

    constructor() {
        this.rawNoteInputs = [];
    }

    onNoteOn(note: number) {
        this.rawNoteInputs.push(note);
    }

    private getNoteInputsString(): string {
        return this.rawNoteInputs
            .filter((n) => n in constants.decodeMapping)
            .map((n) => constants.decodeMapping[n as keyof typeof constants.decodeMapping])
            .join("");
    }

    reset() {
        this.rawNoteInputs = [];
    }

    get base7() {
        return this.getNoteInputsString();
    }

    get base16() {
        const noteInputs = this.getNoteInputsString();
        //const noteInputs = "232153355351332142635200136062250566544303116634466216204110014"; honke inaku
        //const noteInputs = "232153355351332142445315366153424020513366632112050610360111046"; true inaku
        //const noteInputs = "232151400554512566345451410432344022465620511441445560323203003"; honke anshi
        //const noteInputs = "232151400554512566264644105050115063005136351366340605104666615"; true anshi
        //const noteInputs = "1065514330232626135611044153540322112113350646406006"; honke anshi2
        //const noteInputs = "1065514330232626135022654320606661511631060125565116"; true? anshi2
        if (noteInputs === "") return "";
        let base16 = BigNumber(noteInputs, 7).toString(16);
        if (base16.length % 2 === 1) {
            base16 = base16 + "0";
        }
        return base16;
    }

    get plaintext() {
        const noteInputs = this.getNoteInputsString();
        //const noteInputs = "232153355351332142635200136062250566544303116634466216204110014";
        if (noteInputs === "") return "";
        let base16 = BigNumber(noteInputs, 7).toString(16);
        if (base16.length % 2 === 1) {
            base16 = base16 + "0";
        }
        //console.log(base16);
        const bytes = base16.match(/.{1,2}/g);
        const eucjp = bytes ? bytes.map((b) => parseInt(b, 16)) : [];
        const unicode = Encoding.convert(eucjp, { from: "EUCJP", to: "UNICODE" });
        //console.log(unicode.map((b) => b.toString(16)));
        const plaintext = Encoding.codeToString(unicode);
        //console.log(plaintext)

        return plaintext;
    }

    get plaintextNoNPC() {
        const noteInputs = this.getNoteInputsString();
        //const noteInputs = "232153355351332142635200136062250566544303116634466216204110014";
        if (noteInputs === "") return "";
        let base16 = BigNumber(noteInputs, 7).toString(16);
        if (base16.length % 2 === 1) {
            base16 = base16 + "0";
        }
        const bytes = base16.match(/.{1,2}/g);
        const eucjp = bytes ? bytes.map((b) => parseInt(b, 16)) : [];
        const unicode = Encoding.convert(eucjp, { from: "EUCJP", to: "UNICODE" });
        const plaintext = visualizeText(Encoding.codeToString(unicode));

        return plaintext;
    }
}

export const eucjp2base7 = (str: string): string => {
    const eucjp = Encoding.convert(Encoding.stringToCode(str), { to: "EUCJP" });
    const base16 = eucjp.map((b) => b.toString(16).padStart(2, "0")).join("");
    const base7 = BigNumber(base16, 16).toString(7);
    return base7;
};

const visualizeText = (input: string) => {
    const replaced = input.replaceAll(/[\p{White_Space}\p{Control}\p{Format}]/gu, (char) => {
        const code = char.codePointAt(0);
        if (!code) return char;
        if (code >= 0x00 && code <= 0x1f) {
            return String.fromCharCode(0x2400 + code);
        } else if (code === 0x7f) {
            return String.fromCharCode(0x2421);
        } else if (code === 0x20) {
            return String.fromCharCode(0x2423);
        } else {
            return code.toString(16).toUpperCase().padStart(4, "0");
        }
    });
    return replaced;
};
