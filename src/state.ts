import { Graphics } from "p5";
import * as animation from "./animation";
import * as fonts from "./fonts";
import * as constants from "./constants";

let stateChangeInfos: animation.AnimationManager;

export class StateChangeInfo extends animation.Animation {
    constructor(private info: string, durationFrames: number) {
        super(durationFrames);
    }

    protected animate(canvas: Graphics, f: number) {
        canvas.push();
        {
            // 出現 0
            // 停止開始 0.19
            // 停止終了 1.3
            // 消失 1.68
            canvas.translate(0, -(constants.canvasHeight / 2) + (287 / 2 + 25));

            const tRaw = Math.min(Math.max(f / this.durationFrames, 0), 1);
            if (tRaw < 0.19 / 1.68) {
                const t = tRaw / (0.19 / 1.68);
                canvas.translate(0, canvas.lerp(-(287 + 25), 0, t));
            } else if (tRaw < 1.3 / 1.68) {
                canvas.translate(0, 0);
            } else {
                const t = (tRaw - 1.3 / 1.68) / ((1.68 - 1.3) / 1.68);
                canvas.translate(0, canvas.lerp(0, -(287 + 25 + 50), t * t * t));
            }
            canvas.push();
            {
                canvas.fill("#CBCBCA");
                canvas.rectMode(p.CENTER);
                canvas.noStroke();
                canvas.rect(0, 0, 1877, 287, 40);
            }
            canvas.pop();
            canvas.push();
            {
                canvas.translate(constants.canvasWidth / 2 - 62, 0);
                canvas.fill("#4E4E4E");
                canvas.textFont(fonts.genzen);
                canvas.textSize(38);
                canvas.textAlign(p.RIGHT);
                canvas.text(`今`, 0, -60);
            }
            canvas.pop();
            canvas.push();
            {
                canvas.translate(-(constants.canvasWidth / 2) + 62, 0);
                canvas.fill("#4E4E4E");
                canvas.textFont(fonts.genzen);
                canvas.textSize(38);
                canvas.textAlign(p.LEFT);
                canvas.text(`変更通知`, 0, -60);
            }
            canvas.pop();
            canvas.push();
            {
                canvas.translate(-(constants.canvasWidth / 2) + 62, 0);
                canvas.fill("#1D1B1C");
                canvas.textFont(fonts.genzen);
                canvas.textSize(44);
                canvas.textAlign(p.LEFT);
                canvas.textLeading(70);
                canvas.text(`教育鍵盤\n${this.info}`, 0, 22);
            }
            canvas.pop();
        }
        canvas.pop();
    }
}

export let isFullKeyboard = false;
export let isDecoding = true;
export let octaveOffset = 5;

export const toggleIsFullKeyboard = () => {
    isFullKeyboard = !isFullKeyboard;
    stateChangeInfos.add(
        new StateChangeInfo(isFullKeyboard ? "フル鍵盤に変更しました。" : "教育鍵盤に変更しました。", 1.68 * 60)
    );
};
export const toggleIsDecoding = () => {
    isDecoding = !isDecoding;
    stateChangeInfos.add(
        new StateChangeInfo(isDecoding ? "復号を有効にしました。" : "復号を無効にしました。", 1.68 * 60)
    );
};
export const setOctaveOffset = (newOctaveOffset: number) => {
    octaveOffset = newOctaveOffset;
    stateChangeInfos.add(new StateChangeInfo(`C${octaveOffset}を基準に変更しました。`, 1.68 * 60));
};

export const setup = () => {
    stateChangeInfos = new animation.AnimationManager();
};

export const draw = () => {
    stateChangeInfos.draw(p);
};
