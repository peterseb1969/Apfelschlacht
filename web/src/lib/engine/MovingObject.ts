import type { Apple } from './types';

export class MovingObject {
	apple: Apple;
	steps: number;
	deltaX: number;
	deltaY: number;

	constructor(destX: number, destY: number, speed: number, apple: Apple) {
		this.apple = apple;
		const dx = destX - apple.x;
		const dy = destY - apple.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		this.steps = Math.max(1, Math.floor(dist / speed));
		this.deltaX = dx / this.steps;
		this.deltaY = dy / this.steps;
	}

	move(): boolean {
		if (this.steps > 0) {
			this.steps--;
			this.apple.x += this.deltaX;
			this.apple.y += this.deltaY;
			return true;
		}
		return false;
	}
}
