import { Algorithm, SPRITE_FRAME_COUNT } from '$lib/engine/constants';
import type { SimulationState } from '$lib/engine/types';
import type { SpriteSet } from './SpriteSheet';

export class CanvasRenderer {
	private ctx: CanvasRenderingContext2D;
	private sprites: SpriteSet;
	appleSize = 12;
	playerSize = 64;

	constructor(canvas: HTMLCanvasElement, sprites: SpriteSet) {
		this.ctx = canvas.getContext('2d')!;
		this.sprites = sprites;
	}

	render(state: SimulationState): void {
		const { ctx } = this;
		const { width, height } = state;

		ctx.canvas.width = width;
		ctx.canvas.height = height;

		// Green background
		ctx.fillStyle = '#228B22';
		ctx.fillRect(0, 0, width, height);

		const midX = width / 2;

		// Vertical dividing line
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(midX, 0);
		ctx.lineTo(midX, height);
		ctx.stroke();

		const as = this.appleSize;
		const ps = this.playerSize;

		// Draw apples (y is already in canvas-space, no flip needed)
		for (const apple of state.apples) {
			ctx.drawImage(
				this.sprites.apple,
				apple.x - as / 2,
				apple.y - as / 2,
				as,
				as
			);
		}

		// Draw players (hidden in combustion mode)
		if (state.algorithm !== Algorithm.SpontaneousCombustion) {
			this.drawPlayer(state.man.x, state.man.y, state.man.spriteFrame, state.man.textureOffset, 'man', ps);
			this.drawPlayer(state.boy.x, state.boy.y, state.boy.spriteFrame, state.boy.textureOffset, 'boy', ps);
		}
	}

	private drawPlayer(x: number, y: number, frame: number, textureOffset: number, who: 'man' | 'boy', size: number): void {
		const { ctx, sprites } = this;
		const frames = who === 'man' ? sprites.man : sprites.boy;
		const img = frames[frame % frames.length];
		const half = size / 2;

		// Flip horizontally if textureOffset indicates left-facing
		if (textureOffset >= SPRITE_FRAME_COUNT) {
			ctx.save();
			ctx.translate(x, y);
			ctx.scale(-1, 1);
			ctx.drawImage(img, -half, -half, size, size);
			ctx.restore();
		} else {
			ctx.drawImage(img, x - half, y - half, size, size);
		}
	}
}
