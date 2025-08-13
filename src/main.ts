import "./global.d.ts";
import "./style.css";

import p5 from "p5";
(window as any).p5 = p5;

import { draw, setup, preload, resize } from "./index";

window.onload = () => {
    new p5((p) => {
        // @ts-ignore
        window.p = p;
        p.preload = preload;
        p.setup = setup;
        p.draw = draw;
        p.windowResized = resize;
    });
};
