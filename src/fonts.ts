import { Font } from "p5";

export let genzen: Font;
export let gennokaku: Font;

export const preload = () => {
    genzen = p.loadFont("GenZenGothic.ttf");
    gennokaku = p.loadFont("SourceHanSansJP-Bold.otf");
};
