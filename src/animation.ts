import { Graphics } from "p5";

export abstract class Animation {
    private durationFrames: number;
    private startFrame: number | null = null;
    private active = false;

    constructor(durationFrames: number) {
        this.durationFrames = durationFrames;
    }

    start(currentFrame: number) {
        this.startFrame = currentFrame;
        this.active = true;
    }

    update(canvas: Graphics) {
        if (!this.active || this.startFrame === null) return;

        const elapsed = p.frameCount - this.startFrame;
        const t = Math.min(Math.max(elapsed / this.durationFrames, 0), 1);

        this.animate(canvas, elapsed);

        if (t >= 1) {
            this.active = false;
        }
    }

    isActive() {
        return this.active;
    }

    protected abstract animate(canvas: Graphics, f: number): void;
}

export class AnimationManager {
    private animations: Animation[] = [];

    add(animation: Animation) {
        animation.start(p.frameCount);
        this.animations.push(animation);
    }

    draw(canvas: Graphics) {
        for (const anim of this.animations) {
            anim.update(canvas);
        }
        this.animations = this.animations.filter((a) => a.isActive());
    }
}
