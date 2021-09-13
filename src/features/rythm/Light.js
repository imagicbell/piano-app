import { SCORE_PERFECT, SCORE_GOOD } from "config/settings";

export default class Light {
	constructor({ x, y, size, color }) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.color = color;
		this.state = "normal";
	}

	active(level) {
		this.state = level;
	}

	deactive() {
		this.state = "normal";
	}

	draw(context) {
		if (this.state === SCORE_PERFECT) {
			context.shadowBlur = 30;
			context.shadowColor = "#fff855";
		} else if (this.state === SCORE_GOOD) {
			context.shadowBlur = 30;
			context.shadowColor = "#1cfc66";
		}
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		context.fill();		

		context.shadowBlur = 0;
	}
}